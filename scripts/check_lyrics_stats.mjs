import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function check() {
  const res = await pool.query(`
    SELECT COUNT(*) as total_songs,
           MIN(line_count) as min_lines,
           MAX(line_count) as max_lines,
           ROUND(AVG(line_count), 1) as avg_lines,
           COUNT(*) FILTER (WHERE line_count < 10) as songs_under_10_lines,
           COUNT(*) FILTER (WHERE line_count < 15) as songs_under_15_lines
    FROM (
      SELECT s.id, COUNT(ll.id) as line_count
      FROM songs s
      JOIN lyrics lyr ON s.id = lyr.song_id
      JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
      GROUP BY s.id
    ) sub
  `);
  console.log('Lyrics line stats:', res.rows[0]);

  const totalLines = await pool.query(`SELECT COUNT(*) FROM lyric_lines`);
  console.log('Total lines in lyric_lines:', totalLines.rows[0].count);

  await pool.end();
}

check();
