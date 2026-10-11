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
  await pool.query("DELETE FROM creator_applications WHERE stage_name IN ('Aarav Vocals', 'Rohan Music')");
  await pool.query("DELETE FROM users WHERE email LIKE 'vocalist_%' OR email LIKE 'copycat_%'");
  console.log('✅ Temporary test records cleaned up.');

  const remaining = await pool.query('SELECT stage_name, creation_intent, plagiarism_risk_level, matched_song_title, similarity_percentage FROM creator_applications');
  console.log('Current applications in DB:');
  console.table(remaining.rows);
  await pool.end();
}

main().catch(console.error);
