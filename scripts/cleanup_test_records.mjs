import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await pool.query("DELETE FROM creator_applications WHERE stage_name IN ('Aarav Vocals', 'Rohan Music')");
  await pool.query("DELETE FROM users WHERE email LIKE 'vocalist_%' OR email LIKE 'copycat_%'");
  console.log('✅ Temporary test records cleaned up.');

  const remaining = await pool.query('SELECT stage_name, creation_intent, plagiarism_risk_level, matched_song_title, similarity_percentage FROM creator_applications');
  console.log('Current applications in DB:');
  console.table(remaining.rows);
  await pool.end();
}

main().catch(console.error);
