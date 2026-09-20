import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function audit() {
  const res = await pool.query(`
    SELECT s.id, s.title, s.duration_seconds, s.audio_url, a.name as artist, l.name as language,
           lyr.id as lyric_id, lyr.is_synced, length(coalesce(lyr.full_text, '')) as full_text_len,
           count(ll.id) as line_count
    FROM songs s
    JOIN artists a ON s.artist_id = a.id
    JOIN languages l ON s.language_id = l.id
    LEFT JOIN lyrics lyr ON s.id = lyr.song_id
    LEFT JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
    GROUP BY s.id, s.title, s.duration_seconds, s.audio_url, a.name, l.name, lyr.id, lyr.is_synced, lyr.full_text
    ORDER BY line_count ASC, full_text_len ASC
  `);
  
  console.log('Total songs audited:', res.rows.length);
  
  // Group by line count
  const shortLyrics = res.rows.filter(r => r.line_count < 10);
  console.log('Songs with line_count < 10:', shortLyrics.length);
  if (shortLyrics.length > 0) {
    console.table(shortLyrics.slice(0, 30).map(r => ({
      title: r.title,
      artist: r.artist,
      language: r.language,
      duration: r.duration_seconds,
      lines: r.line_count,
      full_text_len: r.full_text_len,
      audio: r.audio_url
    })));
  }

  // Check line count distribution
  const lineStats = {};
  for (const r of res.rows) {
    const bucket = Math.floor(r.line_count / 5) * 5;
    const label = `${bucket} - ${bucket + 4}`;
    lineStats[label] = (lineStats[label] || 0) + 1;
  }
  console.log('Line count distribution:', lineStats);

  // Let's check full_text samples to see if any have placeholder or short text
  const shortFullText = res.rows.filter(r => r.full_text_len < 300);
  console.log('Songs with full_text length < 300 chars:', shortFullText.length);
  if (shortFullText.length > 0) {
    console.table(shortFullText.slice(0, 20).map(r => ({
      title: r.title,
      artist: r.artist,
      full_text_len: r.full_text_len,
      lines: r.line_count
    })));
  }

  await pool.end();
}

audit().catch(console.error);
