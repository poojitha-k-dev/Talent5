import fs from 'fs';
import path from 'path';

const WAVE3_DOWNLOADS = [
  {
    key: 'rara_chinnanna.mp3',
    url: 'https://archive.org/download/RArAChinnannAMSSubbalakshmi/0077_rArA%20chinnannA_MSSubbalakshmi.mp3',
    name: 'Ra Ra Chinnanna (Telugu - M. S. Subbulakshmi)'
  },
  {
    key: 'marali_marali.mp3',
    url: 'https://archive.org/download/MaraliMaraliJayaMaMgaLamu/0196_marali%20marali%20jaya%20maMgaLamu_MSSubbalakshmi.mp3',
    name: 'Marali Marali Jaya Mangalamu (Telugu - M. S. Subbulakshmi)'
  },
  {
    key: 'kaladinde_maata.mp3',
    url: 'https://archive.org/download/KALADINDEMAATA/0227_KALADINDE%20MAATA_MSSubbalakshmi.mp3',
    name: 'Kaladinde Maata (Telugu - M. S. Subbulakshmi)'
  },
  {
    key: 'rara_ma_intidaga.mp3',
    url: 'https://archive.org/download/tvs-concert-26/02%20rA%20rA%20mA%20inTidAga%20-%20asAvEri.mp3',
    name: 'Ra Ra Ma Intidaga (Telugu - T. V. Sankaranarayanan)'
  },
  {
    key: 'sakala_graha_bala.mp3',
    url: 'https://archive.org/download/tvs-concert-26/04%20sakala%20gruha%20phalaneenE%20-%20aTANA.mp3',
    name: 'Sakala Graha Bala Neene (Kannada - T. V. Sankaranarayanan)'
  },
  {
    key: 'neene_doddavano.mp3',
    url: 'https://archive.org/download/tvs-concert-26/10%20neenE%20doDDavanO%20-%20rEvati.mp3',
    name: 'Neene Doddavano (Kannada - T. V. Sankaranarayanan)'
  },
  {
    key: 'ee_pariya_sobagu.mp3',
    url: 'https://archive.org/download/tvs-concert-23/3%20ee%20pariya%20-%20rAgamAlikA.mp3',
    name: 'Ee Pariya Sobagu (Kannada - T. V. Sankaranarayanan)'
  },
  {
    key: 'smara_janaka.mp3',
    url: 'https://archive.org/download/tvs-concert-26/07%20smarajanaka%20-%20behAg.mp3',
    name: 'Smara Janaka (Malayalam / Sanskrit - T. V. Sankaranarayanan)'
  },
  {
    key: 'bhave_vina_bhakti.mp3',
    url: 'https://archive.org/download/DnyaneshwarHaripatha/04_bhavevina_bhakti_H04_Kadkade.mp3',
    name: 'Bhave Vina Bhakti (Marathi - Ajit Kadkade)'
  },
  {
    key: 'yoga_yaga_vidhi.mp3',
    url: 'https://archive.org/download/DnyaneshwarHaripatha/05_yoga_yaga_H05_Kadkade.mp3',
    name: 'Yoga Yaga Vidhi (Marathi - Ajit Kadkade)'
  },
  {
    key: 'sadhu_bodha_jhala.mp3',
    url: 'https://archive.org/download/DnyaneshwarHaripatha/06_sadhubodha_jhala_H06_Kadkade.mp3',
    name: 'Sadhu Bodha Jhala (Marathi - Ajit Kadkade)'
  },
  {
    key: 'thillana_behag.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/03%20Thillana%20in%20Behag%20-%20Papanasam%20Sivan.mp3',
    name: 'Thillana in Behag (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_bilahari.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/04%20Thillana%20in%20Bilahari%20-%20Ariyakkudi%20Ramanuja%20Iyengar.mp3',
    name: 'Thillana in Bilahari (Tamil - Sulochana Pattabhiraman)'
  }
];

async function downloadWave3() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE3_DOWNLOADS) {
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

downloadWave3();
