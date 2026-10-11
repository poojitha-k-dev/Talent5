import pg from 'pg';
import { runAuditionInspection } from '../backend/src/lib/auditionModel';
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
  console.log('🤖 Starting AI Audition Inspection Report Backfill on creator applications...');

  const appsRes = await pool.query('SELECT * FROM creator_applications ORDER BY created_at ASC;');
  console.log(`Found ${appsRes.rows.length} applications to inspect.\n`);

  for (const app of appsRes.rows) {
    console.log(`🔍 Inspecting application for: "${app.stage_name}" (${app.category})...`);

    const report = await runAuditionInspection({
      id: app.id,
      fullName: app.full_name,
      stageName: app.stage_name,
      bio: app.bio,
      city: app.city,
      state: app.state,
      languages: app.languages,
      category: app.category,
      genres: app.genres,
      experience: app.experience,
      samplePerformanceUrl: app.sample_performance_url,
      portfolioUrl: app.portfolio_url,
      originalCompositionInfo: app.original_composition_info,
      ownershipDeclaration: app.ownership_declaration,
      copyrightDeclaration: app.copyright_declaration,
    });

    console.log(`   Safety Score: ${report.safetyScore}/100 | Recommendation: ${report.recommendation}`);

    await pool.query(
      `UPDATE creator_applications 
       SET ai_moderation_report = $1, ai_safety_score = $2, ai_recommendation = $3 
       WHERE id = $4`,
      [JSON.stringify(report), report.safetyScore, report.recommendation, app.id]
    );

    console.log(`   ✅ Report saved for "${app.stage_name}"\n`);
  }

  console.log('🎉 AI Inspection backfill complete!');
  await pool.end();
}

main().catch(console.error);
