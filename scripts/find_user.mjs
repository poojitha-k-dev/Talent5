import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const res = await pool.query(
    "SELECT id, email, password_hash, status FROM users WHERE email = 'admin@talent5.com';"
  );
  console.log('Admin user:', res.rows[0]);
  await pool.end();
}

main().catch(console.error);
