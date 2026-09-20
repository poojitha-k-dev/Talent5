import pg from 'pg';
import fs from 'fs';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function exportCatalog() {
  const res = await pool.query(`
    SELECT s.id, s.title, s.slug, s.duration_seconds, s.audio_url,
           a.name as artist, l.name as language, l.id as language_id,
           coalesce(lyr.full_text, '') as full_text,
           count(ll.id) as line_count
    FROM songs s
    JOIN artists a ON s.artist_id = a.id
    JOIN languages l ON s.language_id = l.id
    LEFT JOIN lyrics lyr ON s.id = lyr.song_id
    LEFT JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
    GROUP BY s.id, s.title, s.slug, s.duration_seconds, s.audio_url, a.name, l.name, l.id, lyr.full_text
    ORDER BY l.name ASC, s.title ASC
  `);

  fs.writeFileSync('scripts/catalog_339_dump.json', JSON.stringify(res.rows, null, 2));
  console.log(`Exported all ${res.rows.length} songs to scripts/catalog_339_dump.json`);
  await pool.end();
}

exportCatalog().catch(console.error);
