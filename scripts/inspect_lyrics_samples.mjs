import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function inspect() {
  const res = await pool.query(`
    SELECT s.id, s.title, s.duration_seconds, l.name as lang,
           COUNT(ll.id) as line_count,
           string_agg(ll.text, ' /// ' ORDER BY ll.sequence_order) as lyrics_preview
    FROM songs s
    JOIN languages l ON s.language_id = l.id
    JOIN lyrics lyr ON s.id = lyr.song_id
    JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
    GROUP BY s.id, s.title, s.duration_seconds, l.name, lyr.id
    ORDER BY s.title ASC
    LIMIT 10
  `);

  for (const row of res.rows) {
    console.log(`[${row.lang}] "${row.title}" (${row.duration_seconds}s, ${row.line_count} lines):`);
    console.log(`  ${row.lyrics_preview.slice(0, 150)}...\n`);
  }
  await pool.end();
}

inspect();
