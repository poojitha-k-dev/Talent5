import fs from 'fs';
import path from 'path';

const WAVE4_DOWNLOADS = [
  {
    key: 'marugelara.mp3',
    url: 'https://archive.org/download/tvs-concert-23/5%20marugElarA%20-%20jayantasree.mp3',
    name: 'Marugelara O Raghava (Telugu - T. V. Sankaranarayanan)'
  },
  {
    key: 'nada_tanumanisham.mp3',
    url: 'https://archive.org/download/kvn-226/KVN-P-01.mp3',
    name: 'Nada Tanumanisham (Telugu - K. V. Narayanaswamy)'
  },
  {
    key: 'adidano_ranga.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/ADidanO%20rangA%20adbhutatindali%20-%20srI%20purandara%20dAsaru.mp3',
    name: 'Adidano Ranga (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'acharavillada_nalige.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/AcAravillada%20nAlige.mp3',
    name: 'Acharavillada Nalige (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'sabhapatikku.mp3',
    url: 'https://archive.org/download/kvn-226/KVN-P-03.mp3',
    name: 'Sabhapatikku Eru Daivamu (Tamil - K. V. Narayanaswamy)'
  },
  {
    key: 'thillana_kapi.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/06%20Thillana%20in%20Kapi%20-%20Lakshmeesham%2025%20-%20Poochi%20Srinivasa%20Iyengar.mp3',
    name: 'Thillana in Kapi (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_khamas.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/07%20Thillana%20in%20Khamas%20-%20Patnam%20Subramania%20Iyer.mp3',
    name: 'Thillana in Khamas (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_dhanasri.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/10%20Thillana%20in%20Dhanasri%20-%20Swathi%20Thirunal.mp3',
    name: 'Thillana in Dhanasri (Malayalam / Sanskrit - Sulochana Pattabhiraman)'
  },
  {
    key: 'adhora_madhuri.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Adhora%20Madhuri%20II%20Ananya%20Majumdar.mp3',
    name: 'Adhora Madhuri (Bengali - Ananya Majumdar)'
  },
  {
    key: 'basante_ki_shudhu.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Basante%20Ki%20Shudhu%20II%20Pramita%20Mallick.mp3',
    name: 'Basante Ki Shudhu (Bengali - Pramita Mallick)'
  },
  {
    key: 'bhai_re_ram_kaho.mp3',
    url: 'https://archive.org/download/jamendo-363938/01-1686767-Ekjot%20Singh-Bhai%20Re%20Ram%20Kaho%20Chit%20Lae%20-%20Bhai%20Harjinder%20Singh%20Ji%20Sri%20Nagar%20Wale.mp3',
    name: 'Bhai Re Ram Kaho Chit Lae (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'gujarati_bhajan_yashwant.mp3',
    url: 'https://archive.org/download/GujaratiBhajanYashwantBhatt2/Gujarati%20Bhajan-Yashwant%20Bhatt%20(2).mp3',
    name: 'Prabhu Bhajo (Gujarati - Yashwant Bhatt)'
  }
];

async function downloadWave4() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE4_DOWNLOADS) {
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

downloadWave4();
