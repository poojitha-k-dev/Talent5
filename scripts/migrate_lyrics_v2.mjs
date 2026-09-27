import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function migrate() {
  try {
    console.log('Running lyrics schema migration...');
    await pool.query(`
      ALTER TABLE lyrics ADD COLUMN IF NOT EXISTS sync_status VARCHAR(30) DEFAULT 'UNSYNCED';
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'check_lyrics_sync_status'
        ) THEN
          ALTER TABLE lyrics ADD CONSTRAINT check_lyrics_sync_status
          CHECK (sync_status IN ('UNSYNCED', 'SYNCING', 'SYNCED', 'NEEDS_REVIEW'));
        END IF;
      END $$;
    `);

    await pool.query(`
      ALTER TABLE lyrics ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
    `);

    await pool.query(`
      ALTER TABLE lyric_lines ADD COLUMN IF NOT EXISTS words JSONB DEFAULT '[]'::jsonb;
    `);

    console.log('Lyrics schema migration succeeded.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
