import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('🚀 Migrating creator_applications table for Plagiarism Checker & Creation Intent Tracks...');

  await pool.query(`
    ALTER TABLE creator_applications 
    ADD COLUMN IF NOT EXISTS creation_intent VARCHAR(50) DEFAULT 'ORIGINAL_CREATION',
    ADD COLUMN IF NOT EXISTS performed_song_reference VARCHAR(255),
    ADD COLUMN IF NOT EXISTS plagiarism_risk_level VARCHAR(50) DEFAULT 'CLEAN',
    ADD COLUMN IF NOT EXISTS matched_song_title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS matched_song_artist VARCHAR(255),
    ADD COLUMN IF NOT EXISTS similarity_percentage INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS plagiarism_details JSONB;
  `);

  console.log('✅ Columns added successfully.');

  // Check columns
  const res = await pool.query(
    "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'creator_applications' ORDER BY ordinal_position;"
  );
  console.log('Current creator_applications columns:');
  res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type}) [Default: ${r.column_default}]`));

  await pool.end();
}

main().catch(console.error);
