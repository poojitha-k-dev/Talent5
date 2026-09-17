import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function dumpInfo() {
  const langs = await pool.query(`SELECT id, name, code FROM languages ORDER BY id ASC`);
  console.log('Languages:');
  console.table(langs.rows);

  const songsSummary = await pool.query(`
    SELECT l.name as language, COUNT(s.id) as song_count,
           ROUND(AVG(s.duration_seconds)) as avg_duration,
           MIN(s.duration_seconds) as min_duration,
           MAX(s.duration_seconds) as max_duration
    FROM songs s
    JOIN languages l ON s.language_id = l.id
    GROUP BY l.name
    ORDER BY song_count DESC
  `);
  console.log('\nSongs summary by language:');
  console.table(songsSummary.rows);

  await pool.end();
}

dumpInfo();
