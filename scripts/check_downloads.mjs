import fs from 'fs';

const NEW_FILES = [
  'bhavayami_gopalabalam.mp3',
  'deva_devam_bhaje.mp3',
  'cheri_yasodaku.mp3',
  'brahmamokkate.mp3',
  'nagumomu_ganaleni.mp3',
  'harivarasanam.mp3',
  'chinnanchiru_kiliye.mp3',
  'jagadoddharana.mp3',
  'devachiye_dwari.mp3',
  'dukh_bhanjan_tera_naam.mp3',
  'vaishnava_janato.mp3',
  'ekla_cholo_re.mp3',
  'raghupati_raghav.mp3'
];

for (const f of NEW_FILES) {
  const p = 'apps/web/public/media/' + f;
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    console.log(`[READY] ${f.padEnd(30)} ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.log(`[MISSING] ${f}`);
  }
}
