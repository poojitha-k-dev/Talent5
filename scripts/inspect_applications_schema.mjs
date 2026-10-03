import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const res = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'creator_applications' ORDER BY ordinal_position;"
  );
  console.log('creator_applications columns:', res.rows);
  const sample = await pool.query("SELECT * FROM creator_applications LIMIT 2;");
  console.log('Sample row:', sample.rows[0]);
  await pool.end();
}

main().catch(console.error);
