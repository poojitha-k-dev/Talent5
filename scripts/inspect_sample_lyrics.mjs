import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function inspectSamples() {
  const songs = await pool.query(`
    SELECT s.id, s.title, s.duration_seconds, a.name as artist, l.name as language,
           count(ll.id) as line_count,
           string_agg(ll.text, ' | ' ORDER BY ll.sequence_order) as lyrics_preview
    FROM songs s
    JOIN artists a ON s.artist_id = a.id
    JOIN languages l ON s.language_id = l.id
    JOIN lyrics lyr ON s.id = lyr.song_id
    JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
    GROUP BY s.id, s.title, s.duration_seconds, a.name, l.name
    ORDER BY random()
    LIMIT 8
  `);

  console.log('Random sample of 8 songs from the catalog:');
  for (const s of songs.rows) {
    console.log(`\n=== "${s.title}" (${s.language}) - ${s.artist} [${s.duration_seconds}s, ${s.line_count} lines] ===`);
    console.log(s.lyrics_preview.slice(0, 300) + '...');
  }
  await pool.end();
}

inspectSamples().catch(console.error);
