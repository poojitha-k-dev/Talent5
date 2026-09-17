import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function sampleLines() {
  const songs = await pool.query(`
    SELECT DISTINCT ON (l.name)
      s.id, s.title, s.duration_seconds, l.name as language, lyr.id as lyric_id
    FROM songs s
    JOIN languages l ON s.language_id = l.id
    JOIN lyrics lyr ON s.id = lyr.song_id
    ORDER BY l.name, s.id
  `);

  for (const song of songs.rows) {
    const lines = await pool.query(`
      SELECT sequence_order, start_time_ms, end_time_ms, text
      FROM lyric_lines
      WHERE lyrics_id = $1
      ORDER BY sequence_order ASC
    `, [song.lyric_id]);

    console.log(`\n======================================================`);
    console.log(`[${song.language}] "${song.title}" (${song.duration_seconds}s, ${lines.rows.length} lines)`);
    console.log(`======================================================`);
    for (const line of lines.rows) {
      console.log(`  [${(line.start_time_ms/1000).toFixed(1)}s - ${(line.end_time_ms/1000).toFixed(1)}s]: ${line.text}`);
    }
  }

  await pool.end();
}

sampleLines();
