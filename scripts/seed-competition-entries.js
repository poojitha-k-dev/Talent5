const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/talent5_v1',
});

async function seedCompetitionEntries() {
  console.log('Seeding Competition Entries...');

  try {
    // 1. Enter Kabir Sen into Desi Indie Voice 2026
    await pool.query(`
      INSERT INTO competition_entries (
        id, competition_id, creator_id, content_id, rank, votes_count, status
      ) VALUES
      (
        '60000000-0000-0000-0000-000000000001',
        '14000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        '12000000-0000-0000-0000-000000000001',
        1,
        1420,
        'QUALIFIED'
      ),
      (
        '60000000-0000-0000-0000-000000000002',
        '14000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        '12000000-0000-0000-0000-000000000002',
        1,
        2890,
        'QUALIFIED'
      )
      ON CONFLICT (competition_id, creator_id) DO NOTHING;
    `);

    console.log('✅ Competition entries seeded successfully.');
  } catch (err) {
    console.error('Error seeding competition entries:', err);
  } finally {
    await pool.end();
  }
}

seedCompetitionEntries();
