import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function checkAudioSources() {
  const songs = await pool.query(`
    SELECT s.id, s.title, s.duration_seconds, s.audio_url, s.mood, a.name as artist, l.name as language,
           coalesce(r.license_type, '') as license_type, coalesce(r.notes, '') as notes,
           coalesce(count(ll.id), 0) as line_count
    FROM songs s
    JOIN artists a ON s.artist_id = a.id
    JOIN languages l ON s.language_id = l.id
    LEFT JOIN rights_records r ON s.id = r.song_id
    LEFT JOIN lyrics lyr ON s.id = lyr.song_id
    LEFT JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
    GROUP BY s.id, s.title, s.duration_seconds, s.audio_url, s.mood, a.name, l.name, r.license_type, r.notes
    ORDER BY line_count ASC, s.title ASC
  `);
  
  console.log('Total songs:', songs.rows.length);

  // Print all songs grouped by line count
  console.log('\n--- Songs with fewer than 15 lines ---');
  const fewerThan15 = songs.rows.filter(s => s.line_count < 15);
  console.log(`Count: ${fewerThan15.length}`);
  console.table(fewerThan15.map(s => ({
    title: s.title,
    artist: s.artist,
    lang: s.language,
    dur: s.duration_seconds,
    lines: s.line_count,
    audio: s.audio_url
  })));

  // Check the earlier 281 songs: let's see what scripts seeded them
  // Let's sample songs across various languages
  console.log('\n--- Sample of songs by language and artist ---');
  const byLang = {};
  for (const s of songs.rows) {
    if (!byLang[s.language]) byLang[s.language] = [];
    byLang[s.language].push(s);
  }
  for (const [lang, list] of Object.entries(byLang)) {
    console.log(`\nLanguage: ${lang} (${list.length} songs). Sample artists:`);
    const artists = [...new Set(list.map(x => x.artist))].slice(0, 5);
    console.log(' ', artists.join(', '));
  }

  await pool.end();
}

checkAudioSources().catch(console.error);
