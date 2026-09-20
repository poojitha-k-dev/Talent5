import pg from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function verifyAll() {
  console.log('=== COMPREHENSIVE VERIFICATION OF 339 SONG CATALOG ===\n');

  // 1. Total counts
  const songsRes = await pool.query('SELECT count(*) FROM songs');
  const lyricsRes = await pool.query('SELECT count(*) FROM lyrics');
  const linesRes = await pool.query('SELECT count(*) FROM lyric_lines');
  const rightsRes = await pool.query('SELECT count(*) FROM rights_records');

  console.log(`Total Songs:        ${songsRes.rows[0].count}`);
  console.log(`Total Lyrics:       ${lyricsRes.rows[0].count}`);
  console.log(`Total Lyric Lines:  ${linesRes.rows[0].count}`);
  console.log(`Total Rights:       ${rightsRes.rows[0].count}`);

  // 2. Language breakdown
  const langRes = await pool.query(`
    SELECT l.name, count(s.id) as count
    FROM songs s
    JOIN languages l ON s.language_id = l.id
    GROUP BY l.name
    ORDER BY count DESC
  `);
  console.log('\n--- Songs by Language ---');
  console.table(langRes.rows);

  // 3. Duplicate checks
  const dupTitlesRes = await pool.query(`
    SELECT lower(trim(title)) as title, count(*)
    FROM songs
    GROUP BY lower(trim(title))
    HAVING count(*) > 1
  `);
  const dupSlugsRes = await pool.query(`
    SELECT lower(trim(slug)) as slug, count(*)
    FROM songs
    GROUP BY lower(trim(slug))
    HAVING count(*) > 1
  `);

  console.log(`Duplicate Titles Found: ${dupTitlesRes.rows.length}`);
  if (dupTitlesRes.rows.length > 0) {
    console.error('Duplicates:', dupTitlesRes.rows);
  }
  console.log(`Duplicate Slugs Found:  ${dupSlugsRes.rows.length}`);
  if (dupSlugsRes.rows.length > 0) {
    console.error('Duplicates:', dupSlugsRes.rows);
  }

  // 4. Check songs without lyrics
  const missingLyricsRes = await pool.query(`
    SELECT s.id, s.title
    FROM songs s
    LEFT JOIN lyrics l ON s.id = l.song_id
    WHERE l.id IS NULL
  `);
  console.log(`Songs Missing Lyrics:   ${missingLyricsRes.rows.length}`);

  // 5. Check songs without lyric lines
  const missingLinesRes = await pool.query(`
    SELECT s.id, s.title
    FROM songs s
    JOIN lyrics l ON s.id = l.song_id
    LEFT JOIN lyric_lines ll ON l.id = ll.lyrics_id
    WHERE ll.id IS NULL
    GROUP BY s.id, s.title
  `);
  console.log(`Songs Missing Lines:    ${missingLinesRes.rows.length}`);

  // 6. Inspect newly added songs sample
  const sampleRes = await pool.query(`
    SELECT s.title, a.name as artist, l.name as language, s.duration_seconds, count(ll.id) as line_count
    FROM songs s
    JOIN artists a ON s.artist_id = a.id
    JOIN languages l ON s.language_id = l.id
    JOIN lyrics lyr ON s.id = lyr.song_id
    JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
    GROUP BY s.id, s.title, a.name, l.name, s.duration_seconds, s.created_at
    ORDER BY s.created_at DESC
    LIMIT 15
  `);
  console.log('\n--- Recent 15 Songs Added with Synchronized Lyrics ---');
  console.table(sampleRes.rows);

  // 7. Verify media audio files exist on disk
  const mediaFiles = await pool.query('SELECT audio_url FROM songs');
  let missingFiles = 0;
  for (const row of mediaFiles.rows) {
    const filename = row.audio_url.replace('/api/v1/media/stream/', '');
    const filepath = path.resolve('apps/web/public/media', filename);
    if (!fs.existsSync(filepath) || fs.statSync(filepath).size === 0) {
      missingFiles++;
      console.warn(`Missing audio file: ${filename}`);
    }
  }
  console.log(`\nAudio Files on Disk: ${mediaFiles.rows.length - missingFiles} / ${mediaFiles.rows.length} verified.`);

  await pool.end();
}

verifyAll().catch(console.error);
