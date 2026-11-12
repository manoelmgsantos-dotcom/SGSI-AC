import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { requireEnvironment } from './config.ts';

const databaseUrl = requireEnvironment('DATABASE_URL');

if (databaseUrl.includes('change-this-password')) {
  throw new Error('Substitua as credenciais de exemplo no arquivo .env.');
}

export const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 2500,
});

pool.on('error', () => {
  postgresOnline = false;
});

export const collections = [
  'soaControls', 'raciMatrix', 'policies', 'policyLogs', 'risks', 'ropa', 'dsar',
  'thirdParties', 'wazuhAlerts', 'assets', 'incidents', 'auditLogs',
  'evidence', 'roadmapTasks', 'campaigns', 'connectors', 'users', 'obras',
] as const;

export type Collection = typeof collections[number];
export type StoredRecord = Record<string, unknown> & { id: string | number };

let postgresOnline = false;
const currentDir = dirname(fileURLToPath(import.meta.url));
const localDbPath = resolve(currentDir, 'data', 'cybergrc-local-db.json');

export function isPostgresOnline(): boolean {
  return postgresOnline;
}

export async function readLocalDiskDB(): Promise<Record<string, unknown>> {
  try {
    const raw = await readFile(localDbPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function writeLocalDiskDB(data: Record<string, unknown>): Promise<void> {
  await mkdir(dirname(localDbPath), { recursive: true });
  await writeFile(localDbPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function checkAndInitializePostgres(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    await pool.query(
      await readFile(resolve(currentDir, 'schema.sql'), 'utf8'),
    );
    await pool.query(`
      DO $$
      BEGIN
        ALTER TABLE grc_records DROP CONSTRAINT IF EXISTS grc_records_collection_check;
        ALTER TABLE grc_records ADD CONSTRAINT grc_records_collection_check CHECK (
          collection IN (
            'soaControls', 'raciMatrix', 'policies', 'policyLogs', 'risks', 'ropa', 'dsar',
            'thirdParties', 'wazuhAlerts', 'assets', 'incidents', 'auditLogs',
            'evidence', 'roadmapTasks', 'campaigns', 'connectors', 'users', 'obras'
          )
        );
        ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check;
        ALTER TABLE app_users ADD CONSTRAINT app_users_role_check CHECK (
          role IN ('gestor_obra', 'secops', 'dpo', 'rh_sst', 'diretoria', 'auditoria', 'executivo', 'auditor')
        );
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END $$;
    `);

    const email = requireEnvironment('BOOTSTRAP_ADMIN_EMAIL').toLowerCase();
    const existingAdmin = await pool.query('SELECT 1 FROM app_users WHERE email = $1', [email]);
    if (existingAdmin.rowCount === 0) {
      const password = requireEnvironment('BOOTSTRAP_ADMIN_PASSWORD');
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        `INSERT INTO app_users (email, password_hash, role)
         VALUES ($1, $2, 'secops') ON CONFLICT (email) DO NOTHING`,
        [email, hash],
      );
    }

    // Se a tabela grc_records estiver vazia (primeira instalação na VPS), popula automaticamente com o estado limpo inicial
    const recordsCountRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM grc_records');
    const recordsCount = recordsCountRes.rows[0]?.cnt ?? 0;
    if (recordsCount === 0) {
      const initialCleanData = await readLocalDiskDB();
      for (const col of collections) {
        const items = initialCleanData[col];
        if (Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i] as Record<string, unknown>;
            const recId = String(item.id || item.code || item.week || i + 1);
            await pool.query(
              `INSERT INTO grc_records (collection, record_id, payload, sort_order)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (collection, record_id) DO NOTHING`,
              [col, recId, JSON.stringify(item), i],
            );
          }
        }
      }
    } else {
      // Migração automática: se grc_records contiver o catálogo legado (> 19 tarefas no roadmap), atualiza para o plano oficial de 19 tarefas LGPD
      try {
        const oldTasksRes = await pool.query(
          "SELECT COUNT(*)::int AS cnt FROM grc_records WHERE collection = 'roadmapTasks' AND record_id ~ '^[0-9]+$' AND record_id::int > 19"
        );
        if ((oldTasksRes.rows[0]?.cnt ?? 0) > 0) {
          await pool.query("DELETE FROM grc_records WHERE collection = 'roadmapTasks'");
          const initialCleanData = await readLocalDiskDB();
          const tasks = initialCleanData.roadmapTasks;
          if (Array.isArray(tasks)) {
            for (let i = 0; i < tasks.length; i++) {
              const item = tasks[i] as Record<string, unknown>;
              const recId = String(item.id || i + 1);
              await pool.query(
                `INSERT INTO grc_records (collection, record_id, payload, sort_order)
                 VALUES ('roadmapTasks', $1, $2, $3)
                 ON CONFLICT (collection, record_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
                [recId, JSON.stringify(item), i],
              );
            }
          }
        }
      } catch {
        // Ignora silenciosamente
      }
    }

    postgresOnline = true;
    return true;
  } catch {
    postgresOnline = false;
    return false;
  }
}

export async function initializeDatabase() {
  const connected = await checkAndInitializePostgres();
  if (connected) {
    console.log('✅ [CyberGRC] Conectado com sucesso ao PostgreSQL na porta 5432.');
  } else {
    console.log('ℹ️ [CyberGRC] PostgreSQL ainda não conectado na porta 5432. Operando com persistência local em disco (server/data/cybergrc-local-db.json) até a inicialização do banco.');
  }
}

export interface AuditLogEntry {
  category: 'AUTENTICACAO_SUCESSO' | 'AUTENTICACAO_FALHA' | 'CONTROLE_ACESSO' | 'CONFIGURACAO' | string;
  module: string;
  action: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  actor: string;
  target_module: string;
  description: string;
  ip: string;
}

export async function appendAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const id = `BLK-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Obter hash do último registro para encadeamento criptográfico Merkle
    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
    let sortOrder = 0;

    if (postgresOnline) {
      try {
        const lastRow = await pool.query(
          "SELECT payload, sort_order FROM grc_records WHERE collection = 'auditLogs' ORDER BY sort_order DESC, created_at DESC LIMIT 1"
        );
        if (lastRow.rows[0]) {
          const lastPayload = typeof lastRow.rows[0].payload === 'string'
            ? JSON.parse(lastRow.rows[0].payload)
            : lastRow.rows[0].payload;
          prevHash = lastPayload.hash || lastPayload.prev_hash || prevHash;
          sortOrder = (Number(lastRow.rows[0].sort_order) || 0) + 1;
        }
      } catch {
        // Fallback silencioso em caso de erro na consulta
      }
    }

    const hash = createHash('sha256')
      .update(`${id}|${timestamp}|${entry.category}|${entry.actor}|${entry.action}|${entry.ip}|${prevHash}`)
      .digest('hex');

    const logPayload = {
      id,
      timestamp,
      role: entry.severity === 'CRITICAL' ? 'Alerta Forense' : 'Sistema SGSI',
      category: entry.category,
      module: entry.module,
      action: entry.action,
      severity: entry.severity,
      actor: entry.actor,
      target_module: entry.target_module,
      description: entry.description,
      ip: entry.ip,
      previousHash: prevHash,
      prev_hash: prevHash,
      hash,
    };

    if (postgresOnline) {
      await pool.query(
        `INSERT INTO grc_records (collection, record_id, payload, sort_order, created_at, updated_at)
         VALUES ('auditLogs', $1, $2, $3, NOW(), NOW())
         ON CONFLICT (collection, record_id) DO NOTHING`,
        [id, JSON.stringify(logPayload), sortOrder]
      );
    }

    // Persiste também no armazenamento local em disco
    const localDb = await readLocalDiskDB();
    if (!Array.isArray(localDb.auditLogs)) {
      localDb.auditLogs = [];
    }
    (localDb.auditLogs as Array<unknown>).push(logPayload);
    if (localDb.auditLogs.length > 1000) {
      localDb.auditLogs = localDb.auditLogs.slice(-1000);
    }
    await writeLocalDiskDB(localDb).catch(() => {});
  } catch (err) {
    console.warn('Aviso: falha ao persistir auditLog forense:', err);
  }
}
