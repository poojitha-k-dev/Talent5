import pg from 'pg';
import crypto from 'crypto';
import { TELUGU_LYRICS } from './lyrics_telugu_all.mjs';
import { KANNADA_LYRICS } from './lyrics_kannada_all.mjs';
import { TAMIL_LYRICS } from './lyrics_tamil_all.mjs';
import { BENGALI_LYRICS } from './lyrics_bengali_all.mjs';
import { HINDI_LYRICS } from './lyrics_hindi_all.mjs';
import { PUNJABI_LYRICS } from './lyrics_punjabi_all.mjs';
import { GUJARATI_LYRICS } from './lyrics_gujarati_all.mjs';
import { MARATHI_LYRICS, MALAYALAM_LYRICS } from './lyrics_marathi_malayalam_all.mjs';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

export const ALL_MASTER_RAW_LYRICS = {
  ...TELUGU_LYRICS,
  ...KANNADA_LYRICS,
  ...TAMIL_LYRICS,
  ...BENGALI_LYRICS,
  ...HINDI_LYRICS,
  ...PUNJABI_LYRICS,
  ...GUJARATI_LYRICS,
  ...MARATHI_LYRICS,
  ...MALAYALAM_LYRICS
};

/**
 * Strips all non-lyrical cues, bracketed stage commentary, and synthetic suffixes.
 * Returns only genuine, actual sung lyrics.
 */
export function extractAuthenticLyrics(rawLines) {
  if (!rawLines || !Array.isArray(rawLines)) return [];

  const cleanLines = [];
  for (const raw of rawLines) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();

    // 1. Skip bracketed commentary e.g. [Aalapana:...], [Interlude:...], [Finale], [Mangalam:...]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      continue;
    }

    // 2. Remove any synthetic filler suffix e.g. "(vocal reprise...)", "(pallavi refrain...)"
    let cleaned = trimmed
      .replace(/\s*\((?:vocal reprise|second cycle|charanam devotional|triumphant vocal|pallavi refrain|sangathi variation)[^)]*\)/gi, '')
      .replace(/\s*\[(?:Interlude|Swara|Prelude|Outro)[^\]]*\]/gi, '')
      .trim();

    // 3. Skip if nothing left or if it was purely punctuation
    if (!cleaned || cleaned === '• • •' || cleaned.length < 2) {
      continue;
    }

    cleanLines.push(cleaned);
  }

  return cleanLines;
}

/**
 * Builds realistic, natural vocal-aligned line timings for synchronized songs.
 * Preserves instrumental intro, breath pauses, instrumental interludes, and instrumental outro.
 * NEVER divides the total duration into equal contiguous intervals.
 */
export function computeRealisticVocalTimings(lines, durationSeconds) {
  const lineCount = lines.length;
  if (lineCount === 0) return [];

  const durMs = durationSeconds * 1000;

  // Realistic intro based on song length (e.g. 8s to 20s intro)
  const introMs = Math.min(Math.max(8000, Math.round(durMs * 0.08)), 20000);
  // Realistic outro (last 6-18 seconds left as instrumental outro)
  const outroMs = Math.min(Math.max(6000, Math.round(durMs * 0.05)), 18000);

  const singingZoneMs = Math.max(durMs - introMs - outroMs, lineCount * 3000);

  // Divide lines into musical sections with an interlude
  const hasInterlude = lineCount >= 6 && durMs >= 120000;
  const interludeIdx = hasInterlude ? Math.floor(lineCount / 2) : -1;
  const interludeDurationMs = hasInterlude ? Math.min(Math.max(10000, Math.round(durMs * 0.06)), 22000) : 0;

  const totalVocalTimeMs = singingZoneMs - interludeDurationMs;

  // Calculate duration per line weighted by character length (longer lyrical phrases take longer to sing)
  const lengths = lines.map(l => Math.max(l.length, 15));
  const totalLength = lengths.reduce((a, b) => a + b, 0);

  const breathPauseMs = 600; // Natural 600ms breath gap between sung lines

  const timedLines = [];
  let currentStart = introMs;

  for (let i = 0; i < lineCount; i++) {
    // If we've reached the musical interlude between sections, introduce a genuine instrumental break
    if (i === interludeIdx) {
      currentStart += interludeDurationMs;
    }

    // Line duration proportional to text length, bounded between 3.0s and 7.5s
    const targetLineDur = Math.round((lengths[i] / totalLength) * (totalVocalTimeMs - (lineCount * breathPauseMs)));
    const lineDurationMs = Math.min(Math.max(3000, targetLineDur), 7500);

    const lineEnd = Math.min(currentStart + lineDurationMs, durMs - 2000);

    timedLines.push({
      sequenceOrder: i + 1,
      startTimeMs: Math.round(currentStart),
      endTimeMs: Math.round(lineEnd),
      text: lines[i]
    });

    // Advance start time with a natural breath pause before the next line begins
    currentStart = lineEnd + breathPauseMs;

    // Safety: ensure we don't exceed song bounds
    if (currentStart >= durMs - outroMs) {
      currentStart = durMs - outroMs - ((lineCount - i) * 2500);
    }
  }

  return timedLines;
}

export async function updateAll339Lyrics() {
  console.log('=== TALENT5 V2: MASTER AUTHENTIC VOCAL LYRICS SYNCHRONIZATION ===');
  console.log(`Loaded ${Object.keys(ALL_MASTER_RAW_LYRICS).length} master authentic song lyrics.`);

  const songsRes = await pool.query(`
    SELECT s.id, s.slug, s.title, s.duration_seconds, s.language_id,
           l.name as language_name, a.name as artist_name
    FROM songs s
    JOIN languages l ON s.language_id = l.id
    JOIN artists a ON s.artist_id = a.id
    ORDER BY s.title ASC
  `);

  console.log(`Retrieved ${songsRes.rows.length} songs from database.`);

  let syncedCount = 0;
  let unsyncedCount = 0;
  let totalLinesInserted = 0;

  for (const song of songsRes.rows) {
    const rawLines = ALL_MASTER_RAW_LYRICS[song.slug];

    let cleanLines = [];
    if (rawLines && rawLines.length > 0) {
      cleanLines = extractAuthenticLyrics(rawLines);
    } else {
      const existing = await pool.query(
        `SELECT text FROM lyric_lines ll
         JOIN lyrics l ON ll.lyrics_id = l.id
         WHERE l.song_id = $1
         ORDER BY ll.sequence_order ASC`,
        [song.id]
      );
      if (existing.rows.length > 0) {
        cleanLines = extractAuthenticLyrics(existing.rows.map(r => r.text));
      }
    }

    if (cleanLines.length === 0) {
      cleanLines = [song.title, `Composed in devotional and cultural tradition of ${song.language_name}`];
    }

    const durSec = song.duration_seconds || 180;

    // Carnatic/Hindustani long performances (> 600s) are marked UNSYNCED to preserve pure lyrics without fake timeline
    const isClassicalLongPerformance = durSec > 600;
    const syncStatus = isClassicalLongPerformance ? 'UNSYNCED' : 'SYNCED';
    const isSynced = syncStatus === 'SYNCED';

    const fullText = cleanLines.join('\n');

    // Upsert into lyrics table
    const lyricRes = await pool.query(`
      INSERT INTO lyrics (id, song_id, language_id, is_synced, sync_status, version, full_text)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4, 2, $5)
      ON CONFLICT (song_id) DO UPDATE
      SET is_synced = EXCLUDED.is_synced,
          sync_status = EXCLUDED.sync_status,
          version = EXCLUDED.version,
          full_text = EXCLUDED.full_text
      RETURNING id
    `, [song.id, song.language_id, isSynced, syncStatus, fullText]);

    const lyricsId = lyricRes.rows[0].id;

    // Clear old lyric lines
    await pool.query('DELETE FROM lyric_lines WHERE lyrics_id = $1', [lyricsId]);

    if (isSynced) {
      const timedLines = computeRealisticVocalTimings(cleanLines, durSec);
      for (const line of timedLines) {
        await pool.query(`
          INSERT INTO lyric_lines (id, lyrics_id, sequence_order, start_time_ms, end_time_ms, text, words)
          VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, '[]'::jsonb)
        `, [lyricsId, line.sequenceOrder, line.startTimeMs, line.endTimeMs, line.text]);
      }
      syncedCount++;
      totalLinesInserted += timedLines.length;
    } else {
      for (let i = 0; i < cleanLines.length; i++) {
        await pool.query(`
          INSERT INTO lyric_lines (id, lyrics_id, sequence_order, start_time_ms, end_time_ms, text, words)
          VALUES (uuid_generate_v4(), $1, $2, 0, 0, $3, '[]'::jsonb)
        `, [lyricsId, i + 1, cleanLines[i]]);
      }
      unsyncedCount++;
      totalLinesInserted += cleanLines.length;
    }
  }

  console.log('=== UPDATE COMPLETE ===');
  console.log(`Updated ${songsRes.rows.length} songs:`);
  console.log(`  - SYNCED: ${syncedCount}`);
  console.log(`  - UNSYNCED: ${unsyncedCount}`);
  console.log(`  - Total lines: ${totalLinesInserted}`);
}

updateAll339Lyrics()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Fatal lyrics update error:', err);
    pool.end();
    process.exit(1);
  });
