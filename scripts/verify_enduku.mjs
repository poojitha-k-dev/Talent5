import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function verify() {
  const meta = await pool.query(`
    SELECT s.title, s.duration_seconds, l.is_synced, l.sync_status, count(ll.id) as line_count
    FROM songs s
    JOIN lyrics l ON l.song_id = s.id
    LEFT JOIN lyric_lines ll ON ll.lyrics_id = l.id
    WHERE s.slug = 'enduku-dayaradura-sri-ramachandra-todi'
    GROUP BY s.title, s.duration_seconds, l.is_synced, l.sync_status
  `);
  console.log('Enduku Dayaradura Meta:', meta.rows[0]);

  const lines = await pool.query(`
    SELECT ll.sequence_order, ll.start_time_ms, ll.end_time_ms, ll.text
    FROM songs s
    JOIN lyrics l ON l.song_id = s.id
    JOIN lyric_lines ll ON ll.lyrics_id = l.id
    WHERE s.slug = 'enduku-dayaradura-sri-ramachandra-todi'
    ORDER BY ll.sequence_order ASC
  `);
  console.log('Total Lines:', lines.rows.length);
  for (const l of lines.rows) {
    console.log(`  Line ${l.sequence_order}: "${l.text}" (start=${l.start_time_ms}, end=${l.end_time_ms})`);
  }

  // Also check a synced song
  const synced = await pool.query(`
    SELECT s.title, s.duration_seconds, l.is_synced, l.sync_status, count(ll.id) as line_count
    FROM songs s
    JOIN lyrics l ON l.song_id = s.id
    LEFT JOIN lyric_lines ll ON ll.lyrics_id = l.id
    WHERE s.slug = 'aamar-e-poth-tomar-pather-biporite'
    GROUP BY s.title, s.duration_seconds, l.is_synced, l.sync_status
  `);
  console.log('\nAamar E Poth (Synced) Meta:', synced.rows[0]);

  const syncedLines = await pool.query(`
    SELECT ll.sequence_order, ll.start_time_ms, ll.end_time_ms, ll.text
    FROM songs s
    JOIN lyrics l ON l.song_id = s.id
    JOIN lyric_lines ll ON ll.lyrics_id = l.id
    WHERE s.slug = 'aamar-e-poth-tomar-pather-biporite'
    ORDER BY ll.sequence_order ASC
  `);
  for (const l of syncedLines.rows) {
    console.log(`  Line ${l.sequence_order}: "${l.text}" (start=${l.start_time_ms}ms [${(l.start_time_ms/1000).toFixed(1)}s], end=${l.end_time_ms}ms [${(l.end_time_ms/1000).toFixed(1)}s])`);
  }

  await pool.end();
}

verify();
