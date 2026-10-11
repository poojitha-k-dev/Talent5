import pg from 'pg';
import bcrypt from 'bcryptjs';
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
  const hash = await bcrypt.hash('Talent5Admin2026!', 10);
  await pool.query(
    "UPDATE users SET password_hash = $1, status = 'ACTIVE' WHERE email = 'admin@talent5.com';",
    [hash]
  );
  console.log('✅ Admin password updated to Talent5Admin2026!');
  await pool.end();
}

main().catch(console.error);
