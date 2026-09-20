import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function deepAuditLyrics() {
  const songs = await pool.query(`
    SELECT s.id, s.title, s.duration_seconds, a.name as artist, l.name as language,
           lyr.id as lyrics_id, lyr.is_synced, lyr.full_text,
           count(ll.id) as line_count,
           max(ll.end_time_ms) as max_end_ms
    FROM songs s
    JOIN artists a ON s.artist_id = a.id
    JOIN languages l ON s.language_id = l.id
    LEFT JOIN lyrics lyr ON s.id = lyr.song_id
    LEFT JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
    GROUP BY s.id, s.title, s.duration_seconds, a.name, l.name, lyr.id, lyr.is_synced, lyr.full_text
    ORDER BY line_count ASC, s.duration_seconds DESC
  `);

  console.log(`Total songs: ${songs.rows.length}`);

  const fewerThan14 = songs.rows.filter(s => parseInt(s.line_count, 10) < 14);
  console.log(`\nFound ${fewerThan14.length} songs with fewer than 14 lines:`);
  console.table(fewerThan14.map(s => ({
    title: s.title,
    artist: s.artist,
    lang: s.language,
    dur: s.duration_seconds,
    lines: parseInt(s.line_count, 10),
    avgSec: Math.round(s.duration_seconds / parseInt(s.line_count, 10))
  })));

  await pool.end();
}

deepAuditLyrics().catch(console.error);
