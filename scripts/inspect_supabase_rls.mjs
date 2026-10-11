import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Export it before running this script.');
  process.exit(1);
}
const pool = new Pool({
  connectionString,
  ssl:
    connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: true, ...(process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT } : {}) },
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
