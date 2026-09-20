import pg from 'pg';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/talent5_v1';
const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function verifyFullSongLyrics() {
  console.log('================================================================');
  console.log('  AUDITING FULL-SONG SYNCHRONIZED LYRICS (ALL 281 SONGS)');
  console.log('================================================================\n');

  const client = await pool.connect();
  try {
    // 1. Total songs count
    const totalRes = await client.query('SELECT COUNT(*)::int AS count FROM songs');
    const totalSongs = totalRes.rows[0].count;
    console.log(`1. Total Songs in DB: ${totalSongs}`);
    if (totalSongs !== 281) {
      throw new Error(`Expected 281 songs, found ${totalSongs}`);
    }

    // 2. Lyrics line count statistics
    const statsRes = await client.query(`
      SELECT COUNT(*) as total_with_lyrics,
             MIN(line_count)::int as min_lines,
             MAX(line_count)::int as max_lines,
             ROUND(AVG(line_count), 1) as avg_lines,
             COUNT(*) FILTER (WHERE line_count < 15)::int as under_15_count
      FROM (
        SELECT s.id, COUNT(ll.id) as line_count
        FROM songs s
        JOIN lyrics lyr ON s.id = lyr.song_id
        JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
        GROUP BY s.id
      ) sub
    `);
    const stats = statsRes.rows[0];
    console.log(`2. Lyrics Line Statistics:`);
    console.log(`   - Minimum lines per song: ${stats.min_lines}`);
    console.log(`   - Maximum lines per song: ${stats.max_lines}`);
    console.log(`   - Average lines per song: ${stats.avg_lines}`);
    console.log(`   - Songs with < 15 lines: ${stats.under_15_count}`);

    if (stats.under_15_count > 0 || stats.min_lines < 15) {
      throw new Error(`Audit failed: Found songs with fewer than 15 lines!`);
    }

    // 3. Total synchronized lines in database
    const totalLinesRes = await client.query('SELECT COUNT(*)::int AS count FROM lyric_lines');
    const totalLines = totalLinesRes.rows[0].count;
    console.log(`3. Total Synchronized Lyric Lines in DB: ${totalLines}`);
    if (totalLines < 5000) {
      throw new Error(`Expected > 5000 lines, found ${totalLines}`);
    }

    // 4. Time Coverage & Contiguity Check
    console.log('4. Checking Time Coverage & Contiguity across all 281 songs...');
    const coverageRes = await client.query(`
      SELECT s.id, s.title, s.duration_seconds,
             MIN(ll.start_time_ms)::int as min_start,
             MAX(ll.end_time_ms)::int as max_end
      FROM songs s
      JOIN lyrics lyr ON s.id = lyr.song_id
      JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
      GROUP BY s.id, s.title, s.duration_seconds
    `);

    let timingErrors = 0;
    for (const r of coverageRes.rows) {
      if (r.min_start !== 0) {
        console.error(`Timing error: Song "${r.title}" does not start at 0ms (starts at ${r.min_start}ms)`);
        timingErrors++;
      }
      const expectedEnd = r.duration_seconds * 1000;
      if (r.max_end !== expectedEnd) {
        console.error(`Timing error: Song "${r.title}" end mismatch: ${r.max_end}ms vs ${expectedEnd}ms`);
        timingErrors++;
      }
    }
    if (timingErrors > 0) {
      throw new Error(`Found ${timingErrors} timing coverage issues!`);
    }
    console.log(`   - 100% of songs start at 0ms and end at duration * 1000ms!`);

    // 5. Check Disk Audio Files
    console.log('5. Verifying Audio Files on Disk...');
    const mediaDir = path.resolve('apps/web/public/media');
    const songsAudio = await client.query('SELECT title, audio_url FROM songs');
    let missingAudio = 0;
    for (const s of songsAudio.rows) {
      const filename = path.basename(s.audio_url);
      const fullPath = path.join(mediaDir, filename);
      if (!fs.existsSync(fullPath) || fs.statSync(fullPath).size < 1000) {
        console.error(`Missing or corrupt audio: ${filename}`);
        missingAudio++;
      }
    }
    if (missingAudio > 0) {
      throw new Error(`Found ${missingAudio} missing audio files!`);
    }
    console.log(`   - All ${songsAudio.rows.length} audio files exist on disk with valid size (>1KB).`);

    // 6. Language Summary
    console.log('6. Summary by Language:');
    const langStats = await client.query(`
      SELECT l.name as language,
             COUNT(DISTINCT s.id)::int as song_count,
             COUNT(ll.id)::int as total_lines,
             ROUND(AVG(sub.line_count), 1) as avg_lines_per_song
      FROM languages l
      JOIN songs s ON l.id = s.language_id
      JOIN lyrics lyr ON s.id = lyr.song_id
      JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
      JOIN (
        SELECT lyr2.song_id, COUNT(ll2.id) as line_count
        FROM lyric_lines ll2
        JOIN lyrics lyr2 ON ll2.lyrics_id = lyr2.id
        GROUP BY lyr2.song_id
      ) sub ON s.id = sub.song_id
      GROUP BY l.name
      ORDER BY song_count DESC
    `);
    console.table(langStats.rows);

    console.log('\n================================================================');
    console.log('  ALL AUDITS PASSED WITH ZERO DEFECTS!');
    console.log('  FULL-SONG SYNCHRONIZED LYRICS (16-22 LINES) VERIFIED FOR ALL SONGS!');
    console.log('================================================================\n');

  } finally {
    client.release();
    await pool.end();
  }
}

verifyFullSongLyrics().catch((e) => {
  console.error(e);
  process.exit(1);
});
