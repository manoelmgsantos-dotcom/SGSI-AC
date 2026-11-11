import { readFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import { resolve } from 'node:path';
import bcrypt from 'bcryptjs';
import express, { type NextFunction, type Request, type Response } from 'express';
import session from 'express-session';
import { type PoolClient } from 'pg';
import { sessionSecret } from './config.ts';
import {
  checkAndInitializePostgres,
  collections,
  initializeDatabase,
  isPostgresOnline,
  pool,
  readLocalDiskDB,
  writeLocalDiskDB,
  type StoredRecord,
} from './database.ts';
import { asyncRoute, HttpError, requireSameOrigin } from './http.ts';
import { replaceCollectionBatch, withTransaction } from './records.ts';
import {
  apiRateLimiter,
  checkLoginBruteForce,
  clearLoginFailures,
  getAuthenticatedUser,
  issueAuthToken,
  recordLoginFailure,
  requireAdminRole,
  requireAuth,
  requestSanitizerMiddleware,
  revokeAuthToken,
  sanitizeSnapshotData,
  sanitizeUserRecord,
  sanitizeUsersArray,
  securityHeadersMiddleware,
  verifyGoogleCredentialToken,
} from './security.ts';

const app = express();
app.disable('x-powered-by');
const VALID_ROLES = new Set([
  'gestor_obra', 'secops', 'dpo', 'rh_sst', 'diretoria', 'auditoria', 'executivo', 'auditor',
]);

// Cache em memória de hashes bcrypt para evitar recomputação pesada de CPU em sincronizações repetidas
const passwordHashCache = new Map<string, { raw: string; hash: string }>();

async function syncAppUsersTable(client: PoolClient, users: unknown[]) {
  if (!Array.isArray(users)) return;
  for (const rawItem of users) {
    if (!rawItem || typeof rawItem !== 'object') continue;
    const item = rawItem as Record<string, unknown>;
    if (!item.email) continue;

    const uEmail = String(item.email).toLowerCase().trim();
    let uRole = String(item.role || 'secops').toLowerCase().trim();
    if (!VALID_ROLES.has(uRole)) uRole = 'secops';
    const uActive = item.status === 'Ativo' || item.status === 'Convite Pendente';

    // Se nenhuma senha explícita foi enviada na requisição, preserva o hash existente no PostgreSQL
    if (!item.password) {
      await client.query(
        `INSERT INTO app_users (email, password_hash, role, active, created_at, updated_at)
         VALUES ($1, 'INVITED_GOOGLE_SSO', $2, $3, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE
         SET role = EXCLUDED.role,
             active = EXCLUDED.active,
             updated_at = NOW()`,
        [uEmail, uRole, uActive],
      );
      continue;
    }

    const rawPassword = String(item.password);
    let cached = passwordHashCache.get(uEmail);
    if (!cached || cached.raw !== rawPassword) {
      const hash = rawPassword.startsWith('$2a$') || rawPassword.startsWith('$2b$')
        ? rawPassword
        : await bcrypt.hash(rawPassword, 10);
      cached = { raw: rawPassword, hash };
      passwordHashCache.set(uEmail, cached);
    }

    await client.query(
      `INSERT INTO app_users (email, password_hash, role, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = EXCLUDED.role,
           active = EXCLUDED.active,
           updated_at = NOW()`,
      [uEmail, cached.hash, uRole, uActive],
    );
  }
}

app.set('trust proxy', 1);
app.use(securityHeadersMiddleware);
app.use('/api', apiRateLimiter(300));
app.use(express.json({ limit: '5mb' }));
app.use(requestSanitizerMiddleware);
app.use((request, response, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    next();
    return;
  }
  requireSameOrigin(request, response, next);
});
app.use(session({
  name: 'cybergrc.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  },
}));

function getNetworkAccessUrls() {
  let tunnelUrl: string | null = null;
  try {
    const rawTunnel = readFileSync(resolve('current-tunnel-url.txt'), 'utf8').trim();
    if (rawTunnel.startsWith('https://')) tunnelUrl = rawTunnel;
  } catch {
    tunnelUrl = null;
  }

  let lanUrl: string | null = null;
  try {
    const nets = networkInterfaces();
    for (const [name, iface] of Object.entries(nets)) {
      if (!iface || /vethernet|virtualbox|vmware|loopback/i.test(name)) continue;
      for (const addr of iface) {
        if (
          addr.family === 'IPv4' &&
          !addr.internal &&
          !addr.address.startsWith('169.254.') &&
          addr.address !== '192.168.56.1'
        ) {
          lanUrl = `http://${addr.address}:${process.env.APP_PORT || '4300'}`;
          break;
        }
      }
      if (lanUrl) break;
    }
  } catch {
    lanUrl = null;
  }

  return { tunnelUrl, lanUrl };
}

app.get('/api/health', asyncRoute(async (_request, response) => {
  let pgUp = isPostgresOnline();
  if (!pgUp) {
    pgUp = await checkAndInitializePostgres();
  } else {
    try {
      await pool.query('SELECT 1');
    } catch {
      pgUp = false;
    }
  }
  const { tunnelUrl, lanUrl } = getNetworkAccessUrls();
  response.json({
    status: 'ok',
    postgresOnline: pgUp,
    engine: pgUp ? 'PostgreSQL' : 'Banco Local em Disco (JSON Fallback)',
    tunnelUrl,
    lanUrl,
    timestamp: new Date().toISOString(),
  });
}));

app.get('/api/sync', asyncRoute(async (_request, response) => {
  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();
  const { tunnelUrl, lanUrl } = getNetworkAccessUrls();

  if (pgUp) {
    try {
      const result = await pool.query(
        'SELECT collection, payload FROM grc_records ORDER BY collection, sort_order, created_at',
      );
      if ((result.rowCount ?? 0) > 0) {
        const pgData: Record<string, StoredRecord[]> = {};
        for (const collection of collections) pgData[collection] = [];
        for (const row of result.rows) {
          if (pgData[row.collection]) {
            if (row.collection === 'users') {
              const cleanUser = sanitizeUserRecord(row.payload);
              if (cleanUser) pgData.users.push(cleanUser as StoredRecord);
            } else {
              pgData[row.collection].push(row.payload);
            }
          }
        }
        response.json({
          status: 'ok',
          engine: 'PostgreSQL',
          postgresOnline: true,
          tunnelUrl,
          lanUrl,
          hasData: true,
          snapshot: pgData,
        });
        return;
      }
    } catch {
      // Fallback para disco local
    }
  }

  const diskData = sanitizeSnapshotData(await readLocalDiskDB());
  const hasDiskData = Object.keys(diskData).length > 0;
  response.json({
    status: 'ok',
    engine: pgUp ? 'PostgreSQL' : 'Banco Local em Disco',
    postgresOnline: pgUp,
    tunnelUrl,
    lanUrl,
    hasData: hasDiskData,
    snapshot: diskData,
  });
}));

app.post('/api/sync', requireAuth, asyncRoute(async (request, response) => {
  const rawSnapshot = request.body?.snapshot;
  if (!rawSnapshot || typeof rawSnapshot !== 'object') {
    throw new HttpError(400, 'Snapshot inválido para sincronização.');
  }

  // Preserva senhas enviadas apenas para sincronizar hashes na tabela app_users antes de removê-las do snapshot
  const rawUsersWithPass = Array.isArray(rawSnapshot.users) ? rawSnapshot.users : [];
  const snapshot = sanitizeSnapshotData(rawSnapshot as Record<string, unknown>);

  await writeLocalDiskDB(snapshot);

  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();

  let syncedRecordsCount = 0;
  if (pgUp) {
    try {
      await withTransaction(async client => {
        for (const collection of collections) {
          const items = snapshot[collection];
          if (!Array.isArray(items)) continue;
          syncedRecordsCount += await replaceCollectionBatch(client, collection, items);
          if (collection === 'users') {
            await syncAppUsersTable(client, rawUsersWithPass);
          }
        }
      });
    } catch (err) {
      console.warn('Aviso ao sincronizar lote com PostgreSQL:', err);
    }
  }

  response.json({
    status: 'ok',
    postgresOnline: pgUp,
    engine: pgUp ? 'PostgreSQL' : 'Banco Local em Disco',
    syncedRecordsCount,
    savedAt: new Date().toISOString(),
  });
}));

app.get('/api/users', asyncRoute(async (_request, response) => {
  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();
  if (pgUp) {
    try {
      const result = await pool.query(
        "SELECT payload FROM grc_records WHERE collection = 'users' ORDER BY sort_order, created_at",
      );
      if ((result.rowCount ?? 0) > 0) {
        response.json({
          users: sanitizeUsersArray(result.rows.map(r => r.payload)),
          postgresOnline: true,
        });
        return;
      }
    } catch {}
  }
  const diskData = await readLocalDiskDB();
  const users = Array.isArray(diskData.users) ? sanitizeUsersArray(diskData.users) : [];
  response.json({ users, postgresOnline: pgUp });
}));

app.post('/api/users', requireAdminRole, asyncRoute(async (request, response) => {
  const rawUsers = request.body?.users;
  if (!Array.isArray(rawUsers)) {
    throw new HttpError(400, 'Lista de usuários inválida.');
  }

  const sanitizedUsers = sanitizeUsersArray(rawUsers);

  const diskData = await readLocalDiskDB();
  diskData.users = sanitizedUsers;
  await writeLocalDiskDB(diskData);

  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();
  if (pgUp) {
    try {
      await withTransaction(async client => {
        await replaceCollectionBatch(client, 'users', sanitizedUsers, 'usr');
        await syncAppUsersTable(client, rawUsers);
      });
    } catch (err) {
      console.warn('Aviso ao sincronizar usuários com PostgreSQL:', err);
    }
  }

  response.json({ status: 'ok', count: sanitizedUsers.length, postgresOnline: pgUp });
}));

app.delete('/api/users/:id', requireAdminRole, asyncRoute(async (request, response) => {
  const userId = String(request.params.id || '').trim();
  if (!userId) throw new HttpError(400, 'ID do usuário obrigatório.');

  // Impede auto-exclusão ou exclusão do Administrador Principal
  if (userId === 'usr-admin' || userId.toLowerCase() === 'manoelmgsantos@acengenhariase.com.br') {
    throw new HttpError(403, 'Operação bloqueada: O Administrador Principal do SGSI não pode ser excluído.');
  }

  const diskData = await readLocalDiskDB();
  let userEmail = '';
  if (Array.isArray(diskData.users)) {
    const target = (diskData.users as Array<Record<string, unknown>>).find(
      u => u.id === userId || u.email === userId,
    );
    if (target && typeof target.email === 'string') userEmail = target.email;
    diskData.users = (diskData.users as Array<Record<string, unknown>>).filter(
      u => u.id !== userId && u.email !== userId,
    );
    await writeLocalDiskDB(diskData);
  }

  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();
  if (pgUp) {
    try {
      await withTransaction(async client => {
        const res = await client.query(
          "SELECT payload->>'email' as email FROM grc_records WHERE collection = 'users' AND (record_id = $1 OR payload->>'email' = $1)",
          [userId],
        );
        const email = res.rows[0]?.email || userEmail;
        await client.query(
          "DELETE FROM grc_records WHERE collection = 'users' AND (record_id = $1 OR payload->>'email' = $1)",
          [userId],
        );
        if (email) {
          const normalized = String(email).toLowerCase().trim();
          passwordHashCache.delete(normalized);
          await client.query('DELETE FROM app_users WHERE email = $1', [normalized]);
        }
      });
    } catch (err) {
      console.warn('Aviso ao excluir usuário do PostgreSQL:', err);
    }
  }

  response.json({ status: 'ok', deletedId: userId, postgresOnline: pgUp });
}));

app.get('/api/obras', asyncRoute(async (_request, response) => {
  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();
  if (pgUp) {
    try {
      const result = await pool.query(
        "SELECT payload FROM grc_records WHERE collection = 'obras' ORDER BY sort_order, created_at",
      );
      if ((result.rowCount ?? 0) > 0) {
        response.json({ obras: result.rows.map(r => r.payload), postgresOnline: true });
        return;
      }
    } catch {}
  }
  const diskData = await readLocalDiskDB();
  const obras = Array.isArray(diskData.obras) ? diskData.obras : [];
  response.json({ obras, postgresOnline: pgUp });
}));

app.post('/api/obras', requireAuth, asyncRoute(async (request, response) => {
  const obras = request.body?.obras;
  if (!Array.isArray(obras)) {
    throw new HttpError(400, 'Lista de obras inválida.');
  }

  const diskData = await readLocalDiskDB();
  diskData.obras = obras;
  await writeLocalDiskDB(diskData);

  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();
  if (pgUp) {
    try {
      await withTransaction(async client => {
        await replaceCollectionBatch(client, 'obras', obras, 'OBRA');
      });
    } catch (err) {
      console.warn('Aviso ao sincronizar obras com PostgreSQL:', err);
    }
  }

  response.json({ status: 'ok', count: obras.length, postgresOnline: pgUp });
}));

app.delete('/api/obras/:id', requireAuth, asyncRoute(async (request, response) => {
  const obraId = String(request.params.id || '').trim();
  if (!obraId) throw new HttpError(400, 'ID da obra obrigatório.');

  if (obraId === 'MATRIZ-001' || obraId.toLowerCase() === 'sede') {
    throw new HttpError(403, 'Operação bloqueada: O Escritório Central (Matriz) não pode ser removido.');
  }

  const diskData = await readLocalDiskDB();
  if (Array.isArray(diskData.obras)) {
    diskData.obras = (diskData.obras as Array<Record<string, unknown>>).filter(
      o => o.id !== obraId && o.name !== obraId,
    );
    await writeLocalDiskDB(diskData);
  }

  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();
  if (pgUp) {
    try {
      await pool.query(
        "DELETE FROM grc_records WHERE collection = 'obras' AND (record_id = $1 OR payload->>'name' = $1)",
        [obraId],
      );
    } catch (err) {
      console.warn('Aviso ao excluir obra do PostgreSQL:', err);
    }
  }

  response.json({ status: 'ok', deletedId: obraId, postgresOnline: pgUp });
}));

app.post('/api/admin/reset-database', requireAdminRole, asyncRoute(async (_request, response) => {
  const { CLEAN_DATABASE_SNAPSHOT } = await import('../scripts/reset-db.mjs');
  const sanitizedSnapshot = sanitizeSnapshotData(CLEAN_DATABASE_SNAPSHOT as Record<string, unknown>);

  await writeLocalDiskDB(sanitizedSnapshot);

  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();
  if (pgUp) {
    try {
      await pool.query("DELETE FROM app_users WHERE LOWER(email) <> 'manoelmgsantos@acengenhariase.com.br';");
      await pool.query('TRUNCATE TABLE grc_records;');
      for (const [collection, items] of Object.entries(sanitizedSnapshot)) {
        if (collection === 'meta') continue;
        if (Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i] as Record<string, unknown>;
            const id = String(item.id || item.code || item.week || i + 1);
            await pool.query(
              `INSERT INTO grc_records (collection, record_id, payload, sort_order)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (collection, record_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
              [collection, id, JSON.stringify(item), i]
            );
          }
        }
      }
    } catch (err) {
      console.warn('Aviso ao resetar PostgreSQL:', err);
    }
  }

  response.json({
    status: 'ok',
    message: 'Base de dados zerada com sucesso.',
    postgresOnline: pgUp,
  });
}));

app.post('/api/auth/login', asyncRoute(async (request, response) => {
  const email = String(request.body?.email ?? '').trim().toLowerCase();
  const password = String(request.body?.password ?? '');
  if (!email || !password) throw new HttpError(400, 'Informe e-mail e senha.');

  // 1. Proteção contra ataques de força bruta (bloqueio após 5 falhas em 15 min)
  checkLoginBruteForce(request, email);

  // 2. Login por senha é restrito exclusivamente ao Administrador Principal de Configuração
  const masterAdminEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || 'manoelmgsantos@acengenhariase.com.br').toLowerCase().trim();
  if (email !== masterAdminEmail) {
    recordLoginFailure(request, email);
    throw new HttpError(
      403,
      'Acesso negado: o login por senha é exclusivo para o Administrador Principal. Colaboradores devem autenticar via Google Workspace.',
    );
  }

  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();

  let authenticatedUser: { id: number | string; email: string; role: string } | null = null;
  let fullUserProfile: Record<string, unknown> | null = null;

  if (pgUp) {
    const result = await pool.query(
      'SELECT id, email, password_hash, role FROM app_users WHERE LOWER(email) = $1 AND active = TRUE',
      [email],
    );
    const dbUser = result.rows[0];
    if (dbUser && (await bcrypt.compare(password, dbUser.password_hash))) {
      authenticatedUser = { id: Number(dbUser.id), email: dbUser.email, role: dbUser.role };
      const profileRes = await pool.query(
        "SELECT payload FROM grc_records WHERE collection = 'users' AND LOWER(payload->>'email') = $1 LIMIT 1",
        [email],
      );
      if (profileRes.rows[0]?.payload) {
        fullUserProfile = sanitizeUserRecord(profileRes.rows[0].payload);
      }
    }
  } else {
    // Fallback criptográfico quando PostgreSQL estiver offline
    const expectedMasterPass = process.env.BOOTSTRAP_ADMIN_PASSWORD || '@Ac123456';
    const expectedHash = await bcrypt.hash(expectedMasterPass, 10);
    if (await bcrypt.compare(password, expectedHash)) {
      authenticatedUser = { id: 1, email, role: 'secops' };
      const diskData = await readLocalDiskDB();
      if (Array.isArray(diskData.users)) {
        const found = (diskData.users as Array<Record<string, unknown>>).find(
          u => String(u.email || '').toLowerCase() === email,
        );
        if (found) fullUserProfile = sanitizeUserRecord(found);
      }
    }
  }

  if (!authenticatedUser) {
    recordLoginFailure(request, email);
    throw new HttpError(401, 'Credenciais de Administrador inválidas.');
  }

  clearLoginFailures(request, email);

  await new Promise<void>((resolvePromise, reject) => {
    request.session.regenerate(error => (error ? reject(error) : resolvePromise()));
  });

  const role = (authenticatedUser.role || 'secops') as any;
  request.session.user = { id: Number(authenticatedUser.id) || 1, email: authenticatedUser.email, role };
  const token = issueAuthToken({ id: authenticatedUser.id, email: authenticatedUser.email, role });

  response.json({
    status: 'ok',
    token,
    user: fullUserProfile || {
      id: 'usr-admin',
      name: 'Manoel Martins',
      email: authenticatedUser.email,
      role,
      roleName: 'Administrador Geral & SecOps SGSI',
      department: 'Diretoria de Tecnologia & Governança SGSI',
      location: 'Escritório Central (Matriz)',
      avatar: 'MM',
      status: 'Ativo',
      isSuperAdmin: true,
    },
  });
}));

app.post('/api/auth/logout', asyncRoute(async (request, response) => {
  const headerToken =
    request.get('x-cybergrc-token') ||
    (request.get('authorization')?.startsWith('Bearer ')
      ? request.get('authorization')!.slice(7).trim()
      : null);
  if (headerToken) {
    revokeAuthToken(headerToken);
  }

  await new Promise<void>(resolvePromise => {
    if (!request.session) {
      resolvePromise();
      return;
    }
    request.session.destroy(() => resolvePromise());
  });

  response.clearCookie('cybergrc.sid');
  response.json({ status: 'ok', message: 'Sessão encerrada com segurança.' });
}));

app.get('/api/auth/session', asyncRoute(async (request, response) => {
  const user = getAuthenticatedUser(request);
  if (!user) {
    response.json({ authenticated: false, user: null });
    return;
  }
  response.json({ authenticated: true, user });
}));

app.post('/api/users/invite', requireAdminRole, asyncRoute(async (request, response) => {
  const { name, email, role, department, location, responsibilities } = request.body || {};
  if (!email || !email.includes('@')) {
    throw new HttpError(400, 'E-mail corporativo obrigatório.');
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const domain = cleanEmail.split('@')[1];
  const allowedDomains = ['acengenhariase.com.br', 'acengenhariase.com', 'acengenharia.com.br'];
  if (!allowedDomains.includes(domain)) {
    throw new HttpError(400, `O e-mail deve pertencer aos domínios corporativos autorizados: ${allowedDomains.join(', ')}`);
  }

  const roleKey = role || 'gestor_obra';
  const roleNameMap: Record<string, string> = {
    gestor_obra: 'Engenheiro Residente / Obras',
    secops: 'Gestor de T.I. & SecOps',
    dpo: 'DPO & Encarregado(a) Geral',
    rh_sst: 'RH & SST (NR-18)',
    diretoria: 'Diretoria Executiva / C-Level',
    auditoria: 'Auditor Líder ISO 27001'
  };

  const inviteUser = sanitizeUserRecord({
    id: `usr-inv-${Date.now().toString(36)}`,
    name: name || cleanEmail.split('@')[0],
    email: cleanEmail,
    role: roleKey,
    roleName: roleNameMap[roleKey] || 'Colaborador SGSI',
    department: department || 'Engenharia de Obras',
    location: location || 'Escritório Central (Matriz)',
    status: 'Convite Pendente',
    invitedAt: new Date().toISOString(),
    responsibilities: Array.isArray(responsibilities) ? responsibilities : []
  })!;

  const diskData = await readLocalDiskDB();
  if (!Array.isArray(diskData.users)) diskData.users = [];
  const existingIdx = (diskData.users as Array<Record<string, unknown>>).findIndex(
    u => String(u.email).toLowerCase() === cleanEmail
  );
  if (existingIdx !== -1) {
    (diskData.users as Array<Record<string, unknown>>)[existingIdx] = inviteUser;
  } else {
    (diskData.users as Array<Record<string, unknown>>).push(inviteUser);
  }
  await writeLocalDiskDB(diskData);

  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();
  if (pgUp) {
    try {
      await withTransaction(async client => {
        await client.query(
          `INSERT INTO grc_records (collection, record_id, payload, sort_order)
           VALUES ('users', $1, $2, 0)
           ON CONFLICT (collection, record_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
          [inviteUser.id, JSON.stringify(inviteUser)]
        );
        await client.query(
          `INSERT INTO app_users (email, password_hash, role, active)
           VALUES ($1, 'INVITED_GOOGLE_SSO', $2, TRUE)
           ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, updated_at = NOW()`,
          [cleanEmail, roleKey]
        );
      });
    } catch (err) {
      console.warn('Aviso ao registrar convite no PostgreSQL:', err);
    }
  }

  response.json({ status: 'ok', user: inviteUser });
}));

app.post('/api/auth/google', asyncRoute(async (request, response) => {
  let email = String(request.body?.email ?? '').trim().toLowerCase();
  let name = String(request.body?.name ?? '').trim();
  let picture = request.body?.picture ? String(request.body.picture) : null;
  const credentialJwt = request.body?.credential ? String(request.body.credential).trim() : null;

  // Se um ID Token JWT do Google foi enviado, valida criptograficamente junto ao Google
  if (credentialJwt) {
    const verifiedGoogle = await verifyGoogleCredentialToken(credentialJwt);
    if (!verifiedGoogle) {
      throw new HttpError(401, 'Token de credencial do Google inválido ou expirado.');
    }
    email = verifiedGoogle.email;
    name = verifiedGoogle.name;
    picture = verifiedGoogle.picture;
  }

  if (!email || !email.includes('@')) {
    throw new HttpError(400, 'E-mail corporativo inválido.');
  }

  checkLoginBruteForce(request, email);

  // Validação de domínios corporativos autorizados da AC Engenharia
  const allowedDomains = ['acengenhariase.com.br', 'acengenhariase.com', 'acengenharia.com.br'];
  const domain = email.split('@')[1];
  if (!allowedDomains.includes(domain)) {
    recordLoginFailure(request, email);
    throw new HttpError(403, `Acesso negado: domínio @${domain} não autorizado.`);
  }

  let pgUp = isPostgresOnline();
  if (!pgUp) pgUp = await checkAndInitializePostgres();

  let user: Record<string, unknown> | null = null;
  let wasInviteAccepted = false;

  // 1. O Administrador Principal sempre tem acesso concedido
  const isSuperAdmin = email === 'manoelmgsantos@acengenhariase.com.br';

  if (pgUp) {
    try {
      const recRes = await pool.query(
        "SELECT record_id, payload FROM grc_records WHERE collection = 'users' AND LOWER(payload->>'email') = $1",
        [email]
      );
      if (recRes.rows.length > 0) {
        user = sanitizeUserRecord(recRes.rows[0].payload);
        // Se estava com convite pendente, atualiza para Ativo!
        if (user && user.status === 'Convite Pendente') {
          user.status = 'Ativo';
          user.acceptedInviteAt = new Date().toISOString();
          if (name && (!user.name || user.name === email.split('@')[0])) user.name = name;
          if (picture) user.picture = picture;
          wasInviteAccepted = true;
          await pool.query(
            "UPDATE grc_records SET payload = $1, updated_at = NOW() WHERE collection = 'users' AND record_id = $2",
            [JSON.stringify(user), recRes.rows[0].record_id]
          );
        }
      } else {
        const uRes = await pool.query(
          'SELECT id, email, role, active FROM app_users WHERE LOWER(email) = $1',
          [email]
        );
        if (uRes.rows.length > 0) {
          user = uRes.rows[0];
        }
      }
    } catch (err) {
      console.warn('Aviso ao consultar usuário no PostgreSQL:', err);
    }
  }

  if (!user) {
    const diskData = await readLocalDiskDB();
    if (Array.isArray(diskData.users)) {
      const found = (diskData.users as Array<Record<string, unknown>>).find(
        u => String(u.email).toLowerCase() === email
      );
      if (found) {
        user = sanitizeUserRecord(found);
        if (user && user.status === 'Convite Pendente') {
          user.status = 'Ativo';
          user.acceptedInviteAt = new Date().toISOString();
          if (name && (!user.name || user.name === email.split('@')[0])) user.name = name;
          if (picture) user.picture = picture;
          wasInviteAccepted = true;
          await writeLocalDiskDB(diskData);
        }
      }
    }
  }

  // Se não é o SuperAdmin e não foi encontrado nenhum registro prévio de convite: BLOQUEIA!
  if (!user && !isSuperAdmin) {
    recordLoginFailure(request, email);
    throw new HttpError(
      403,
      `Acesso não autorizado: o e-mail corporativo (${email}) ainda não possui um convite cadastrado pelo Administrador. Solicite seu convite de acesso.`
    );
  }

  // Se usuário foi encontrado mas está explicitamente inativo ou bloqueado:
  if (user && (user.status === 'Inativo' || user.status === 'Bloqueado')) {
    recordLoginFailure(request, email);
    throw new HttpError(
      403,
      `Acesso bloqueado: esta conta corporativa está desativada no SGSI. Contate o Administrador.`
    );
  }

  // Se for o SuperAdmin acessando pela primeira vez sem registro prévio
  if (!user && isSuperAdmin) {
    user = {
      id: 'usr-admin',
      name: name || 'Manoel Martins',
      email: email,
      role: 'secops',
      roleName: 'Administrador Geral & SecOps SGSI',
      status: 'Ativo',
      isSuperAdmin: true
    };
  }

  clearLoginFailures(request, email);

  const role = String(user?.role || 'secops');
  await new Promise<void>((resolvePromise, reject) => {
    request.session.regenerate(error => error ? reject(error) : resolvePromise());
  });
  request.session.user = { id: 1, email, role: role as any };
  const token = issueAuthToken({ id: String(user?.id || 1), email, role });
  const cleanUser = sanitizeUserRecord({ ...user, email, role });

  response.json({
    status: 'ok',
    token,
    user: cleanUser,
    wasInviteAccepted,
    postgresOnline: pgUp
  });
}));

if (process.env.NODE_ENV === 'production') {
  const distPath = resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (request, response, next) => {
    if (request.path.startsWith('/api/')) {
      next();
      return;
    }
    response.sendFile(resolve(distPath, 'index.html'));
  });
}

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message });
    return;
  }
  console.error('Erro na API CyberGRC:', error);
  response.status(500).json({ error: 'Erro interno do servidor.' });
});

const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4301);
initializeDatabase()
  .then(() => app.listen(port, process.env.API_HOST ?? '0.0.0.0', () => {
    console.log(`API CyberGRC disponível na porta ${port}.`);
  }))
  .catch(error => {
    console.error('Não foi possível iniciar a API CyberGRC:', error);
    process.exitCode = 1;
  });
