import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const dbUrl = process.env.DATABASE_URL || 'postgresql://cybergrc:%40Ac123456@db:5432/cybergrc';

const targetEmail = (process.argv[2] || process.env.BOOTSTRAP_ADMIN_EMAIL || 'ti@acengenhariase.com.br').toLowerCase().trim();
const targetPassword = process.argv[3] || process.env.BOOTSTRAP_ADMIN_PASSWORD || '@Ac123456';

console.log('========================================================================');
console.log('   AC ENGENHARIA - REDEFINIÇÃO DE CREDENCIAIS DO ADMINISTRADOR');
console.log('========================================================================\n');

async function resetAdmin() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log(' Conectado ao PostgreSQL com sucesso.');

    const hash = await bcrypt.hash(targetPassword, 10);

    // 1. Atualiza ou insere na tabela app_users
    await client.query(
      `INSERT INTO app_users (email, password_hash, role, active, created_at, updated_at)
       VALUES ($1, $2, 'secops', TRUE, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           role = 'secops',
           active = TRUE,
           updated_at = NOW()`,
      [targetEmail, hash]
    );
    console.log(` Tabela app_users atualizada com sucesso para: ${targetEmail}`);

    // 2. Garante o registro do usuário em grc_records (coleção 'users')
    const adminRecord = {
      id: "usr-admin",
      name: "Admin-SGSI",
      email: targetEmail,
      role: "secops",
      roleName: "Gestor de T.I. & SecOps",
      department: "Diretoria de Tecnologia & Governança SGSI",
      location: "Escritório Central (Matriz)",
      avatar: "A",
      color: "blue",
      status: "Ativo",
      isSuperAdmin: true,
      updatedAt: new Date().toISOString()
    };

    await client.query(
      `INSERT INTO grc_records (collection, record_id, payload, sort_order)
       VALUES ('users', 'usr-admin', $1, 0)
       ON CONFLICT (collection, record_id) DO UPDATE
       SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [JSON.stringify(adminRecord)]
    );
    console.log(` Tabela grc_records (users) atualizada com sucesso.`);

    console.log('\n========================================================================');
    console.log(' CREDENCIAIS DE ADMINISTRADOR DEFINIDAS COM SUCESSO:');
    console.log(`   E-mail: ${targetEmail}`);
    console.log(`   Senha:  ${targetPassword}`);
    console.log('========================================================================\n');
    console.log('Você já pode fazer login no painel com essas credenciais.');
  } catch (err) {
    console.error('❌ Erro ao redefinir credenciais:', err.message);
  } finally {
    await client.end().catch(() => {});
  }
}

resetAdmin();
