import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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
