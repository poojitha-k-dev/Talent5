import pg from 'pg';
import bcrypt from 'bcryptjs';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
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
