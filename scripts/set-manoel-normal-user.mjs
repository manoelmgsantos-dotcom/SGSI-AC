import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const dbUrl = process.env.DATABASE_URL || 'postgresql://cybergrc:%40Ac123456@db:5432/cybergrc';

console.log('========================================================================');
console.log('   AC ENGENHARIA - ATUALIZAÇÃO DE PAPEL RBAC (MANOEL SANTOS)');
console.log('========================================================================\n');

async function setManoelNormalUser() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL com sucesso.');

    // 1. Atualiza app_users
    await client.query(`
      UPDATE app_users 
      SET role = 'secops', active = TRUE 
      WHERE LOWER(email) = 'ti@acengenhariase.com.br';

      UPDATE app_users 
      SET role = 'gestor_obra' 
      WHERE LOWER(email) = 'manoelmgsantos@acengenhariase.com.br';
    `);
    console.log('✅ Tabela app_users atualizada: ti@acengenhariase.com.br (secops), manoelmgsantos (gestor_obra).');

    // 2. Atualiza grc_records para ti@acengenhariase.com.br (Único Admin Principal)
    const adminRecord = {
      id: "usr-admin",
      name: "Admin-SGSI",
      email: "ti@acengenhariase.com.br",
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

    // 3. Atualiza grc_records para manoelmgsantos@acengenhariase.com.br (Usuário Normal)
    const manoelRecord = {
      id: "usr-manoel",
      name: "Manoel Martins",
      email: "manoelmgsantos@acengenhariase.com.br",
      role: "gestor_obra",
      roleName: "Engenheiro Residente / Obras",
      department: "Diretoria de Operações & Obras",
      location: "Escritório Central (Matriz)",
      avatar: "MM",
      color: "amber",
      status: "Ativo",
      isSuperAdmin: false,
      updatedAt: new Date().toISOString()
    };

    await client.query(
      `INSERT INTO grc_records (collection, record_id, payload, sort_order)
       VALUES ('users', 'usr-manoel', $1, 1)
       ON CONFLICT (collection, record_id) DO UPDATE
       SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [JSON.stringify(manoelRecord)]
    );

    console.log('✅ Registros da coleção "users" atualizados com sucesso no PostgreSQL!');
    console.log('\nStatus Atual:');
    console.log('  • Admin Principal Único : Admin-SGSI <ti@acengenhariase.com.br> [isSuperAdmin: true]');
    console.log('  • Usuário Normal/Engenheiro : Manoel Martins <manoelmgsantos@acengenhariase.com.br> [isSuperAdmin: false]');
  } catch (err) {
    console.error('❌ Erro durante atualização:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setManoelNormalUser();
