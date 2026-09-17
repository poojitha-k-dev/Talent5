import pg from 'pg';
import fs from 'fs';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function dumpCatalogSongs() {
  const userCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
  console.log('User columns:', userCols.rows.map(r => r.column_name));

  const songCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'songs'");
  console.log('Song columns:', songCols.rows.map(r => r.column_name));

  const res = await pool.query(`
    SELECT s.id, s.title, s.slug, s.duration_seconds, s.language_id, l.name as language,
           lyr.id as lyric_id, lyr.full_text,
           COUNT(ll.id) as line_count
    FROM songs s
    JOIN languages l ON s.language_id = l.id
    LEFT JOIN lyrics lyr ON s.id = lyr.song_id
    LEFT JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
    GROUP BY s.id, s.title, s.slug, s.duration_seconds, s.language_id, l.name, lyr.id, lyr.full_text
    ORDER BY l.name ASC, s.title ASC
  `);

  console.log(`Retrieved ${res.rows.length} songs.`);
  fs.writeFileSync('scripts/all_songs_catalog_dump.json', JSON.stringify(res.rows, null, 2));
  console.log('Saved to scripts/all_songs_catalog_dump.json');
  await pool.end();
}

dumpCatalogSongs();
