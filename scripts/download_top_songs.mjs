import fs from 'fs';
import path from 'path';

const map = JSON.parse(fs.readFileSync('apps/web/src/lib/media-catalog-map.json', 'utf8'));

const topKeys = [
  'bhavaye_sri_gopalam.mp3',
  'enduku_dayaradura.mp3',
  'tanayuni_brova.mp3',
  'bhavamu_lona_ms_subbulakshmi.mp3',
  'jinn_jinn_naam.mp3',
  'sundari_nee_divya_rupamu.mp3',
  'seetapathe_na_manasuna.mp3',
  'harivarasanam.mp3',
  'deva_devam_bhaje.mp3',
  'brahmamokkate.mp3',
];

const destDir = path.resolve('apps/web/public/media');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function run() {
  console.log('Downloading top songs to', destDir);
  for (const key of topKeys) {
    const url = map[key];
    if (!url) {
      console.warn('No URL for', key);
      continue;
    }
    const dest = path.join(destDir, key);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100000) {
      console.log(`[Already exists] ${key} (${(fs.statSync(dest).size / 1024 / 1024).toFixed(2)} MB)`);
      continue;
    }
    console.log(`Downloading ${key} from ${url}...`);
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) {
        console.warn(`Failed ${key}: status ${res.status}`);
        continue;
      }
      const buf = await res.arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buf));
      console.log(`✓ Downloaded ${key} (${(buf.byteLength / 1024 / 1024).toFixed(2)} MB)`);
    } catch (e) {
      console.warn(`Error downloading ${key}:`, e.message);
    }
  }
}

run();
