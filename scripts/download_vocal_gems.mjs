import fs from 'fs';
import path from 'path';

const DOWNLOADS = [
  {
    key: 'deva_devam_bhaje.mp3',
    url: 'https://archive.org/download/DevaDevamBhajeMSSubbalakshmiHindolam/0053_deva%20Devam%20Bhaje_MSSubbalakshmi_hindolam.mp3',
    name: 'Deva Devam Bhaje (Telugu - M. S. Subbulakshmi)'
  },
  {
    key: 'cheri_yasodaku.mp3',
    url: 'https://archive.org/download/CheriYasodakuSisuvu/0014_Cheri_Yasodaku_Sisuvu_MSSubbalakshmi_mohana.mp3',
    name: 'Cheri Yasodaku Sisuvu (Telugu - M. S. Subbulakshmi)'
  },
  {
    key: 'brahmamokkate.mp3',
    url: 'https://archive.org/download/TandananaAhiBrahmamokkate/0037_Tandanana_BKP.mp3',
    name: 'Brahmamokkate (Telugu - B. K. Padmanabha)'
  },
  {
    key: 'harivarasanam.mp3',
    url: 'https://archive.org/download/Harivarasanam_201510/Harivarasanam%20-%20Harivarasanam.mp3',
    name: 'Harivarasanam (Malayalam - K. J. Yesudas)'
  },
  {
    key: 'vaishnava_janato.mp3',
    url: 'https://archive.org/download/VaishnavaJanato.../VaishnavaJanato%20.....mp3',
    name: 'Vaishnava Janato (Gujarati - M. S. Subbulakshmi)'
  },
  {
    key: 'ekla_cholo_re.mp3',
    url: 'https://archive.org/download/EklaCholoRe/EklaCholoRe-KishoreKumar.mp3',
    name: 'Ekla Cholo Re (Bengali - Kishore Kumar)'
  },
  {
    key: 'chinnanchiru_kiliye.mp3',
    url: 'https://archive.org/download/ChinnanchiruKiliye28/Chinnanchiru%20Kiliye%20%20%20-28.mp3',
    name: 'Chinnanchiru Kiliye (Tamil - Bharathiyar)'
  }
];

async function downloadAll() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of DOWNLOADS) {
    const filePath = path.join(dir, item.key);
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100000) {
      console.log(`Already downloaded: ${item.name} (${fs.statSync(filePath).size} bytes)`);
      continue;
    }
    console.log(`Downloading: ${item.name} from ${item.url}`);
    try {
      const res = await fetch(item.url, { redirect: 'follow' });
      if (!res.ok) {
        console.error(`Failed ${item.name}: Status ${res.status}`);
        continue;
      }
      const buf = await res.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buf));
      console.log(`Downloaded ${item.name}: ${(buf.byteLength / 1024 / 1024).toFixed(2)} MB`);
    } catch (e) {
      console.error(`Error downloading ${item.name}:`, e.message);
    }
  }
}

downloadAll();
