import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function check() {
  try {
    const stats = await pool.query(`
      SELECT count(*) as total_songs,
             count(*) FILTER (WHERE duration_seconds > 600) as long_songs,
             count(*) FILTER (WHERE duration_seconds <= 300) as standard_songs,
             count(*) FILTER (WHERE duration_seconds > 300 AND duration_seconds <= 600) as medium_songs
      FROM songs
    `);
    console.log('Song duration breakdown:', stats.rows[0]);

    const lyricsStats = await pool.query(`
      SELECT count(*) as total_lyrics,
             count(*) FILTER (WHERE is_synced = true) as synced_lyrics,
             count(*) FILTER (WHERE sync_status = 'SYNCED') as status_synced,
             count(*) FILTER (WHERE sync_status = 'UNSYNCED') as status_unsynced
      FROM lyrics
    `);
    console.log('Lyrics status breakdown:', lyricsStats.rows[0]);

    const fakeLines = await pool.query(`
      SELECT count(*) as fake_lines_count
      FROM lyric_lines
      WHERE text LIKE '%(vocal reprise%'
         OR text LIKE '%(second cycle%'
         OR text LIKE '%(pallavi refrain%'
         OR text LIKE '%[Interlude%'
         OR text LIKE '[%'
    `);
    console.log('Current fake lines count:', fakeLines.rows[0]);

    const sampleFake = await pool.query(`
      SELECT s.title, s.duration_seconds, ll.sequence_order, ll.start_time_ms, ll.text
      FROM lyric_lines ll
      JOIN lyrics l ON ll.lyrics_id = l.id
      JOIN songs s ON l.song_id = s.id
      WHERE ll.text LIKE '%(vocal reprise%' OR ll.text LIKE '[%'
      LIMIT 5
    `);
    console.log('Sample fake lines:', sampleFake.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

check();
