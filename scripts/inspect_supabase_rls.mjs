import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    const res = await pool.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);

    console.log(`Total tables in public schema: ${res.rows.length}`);
    const withoutRls = res.rows.filter(r => !r.rowsecurity);
    console.log(`Tables WITHOUT RLS (${withoutRls.length}):`);
    withoutRls.forEach(r => console.log(` - ${r.tablename}`));

    const policies = await pool.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      ORDER BY tablename, policyname;
    `);
    console.log(`\nExisting policies count: ${policies.rows.length}`);
    policies.rows.forEach(p => console.log(` - ${p.tablename}: ${p.policyname} (${p.cmd})`));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();
