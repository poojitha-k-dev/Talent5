import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/talent5_v1',
});

async function runMigration() {
  const client = await pool.connect();
  console.log('=== RUNNING TALENT5 V2 DATABASE MIGRATION ===');
  try {
    await client.query('BEGIN');

    // 1. Qualified Play Telemetry & Listening History
    console.log('1. Creating song_plays table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS song_plays (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        duration_played_seconds INT NOT NULL,
        is_qualified BOOLEAN NOT NULL DEFAULT FALSE,
        ip_hash VARCHAR(64),
        device_fingerprint VARCHAR(128),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_song_plays_song_id ON song_plays(song_id);
      CREATE INDEX IF NOT EXISTS idx_song_plays_user_id ON song_plays(user_id);
      CREATE INDEX IF NOT EXISTS idx_song_plays_qualified ON song_plays(is_qualified, created_at);
    `);

    // 2. Saved Songs (Bookmarks)
    console.log('2. Creating saved_songs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_songs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, song_id)
      );
      CREATE INDEX IF NOT EXISTS idx_saved_songs_user ON saved_songs(user_id);
    `);

    // 3. Competition Votes Ledger (Anti-Fraud & Duplicate Prevention)
    console.log('3. Creating competition_votes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS competition_votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
        entry_id UUID NOT NULL REFERENCES competition_entries(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        ip_hash VARCHAR(64),
        risk_score VARCHAR(20) DEFAULT 'LOW',
        status VARCHAR(30) DEFAULT 'VALID' CHECK (status IN ('VALID', 'SUSPICIOUS', 'DISQUALIFIED')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(competition_id, user_id)
      );
      CREATE INDEX IF NOT EXISTS idx_comp_votes ON competition_votes(competition_id, entry_id);
    `);

    // 4. Content Submissions Extensions
    console.log('4. Extending content_submissions table...');
    await client.query(`
      ALTER TABLE content_submissions
        ADD COLUMN IF NOT EXISTS duration_seconds INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS storage_key TEXT,
        ADD COLUMN IF NOT EXISTS mood VARCHAR(100),
        ADD COLUMN IF NOT EXISTS lyrics_text TEXT,
        ADD COLUMN IF NOT EXISTS lyrics_timed_data JSONB,
        ADD COLUMN IF NOT EXISTS rights_declaration JSONB,
        ADD COLUMN IF NOT EXISTS published_song_id UUID REFERENCES songs(id) ON DELETE SET NULL;
    `);

    // 5. Seed some initial telemetry data if tables are empty
    console.log('5. Verifying baseline telemetry records...');
    const userRes = await client.query('SELECT id FROM users LIMIT 1');
    const songRes = await client.query('SELECT id FROM songs LIMIT 10');

    if (userRes.rows.length > 0 && songRes.rows.length > 0) {
      const testUserId = userRes.rows[0].id;
      
      // Seed a few qualified plays for testing
      const playCount = await client.query('SELECT count(*) FROM song_plays');
      if (parseInt(playCount.rows[0].count) === 0) {
        for (let i = 0; i < 5; i++) {
          await client.query(`
            INSERT INTO song_plays (song_id, user_id, duration_played_seconds, is_qualified, ip_hash, device_fingerprint)
            VALUES ($1, $2, $3, TRUE, '127.0.0.1', 'web-audit-session')
          `, [songRes.rows[i].id, testUserId, 45 + i * 15]);
        }
        console.log('   Seeded 5 baseline qualified play telemetry records.');
      }

      // Seed a saved song
      const savedCount = await client.query('SELECT count(*) FROM saved_songs');
      if (parseInt(savedCount.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO saved_songs (user_id, song_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [testUserId, songRes.rows[0].id]);
        console.log('   Seeded baseline saved song record.');
      }
    }

    await client.query('COMMIT');
    console.log('=== V2 MIGRATION COMPLETED SUCCESSFULLY! ===');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
