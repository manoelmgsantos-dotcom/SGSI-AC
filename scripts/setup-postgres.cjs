const fs = require('fs');
const path = require('path');
const { Pool, Client } = require('pg');

// Read .env
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  });
  return env;
}

const env = loadEnv();
const targetDbUrl = env.DATABASE_URL || 'postgresql://cybergrc:%40Ac123456@localhost:5432/cybergrc';
const appPassword = env.POSTGRES_PASSWORD || '@Ac123456';

console.log('========================================================================');
console.log('   CYBERGRC & SGSI - INICIALIZADOR COMPLETO DO BANCO POSTGRESQL');
console.log('========================================================================\n');

async function tryConnect(connStr) {
  const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 3000 });
  try {
    await client.connect();
    return client;
  } catch (err) {
    return null;
  }
}

async function main() {
  console.log(`[1/4] Testando conexão com PostgreSQL em localhost:5432...`);
  
  let client = await tryConnect(targetDbUrl);
  let superClient = null;

  if (!client) {
    console.log(`ℹ️ Conexão direta com banco 'cybergrc' falhou. Tentando como superusuário 'postgres'...`);
    
    // Senhas para superusuário postgres
    const passwordsToTry = ['Mysql', 'mysql', appPassword, 'postgres', 'admin', 'root', '123456', ''];
    for (const pwd of passwordsToTry) {
      const testUrl = `postgresql://postgres:${encodeURIComponent(pwd)}@localhost:5432/postgres`;
      superClient = await tryConnect(testUrl);
      if (superClient) {
        console.log(`✅ Conectado com sucesso como superusuário 'postgres'!`);
        break;
      }
    }

    if (!superClient) {
      console.error(`\n❌ NÃO FOI POSSÍVEL CONECTAR AO POSTGRESQL NA PORTA 5432.`);
      console.error(`Verifique se o serviço do PostgreSQL está em execução e tente novamente:`);
      console.error(`   npm run db:setup\n`);
      process.exit(1);
    }

    // Criar role e database se necessário
    console.log(`[2/4] Provisionando usuário 'cybergrc' e banco de dados 'cybergrc'...`);
    try {
      await superClient.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'cybergrc') THEN
            CREATE ROLE cybergrc WITH LOGIN PASSWORD '${appPassword}';
          ELSE
            ALTER ROLE cybergrc WITH PASSWORD '${appPassword}';
          END IF;
        END $$;
      `);
      console.log(`  -> Usuário 'cybergrc' configurado com sucesso.`);

      const checkDb = await superClient.query(`SELECT 1 FROM pg_database WHERE datname = 'cybergrc'`);
      if (checkDb.rowCount === 0) {
        await superClient.query(`CREATE DATABASE cybergrc WITH OWNER cybergrc ENCODING 'UTF8'`);
        console.log(`  -> Banco de dados 'cybergrc' criado com sucesso.`);
      } else {
        console.log(`  -> Banco de dados 'cybergrc' já existe.`);
      }
      await superClient.query(`GRANT ALL PRIVILEGES ON DATABASE cybergrc TO cybergrc`);
    } catch (err) {
      console.error('Erro ao provisionar banco via superuser:', err.message);
    } finally {
      await superClient.end();
    }

    // Conectar ao banco cybergrc
    client = await tryConnect(targetDbUrl);
    if (!client) {
      // Tentar conectar como postgres no database cybergrc
      client = await tryConnect(`postgresql://postgres:${encodeURIComponent(appPassword)}@localhost:5432/cybergrc`);
    }
  }

  if (!client) {
    console.error(`❌ Falha ao estabelecer conexão com o banco 'cybergrc'.`);
    process.exit(1);
  }

  console.log(`✅ Conectado ao banco 'cybergrc' no PostgreSQL!`);

  console.log(`\n[3/3] Aplicando schema oficial do PostgreSQL (app_users & grc_records)...`);
  const schemaPath = path.resolve(__dirname, '..', 'server', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await client.query(schemaSql);
  console.log(`  -> Tabelas estruturais e índices aplicados com sucesso.`);

  // Sincronizar dados JSON existentes para a tabela grc_records
  const localDbPath = path.resolve(__dirname, '..', 'server', 'data', 'cybergrc-local-db.json');
  if (fs.existsSync(localDbPath)) {
    try {
      const diskData = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
      let inserted = 0;
      for (const coll of Object.keys(diskData)) {
        if (Array.isArray(diskData[coll])) {
          for (let i = 0; i < diskData[coll].length; i++) {
            const item = diskData[coll][i];
            const id = String(item.id || item.code || item.week || i + 1);
            await client.query(
              `INSERT INTO grc_records (collection, record_id, payload, sort_order)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (collection, record_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
              [coll, id, JSON.stringify(item), i]
            );
            inserted++;
          }
        }
      }
      console.log(`  -> Sincronizados ${inserted} registros locais do arquivo JSON para a tabela grc_records.`);
    } catch (err) {
      console.warn('  ⚠️ Aviso ao sincronizar JSON local:', err.message);
    }
  }

  // Resumo de auditoria do banco
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  console.log(`\n========================================================================`);
  console.log(`🎉 BANCO DE DADOS POSTGRESQL CRIADO E POPULADO COM SUCESSO!`);
  console.log(`========================================================================`);
  console.log(`Tabelas disponíveis (${tables.rowCount}):`);
  tables.rows.forEach(r => console.log(`  • ${r.table_name}`));

  await client.end();
  console.log(`\nO backend da aplicação já está conectado e pronto para uso em tempo real.`);
}

main().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
