import { TELUGU_LYRICS } from './lyrics_telugu_all.mjs';
import { KANNADA_LYRICS } from './lyrics_kannada_all.mjs';
import { TAMIL_LYRICS } from './lyrics_tamil_all.mjs';
import { BENGALI_LYRICS } from './lyrics_bengali_all.mjs';
import { HINDI_LYRICS } from './lyrics_hindi_all.mjs';
import { PUNJABI_LYRICS } from './lyrics_punjabi_all.mjs';
import { GUJARATI_LYRICS } from './lyrics_gujarati_all.mjs';
import { MARATHI_LYRICS, MALAYALAM_LYRICS } from './lyrics_marathi_malayalam_all.mjs';
import fs from 'fs';

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

console.log(`Catalog total songs: ${catalog.length}`);
console.log(`Total lyric keys across modules: ${Object.keys(allLyrics).length}`);

let missing = 0;
for (const song of catalog) {
  if (!allLyrics[song.slug]) {
    console.error(`Missing lyrics for: ${song.slug} (${song.title})`);
    missing++;
  }
}

if (missing === 0) {
  console.log('PERFECT: Every single one of the 339 songs has a matching lyrics entry!');
} else {
  console.error(`ERROR: ${missing} songs are missing lyrics!`);
}

const badPatterns = [
  'anedi parama pavana geethamu',
  'gaavat naina neer bhaye',
  'gaata manva maaro',
  'tere baajhon jee nahin',
  'enum tirunaamam paadi',
  'endu nambide ninna paada',
  'baje amar praane gopone',
  'gajar kari bhakt daat'
];

let badCount = 0;
for (const [slug, lines] of Object.entries(allLyrics)) {
  for (const line of lines) {
    for (const bp of badPatterns) {
      if (line.toLowerCase().includes(bp)) {
        console.warn(`Template phrase detected in [${slug}]: "${bp}"`);
        badCount++;
      }
    }
  }
}

console.log(`Template/fallback phrases found in new modules: ${badCount}`);

// Line count distribution
let minLines = Infinity;
let maxLines = 0;
let shortCount = 0;
for (const [slug, lines] of Object.entries(allLyrics)) {
  if (lines.length < minLines) minLines = lines.length;
  if (lines.length > maxLines) maxLines = lines.length;
  if (lines.length < 10) shortCount++;
}

console.log(`Line count range: min ${minLines} lines, max ${maxLines} lines`);
console.log(`Songs with fewer than 10 lines: ${shortCount}`);
