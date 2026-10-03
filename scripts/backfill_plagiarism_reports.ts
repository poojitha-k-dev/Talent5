import pg from 'pg';
import { runAuditionInspection } from '../backend/src/lib/auditionModel';

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('🔍 Backfilling AI Moderation & Plagiarism Reports with v2.5 Engine...');

  const appsRes = await pool.query('SELECT * FROM creator_applications');
  console.log(`Found ${appsRes.rows.length} applications to inspect.`);

  for (const app of appsRes.rows) {
    // If stage_name contains 'Vocals' or category is vocal-oriented, set VOCAL_SHOWCASE
    const isVocalShowcase =
      (app.stage_name || '').toLowerCase().includes('vocals') ||
      (app.full_name || '').toLowerCase().includes('vocals');

    const intent = isVocalShowcase ? 'VOCAL_SHOWCASE' : 'ORIGINAL_CREATION';
    const songRef = isVocalShowcase ? 'Tum Bin Mann Kaha (Cover)' : null;

    console.log(`Processing: ${app.stage_name} (${app.id}) -> Intent: ${intent}`);

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
      creationIntent: intent,
      performedSongReference: songRef || undefined,
    });

    await pool.query(
      `UPDATE creator_applications
       SET creation_intent = $1,
           performed_song_reference = $2,
           ai_moderation_report = $3,
           ai_safety_score = $4,
           ai_recommendation = $5,
           plagiarism_risk_level = $6,
           matched_song_title = $7,
           matched_song_artist = $8,
           similarity_percentage = $9,
           plagiarism_details = $10
       WHERE id = $11`,
      [
        intent,
        songRef,
        JSON.stringify(report),
        report.safetyScore,
        report.recommendation,
        report.plagiarismReport.plagiarismRiskLevel,
        report.plagiarismReport.matchedSongTitle,
        report.plagiarismReport.matchedSongArtist,
        report.plagiarismReport.similarityPercentage,
        JSON.stringify(report.plagiarismReport),
        app.id,
      ]
    );

    console.log(`✅ ${app.stage_name}: Plagiarism Result: ${report.plagiarismReport.plagiarismRiskLevel} | Matched: ${report.plagiarismReport.matchedSongTitle} (${report.plagiarismReport.similarityPercentage}%)`);
  }

  console.log('🎉 Plagiarism and Intent backfill complete!');
  await pool.end();
}

main().catch(console.error);
