import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
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
