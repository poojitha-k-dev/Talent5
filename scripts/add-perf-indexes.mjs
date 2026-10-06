import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const INDEX_QUERIES = [
  { name: 'idx_songs_status_release', sql: 'CREATE INDEX IF NOT EXISTS idx_songs_status_release ON songs(status, release_date DESC)' },
  { name: 'idx_songs_status_popularity', sql: 'CREATE INDEX IF NOT EXISTS idx_songs_status_popularity ON songs(status, popularity_score DESC)' },
  { name: 'idx_songs_status_likes', sql: 'CREATE INDEX IF NOT EXISTS idx_songs_status_likes ON songs(status, valid_likes_count DESC)' },
  { name: 'idx_songs_status_plays', sql: 'CREATE INDEX IF NOT EXISTS idx_songs_status_plays ON songs(status, play_count DESC)' },
  { name: 'idx_songs_release_date', sql: 'CREATE INDEX IF NOT EXISTS idx_songs_release_date ON songs(release_date DESC)' },
  { name: 'idx_songs_artist_status', sql: 'CREATE INDEX IF NOT EXISTS idx_songs_artist_status ON songs(artist_id, status)' },
  { name: 'idx_songs_lang_status', sql: 'CREATE INDEX IF NOT EXISTS idx_songs_lang_status ON songs(language_id, status)' },
  { name: 'idx_songs_genre_status', sql: 'CREATE INDEX IF NOT EXISTS idx_songs_genre_status ON songs(genre_id, status)' },
  { name: 'idx_creator_profiles_approved', sql: 'CREATE INDEX IF NOT EXISTS idx_creator_profiles_approved ON creator_profiles(is_approved)' },
];

async function run() {
  const client = await pool.connect();
  try {
    for (const item of INDEX_QUERIES) {
      try {
        await client.query(item.sql);
        console.log(`✅ Index ${item.name} created or verified.`);
      } catch (err) {
        console.warn(`⚠️ Index ${item.name} skipped: ${err.message}`);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run();
