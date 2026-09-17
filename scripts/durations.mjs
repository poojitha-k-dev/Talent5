import fs from 'fs';

// Helper to estimate duration from MP3 header or file size
const FILES = [
  { file: 'bhavayami_gopalabalam.mp3', expected: 277 },
  { file: 'deva_devam_bhaje.mp3', expected: 251 },
  { file: 'cheri_yasodaku.mp3', expected: 443 },
  { file: 'brahmamokkate.mp3', expected: 268 },
  { file: 'nagumomu_ganaleni.mp3', expected: 136 },
  { file: 'harivarasanam.mp3', expected: 175 },
  { file: 'chinnanchiru_kiliye.mp3', expected: 532 },
  { file: 'jagadoddharana.mp3', expected: 304 },
  { file: 'devachiye_dwari.mp3', expected: 131 },
  { file: 'dukh_bhanjan_tera_naam.mp3', expected: 189 },
  { file: 'vaishnava_janato.mp3', expected: 215 },
  { file: 'ekla_cholo_re.mp3', expected: 239 },
  { file: 'raghupati_raghav.mp3', expected: 465 }
];

console.table(FILES);
