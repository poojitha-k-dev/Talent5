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
  console.log('🚀 Migrating creator_applications table for AI Moderation & Inspection Report...');

  await pool.query(`
    ALTER TABLE creator_applications 
    ADD COLUMN IF NOT EXISTS ai_moderation_report JSONB,
    ADD COLUMN IF NOT EXISTS ai_safety_score INTEGER,
    ADD COLUMN IF NOT EXISTS ai_recommendation VARCHAR(50);
  `);

  console.log('✅ Columns added successfully.');

  const res = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'creator_applications' ORDER BY ordinal_position;"
  );
  console.log('Updated columns:');
  res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));

  await pool.end();
}

main().catch(console.error);
