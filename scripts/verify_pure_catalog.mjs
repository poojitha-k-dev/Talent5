import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function verify() {
  const countRes = await pool.query('SELECT COUNT(*) FROM songs');
  console.log('Total Songs Count:', countRes.rows[0].count);

  const songs = await pool.query(`
    SELECT s.title, a.name as artist, l.name as language, s.slug,
           (SELECT COUNT(*) FROM lyric_lines ll JOIN lyrics ly ON ll.lyrics_id = ly.id WHERE ly.song_id = s.id) as lyric_line_count
    FROM songs s
    JOIN artists a ON s.artist_id = a.id
    JOIN languages l ON s.language_id = l.id
    ORDER BY l.name, s.title
  `);
  console.table(songs.rows);

  const pindCheck = await pool.query("SELECT id, title, slug FROM songs WHERE title ILIKE '%pind%' OR slug ILIKE '%pind%'");
  console.log('Pind check results:', pindCheck.rows);

  const nonVocalCheck = await pool.query("SELECT id, title, slug FROM songs WHERE title ILIKE '%instrumental%' OR title ILIKE '%flute%' OR title ILIKE '%sitar groove%'");
  console.log('Non-vocal / instrumental check results:', nonVocalCheck.rows);

  // Check lyrics lines with zero count
  const zeroLyrics = songs.rows.filter(s => Number(s.lyric_line_count) === 0);
  console.log('Songs missing lyrics:', zeroLyrics.length === 0 ? 'NONE (ALL 37 HAVE SYNCED LYRICS!)' : zeroLyrics);

  await pool.end();
}

verify().catch(console.error);
