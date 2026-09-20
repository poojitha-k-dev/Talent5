import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function findInstrumentalOrUnvocal() {
  const songs = await pool.query(`
    SELECT s.id, s.title, s.duration_seconds, s.audio_url, s.mood, a.name as artist, l.name as language,
           coalesce(r.license_type, '') as license_type, coalesce(r.notes, '') as notes
    FROM songs s
    JOIN artists a ON s.artist_id = a.id
    JOIN languages l ON s.language_id = l.id
    LEFT JOIN rights_records r ON s.id = r.song_id
  `);
  
  const suspicious = [];
  for (const s of songs.rows) {
    const text = (s.title + ' ' + s.mood + ' ' + s.notes + ' ' + s.artist + ' ' + s.audio_url).toLowerCase();
    if (text.includes('instrumental') || text.includes('sitar') || text.includes('sarod') || 
        text.includes('shehnai') || text.includes('mandolin') || text.includes('solo') || 
        text.includes('ambient') || text.includes('lofi') || text.includes('electronic') || 
        text.includes('synth') || text.includes('orchestral') || text.includes('beat') || 
        text.includes('karaoke') || text.includes('guitar')) {
      suspicious.push(s);
    }
  }
  console.log('Songs mentioning instruments or possible non-vocal:', suspicious.length);
  console.table(suspicious.map(s => ({
    title: s.title,
    artist: s.artist,
    lang: s.language,
    mood: s.mood?.slice(0, 30),
    audio: s.audio_url
  })));
  await pool.end();
}

findInstrumentalOrUnvocal().catch(console.error);
