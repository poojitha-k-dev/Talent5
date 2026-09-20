import fs from 'fs';
import { TELUGU_LYRICS } from './lyrics_telugu_all.mjs';
import { KANNADA_LYRICS } from './lyrics_kannada_all.mjs';
import { TAMIL_LYRICS } from './lyrics_tamil_all.mjs';
import { BENGALI_LYRICS } from './lyrics_bengali_all.mjs';
import { HINDI_LYRICS } from './lyrics_hindi_all.mjs';
import { PUNJABI_LYRICS } from './lyrics_punjabi_all.mjs';
import { GUJARATI_LYRICS } from './lyrics_gujarati_all.mjs';
import { MARATHI_LYRICS, MALAYALAM_LYRICS } from './lyrics_marathi_malayalam_all.mjs';

const catalog = JSON.parse(fs.readFileSync('scripts/catalog_339_dump.json', 'utf8'));

const allLyrics = {
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

console.log(`Checking all ${catalog.length} catalog songs...`);

let totalLines = 0;
let minLineDuration = Infinity;
let maxLineDuration = 0;
let songsWithExcessiveLineDuration = 0;

for (const song of catalog) {
  const baseLines = allLyrics[song.slug];
  if (!baseLines) {
    console.error(`Missing lyrics for: ${song.slug}`);
    continue;
  }

  // If long song (> 240s) and fewer than 15 lines, we expand with natural vocal repetitions & swaras
  let lines = [...baseLines];
  const durSec = song.duration_seconds || 180;

  if (durSec > 240 && lines.length < 15) {
    // Check if we can enrich the singing lines naturally
    const expanded = [];
    for (let i = 0; i < lines.length; i++) {
      expanded.push(lines[i]);
      // If this is a main singing line (not a bracketed cue) and the song is long,
      // vocal performances in Indian music typically repeat the theme or add sangathi variations
      if (!lines[i].startsWith('[') && lines.length < 16 && (i === 1 || i === 3 || i === 6)) {
        expanded.push(`${lines[i]} (sangathi / vocal variation)`);
      }
    }
    lines = expanded;
  }

  totalLines += lines.length;
  const avgLineSec = durSec / lines.length;
  if (avgLineSec > 35) {
    songsWithExcessiveLineDuration++;
  }
}

console.log(`Processed ${catalog.length} songs.`);
console.log(`Total lines planned: ${totalLines} (avg ${Math.round(totalLines / catalog.length)} lines/song)`);
console.log(`Songs with avg line duration > 35s: ${songsWithExcessiveLineDuration}`);
