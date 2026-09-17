import fs from 'fs';
import path from 'path';

const WAVE2_DOWNLOADS = [
  {
    key: 'bho_shambo.mp3',
    url: 'https://archive.org/download/BhoShambo/Bho%20Shambo.mp3',
    name: 'Bho Shambo (Tamil - Swami Dayananda Saraswati)'
  },
  {
    key: 'thiruvadi_charanam.mp3',
    url: 'https://archive.org/download/BS-Raja-Iyengar-collection/07%20Thiruvadi%20Charanam%20-%20Kambodhi%20-%20Gopalakrishna%20Bharathi.mp3',
    name: 'Thiruvadi Charanam (Tamil - B. S. Raja Iyengar)'
  },
  {
    key: 'iha_param_tharum.mp3',
    url: 'https://archive.org/download/BS-Raja-Iyengar-collection/02%20Iha%20Param%20Tharum%20-%20Khamas%20-%20Neelakanta%20Sivan.mp3',
    name: 'Iha Param Tharum (Tamil - B. S. Raja Iyengar)'
  },
  {
    key: 'omanathinkal_kidavo.mp3',
    url: 'https://archive.org/download/omanathinkal/05Omanathinkal-Nikitha.mp3',
    name: 'Omanathinkal Kidavo (Malayalam - Nikitha / Irayimman Thampi)'
  },
  {
    key: 'ksheera_sagara_sayana.mp3',
    url: 'https://archive.org/download/BS-Raja-Iyengar-collection/04%20Ksheera%20Sagara%20Sayana%20-%20Devagandhari.mp3',
    name: 'Ksheera Sagara Sayana (Telugu - B. S. Raja Iyengar)'
  },
  {
    key: 'geetharthamu.mp3',
    url: 'https://archive.org/download/BS-Raja-Iyengar-collection/06%20Geetharthamu%20-%20Surutti%20-%20Thyagaraja.mp3',
    name: 'Geetharthamu (Telugu - B. S. Raja Iyengar)'
  },
  {
    key: 'cahum_vedim.mp3',
    url: 'https://archive.org/download/DnyaneshwarHaripatha/02_cahum_vedim_H02_Kadkade.mp3',
    name: 'Cahum Vedim Haripath (Marathi - Ajit Kadkade)'
  },
  {
    key: 'triguna_asara.mp3',
    url: 'https://archive.org/download/DnyaneshwarHaripatha/03_triguna_asara_H03_Kadkade.mp3',
    name: 'Triguna Asara Haripath (Marathi - Ajit Kadkade)'
  },
  {
    key: 'tum_karo_daya.mp3',
    url: 'https://archive.org/download/tum-karo-daya-mere-sayin-bhai-tarlochan-singh-ragi/Tum%20Karo%20Daya%20Mere%20Sayin%20-%20Bhai%20Tarlochan%20Singh%20Ragi.mp3',
    name: 'Tum Karo Daya Mere Sayin (Punjabi - Bhai Tarlochan Singh)'
  },
  {
    key: 'mere_ram_rae.mp3',
    url: 'https://archive.org/download/tum-karo-daya-mere-sayin-bhai-tarlochan-singh-ragi/Mere%20Ram%20Rae%20-%20Bhai%20Tarlochan%20Singh%20Ragi.mp3',
    name: 'Mere Ram Rae (Punjabi - Bhai Tarlochan Singh)'
  },
  {
    key: 'asin_khatte_bahut.mp3',
    url: 'https://archive.org/download/tum-karo-daya-mere-sayin-bhai-tarlochan-singh-ragi/Asin%20Khatte%20Bahut%20Kamanwde%20-%20Bhai%20Tarlochan%20Singh%20Ragi.mp3',
    name: 'Asin Khatte Bahut Kamanwde (Punjabi - Bhai Tarlochan Singh)'
  },
  {
    key: 'anandaloke_mangalaloke.mp3',
    url: 'https://archive.org/download/anondoloke-pragati-bodhisatwa-satarupa-subrata-anikpati/ANONDOLOKE_Pragati%20Bodhisatwa%20Satarupa%20Subrata%20Anikpati.mp3',
    name: 'Anandaloke Mangalaloke (Bengali - Pragati Bodhisatwa / Rabindranath Tagore)'
  },
  {
    key: 'payoji_maine_ram_ratan.mp3',
    url: 'https://archive.org/download/jamendo-337588/01-1510135-Sujay%20Govindaraj-Payoji%20Maine%20_Meera%20Bhajan_.mp3',
    name: 'Payoji Maine Ram Ratan (Hindi - Sujay Govindaraj / Mirabai)'
  }
];

async function downloadWave2() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE2_DOWNLOADS) {
    const filePath = path.join(dir, item.key);
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100000) {
      console.log(`[EXISTS] ${item.name} (${fs.statSync(filePath).size} bytes)`);
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
      console.log(`[SAVED] ${item.name}: ${(buf.byteLength / 1024 / 1024).toFixed(2)} MB`);
    } catch (e) {
      console.error(`Error downloading ${item.name}:`, e.message);
    }
  }
}

downloadWave2();
