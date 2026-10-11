import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Export it before running this script.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl:
    connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: true, ...(process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT } : {}) },
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
