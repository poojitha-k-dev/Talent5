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
  const res = await pool.query(
    "SELECT id, email, password_hash, status FROM users WHERE email = 'admin@talent5.com';"
  );
  console.log('Admin user:', res.rows[0]);
  await pool.end();
}

main().catch(console.error);
