import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('--- CURATING TALENT5 CATALOG ---');

  // 1. Lower pure classical/devotional tracks so they don't overwhelm the homepage
  const updateClassical = await pool.query(`
    UPDATE songs 
    SET popularity_score = (75.0 + (RANDOM() * 10))::numeric(5,2)
    WHERE genre_id IN (4, 9) OR title ILIKE '%bhajan%' OR title ILIKE '%aarti%' OR title ILIKE '%kalyani%' OR title ILIKE '%shree krishna%'
  `);
  console.log(`Lowered ${updateClassical.rowCount} classical/devotional songs' popularity score to 75-85.`);

  // 2. Elevate modern tracks
  const modernElevations = [
    { title: 'Gully To Gagan', score: 99.9, plays: 980000, likes: 78000 },
    { title: 'Pind Di Beat', score: 99.8, plays: 950000, likes: 74000 },
    { title: 'Aa Mahiya', score: 99.7, plays: 920000, likes: 71000 },
    { title: 'Desi-Hum', score: 99.6, plays: 890000, likes: 68000 },
    { title: 'Dil Me Chupi', score: 99.5, plays: 870000, likes: 65000 },
    { title: 'Baras Jaye', score: 99.4, plays: 840000, likes: 62000 },
    { title: 'Bhaagam Bhaag', score: 99.3, plays: 820000, likes: 60000 },
    { title: 'Bambookat', score: 99.2, plays: 800000, likes: 58000 },
    { title: 'Jee Le Zara', score: 99.1, plays: 780000, likes: 55000 },
    { title: 'Baarish', score: 99.0, plays: 760000, likes: 53000 },
    { title: 'Tum Bin Mann Kaha', score: 98.9, plays: 740000, likes: 51000 },
    { title: 'Deep Love', score: 98.8, plays: 720000, likes: 49000 },
  ];

  for (const track of modernElevations) {
    const res = await pool.query(`
      UPDATE songs 
      SET popularity_score = $1::numeric, play_count = $2::bigint, valid_likes_count = $3::bigint, raw_likes_count = ($3 + 450)::bigint, status = 'PUBLISHED'
      WHERE title = $4
      RETURNING id, title, popularity_score
    `, [track.score, track.plays, track.likes, track.title]);
    if (res.rows.length > 0) {
      console.log(`✓ Elevated: "${res.rows[0].title}" (score: ${res.rows[0].popularity_score})`);
    }
  }

  // 3. Ensure high-quality, immediately starting synced lyrics for top modern tracks
  // Track 1: Gully To Gagan (Desi Hip-Hop spotlight)
  const gullyTrack = (await pool.query("SELECT id FROM songs WHERE title = 'Gully To Gagan' LIMIT 1")).rows[0];
  if (gullyTrack) {
    await setupSyncedLyrics(gullyTrack.id, 'Gully To Gagan', [
      { start: 1200, end: 4800, text: 'Gully se nikle, par gagan pe nazar hai' },
      { start: 4900, end: 8500, text: 'Har ek kadam par naya ek safar hai' },
      { start: 8600, end: 12400, text: 'Raste kathin par hosle buland hain' },
      { start: 12500, end: 16800, text: 'Apne hi shabdon mein aag aur chhand hain' },
      { start: 16900, end: 21200, text: 'Desi yeh beat meri, desi meri pehchaan' },
      { start: 21300, end: 25600, text: 'Mumbai to Delhi ab sunega jahaan' },
      { start: 25700, end: 30100, text: 'Hard work bolta hai, baatein nahi karte' },
      { start: 30200, end: 35000, text: 'Talent5 pe bajega apna taraana sada!' },
    ]);
  }

  // Track 2: Pind Di Beat (Punjabi Beats)
  const pindTrack = (await pool.query("SELECT id FROM songs WHERE title = 'Pind Di Beat' LIMIT 1")).rows[0];
  if (pindTrack) {
    await setupSyncedLyrics(pindTrack.id, 'Pind Di Beat', [
      { start: 1500, end: 5200, text: 'Pind diyan galliyan ch vajda dhol ve' },
      { start: 5300, end: 9400, text: 'Nachde ne saare kudiye hath jod ke' },
      { start: 9500, end: 13800, text: 'Bhangre di taan utte jhoome sara jagg' },
      { start: 13900, end: 18200, text: 'Desi sada style sadi vakhri ae agg' },
      { start: 18300, end: 22600, text: 'O nach le soniye tu khul ke zara' },
      { start: 22700, end: 27500, text: 'Pind di beat te hila de asmaan!' },
    ]);
  }

  // Track 3: Aa Mahiya (Punjabi Indie)
  const aaMahiyaTrack = (await pool.query("SELECT id FROM songs WHERE title = 'Aa Mahiya' LIMIT 1")).rows[0];
  if (aaMahiyaTrack) {
    await setupSyncedLyrics(aaMahiyaTrack.id, 'Aa Mahiya', [
      { start: 1800, end: 6200, text: 'Aa mahiya tenu vekhan nu akhiyan taras diyan' },
      { start: 6300, end: 10800, text: 'Saavan diyan barsatan wangu naina bars diyan' },
      { start: 10900, end: 15500, text: 'Tere baajhon soona lagda sara jahaan ve' },
      { start: 15600, end: 20400, text: 'Tere naam te vaar devan apni main jaan ve' },
      { start: 20500, end: 25800, text: 'Chupke se aaja mere khwaaban de sheher' },
      { start: 25900, end: 31200, text: 'Dildaar mere tu hi meri pehli seher' },
    ]);
  }

  // Track 4: Tum Bin Mann Kaha
  const tumBinTrack = (await pool.query("SELECT id FROM songs WHERE title = 'Tum Bin Mann Kaha' LIMIT 1")).rows[0];
  if (tumBinTrack) {
    await setupSyncedLyrics(tumBinTrack.id, 'Tum Bin Mann Kaha', [
      { start: 1200, end: 5500, text: 'Tum bin mann kaha lage re saawariya...' },
      { start: 5600, end: 10200, text: 'Suni yeh naina dhoondhe teri galiya...' },
      { start: 10300, end: 15400, text: 'Chupke se aake meri saanso mein bas jaa...' },
      { start: 15500, end: 21000, text: 'Tere bina yeh jeevan adhura sa lage...' },
      { start: 21100, end: 27000, text: 'Pal pal yaad sataye teri saawariya...' },
    ]);
  }

  console.log('\n--- VERIFYING TOP 5 HOME SONGS ---');
  const top5 = await pool.query(`
    SELECT s.id, s.title, g.name as genre, s.popularity_score, s.play_count, a.name as artist
    FROM songs s
    JOIN genres g ON g.id = s.genre_id
    JOIN artists a ON a.id = s.artist_id
    WHERE s.status = 'PUBLISHED'
    ORDER BY s.popularity_score DESC
    LIMIT 5
  `);
  console.table(top5.rows);
}

async function setupSyncedLyrics(songId, title, lines) {
  // Check or create lyrics record
  let lyricRes = await pool.query('SELECT id FROM lyrics WHERE song_id = $1 LIMIT 1', [songId]);
  let lyricId;
  const fullText = lines.map(l => l.text).join('\n');
  if (lyricRes.rows.length === 0) {
    const insertRes = await pool.query(`
      INSERT INTO lyrics (song_id, is_synced, sync_status, full_text, created_at, version)
      VALUES ($1, true, 'SYNCED', $2, NOW(), 1)
      RETURNING id
    `, [songId, fullText]);
    lyricId = insertRes.rows[0].id;
  } else {
    lyricId = lyricRes.rows[0].id;
    await pool.query(`
      UPDATE lyrics SET is_synced = true, sync_status = 'SYNCED', full_text = $1, version = version + 1
      WHERE id = $2
    `, [fullText, lyricId]);
  }

  // Clear old lines and insert new calibrated lines
  await pool.query('DELETE FROM lyric_lines WHERE lyrics_id = $1', [lyricId]);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    await pool.query(`
      INSERT INTO lyric_lines (lyrics_id, sequence_order, start_time_ms, end_time_ms, text, words)
      VALUES ($1, $2, $3, $4, $5, '[]'::jsonb)
    `, [lyricId, i + 1, l.start, l.end, l.text]);
  }
  console.log(`✓ Synced ${lines.length} calibrated lines for "${title}" (starts at ${lines[0].start}ms)`);
}

main().catch(console.error).finally(() => pool.end());
