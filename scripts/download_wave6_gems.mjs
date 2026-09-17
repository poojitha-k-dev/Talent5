import fs from 'fs';
import path from 'path';

const WAVE6_DOWNLOADS = [
  {
    key: 'ava_rogavo_enage.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/Ava%20rOgavo%20enagE%20dEva%20danvantri%20-%20republish.mp3',
    name: 'Ava Rogavo Enage (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'yenendu_kondadi.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/Enendu%20konDADi%20stutisalo%20dEva%201.mp3',
    name: 'Yenendu Kondadi (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'odi_barayya.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/ODi%20bAraiyya%20vaikunTha%20pati%20ninna%202.mp3',
    name: 'Odi Barayya Vaikuntha Pati (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'dekhate_pare_ne.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Dekhate%20Pare%20Ne%20Keno%20II%20Ananya%20Majumdar.mp3',
    name: 'Dekhate Pare Ne Keno (Bengali - Ananya Majumdar)'
  },
  {
    key: 'ei_maumachhider.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Ei%20Maumachhider%20Ghar%20Chhara%20II%20Pramita%20Mallick.mp3',
    name: 'Ei Maumachhider Ghar Chhara (Bengali - Pramita Mallick)'
  },
  {
    key: 'daya_diye.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Daya%20Diye%20Sanhita%20Sen.mp3',
    name: 'Daya Diye Hobe Tomay (Bengali - Sanhita Sen)'
  },
  {
    key: 'thillana_senchurutti.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/05%20Thillana%20in%20Senchurutti%20-%20Veena%20Seshanna.mp3',
    name: 'Thillana in Senchurutti (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_kanada.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/08%20Thillana%20in%20Kanada%20-%20Simhanandana%20108%20-%20Maha%20Vaidhyanatha%20Iyer.mp3',
    name: 'Thillana in Kanada (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'namo_narayana.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2013.mp3',
    name: 'Namo Narayana (Gujarati - Traditional)'
  },
  {
    key: 'hari_om_tatsat.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2014.mp3',
    name: 'Hari Om Tatsat (Gujarati - Traditional)'
  }
];

async function downloadWave6() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE6_DOWNLOADS) {
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

downloadWave6();
