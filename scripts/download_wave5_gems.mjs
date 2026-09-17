import fs from 'fs';
import path from 'path';

const WAVE5_DOWNLOADS = [
  {
    key: 'appa_rama_bhakti.mp3',
    url: 'https://archive.org/download/kvn-226/KVN-P-02.mp3',
    name: 'Appa Rama Bhakti (Telugu - K. V. Narayanaswamy)'
  },
  {
    key: 'ramabhirama.mp3',
    url: 'https://archive.org/download/tvs-concert-23/2%20rAmAbhi%20rAma%20-%20darbAr.mp3',
    name: 'Ramabhirama (Telugu - T. V. Sankaranarayanan)'
  },
  {
    key: 'jaya_jaya_swamin.mp3',
    url: 'https://archive.org/download/tvs-concert-26/01%20jaya%20jaya%20swAmin%20-%20nATa.mp3',
    name: 'Jaya Jaya Swamin (Telugu - T. V. Sankaranarayanan)'
  },
  {
    key: 'yenu_dhanyalo.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/Enu%20dhanyalO%20lakumi%20edited.mp3',
    name: 'Yenu Dhanyalo Lakumi (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'alli_nodalu_rama.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/alli%20nOdalu%20rAmA.mp3',
    name: 'Alli Nodalu Rama (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'anjikinyatakayya.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/anjikinyAtakayyA%20purandara%20dAsaru.mp3',
    name: 'Anjikinyatakayya (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'thillana_anandabhairavi.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/02%20Thillana%20in%20Anandabhairavi%20-%20Thanjavur%20Sankara%20Iyer.mp3',
    name: 'Thillana in Anandabhairavi (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_poornachandrika.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2002/08%20Thillana%20in%20Poornachandrika%20-%20Patnam%20Subramania%20Iyer.mp3',
    name: 'Thillana in Poornachandrika (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'charano_dharite.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Charano%20Dharite%20Diyogo%20Amare%20Hemanta%20Mukhopadhyay.mp3',
    name: 'Charano Dharite Diyogo Amare (Bengali - Hemanta Mukhopadhyay)'
  },
  {
    key: 'dhwanilo_ahabano.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Dhwanilo%20Ahabwano%20Madhur%20Suchitra%20Mitra.mp3',
    name: 'Dhwanilo Ahabano Madhuro (Bengali - Suchitra Mitra)'
  },
  {
    key: 'e_bela_dak_porechhe.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/E%20Bela%20Dak%20Porechhe%20II%20Pramita%20Mallick.mp3',
    name: 'E Bela Dak Porechhe (Bengali - Pramita Mallick)'
  },
  {
    key: 'kya_pehru.mp3',
    url: 'https://archive.org/download/jamendo-372060/01-1689279-Ekjot%20Singh-Kya%20Pehru%20Kya%20Odh%20Dikhau%20-%20Bhai%20Harjinder%20Singh%20Ji%20Sri%20Nagar%20Wale.mp3',
    name: 'Kya Pehru Kya Odh Dikhau (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'hau_mango.mp3',
    url: 'https://archive.org/download/jamendo-388517/01-1734531-Ekjot%20Singh-Hau%20Mango%20Santan%20Rena%20-%20Bhai%20Harjinder%20Singh%20Ji%20Sri%20Nagar%20Wale.mp3',
    name: 'Hau Mango Santan Rena (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'hari_mhana_tumi.mp3',
    url: 'https://archive.org/download/DnyaneshwarHaripatha/haripath_Baba_Maharaj_Satartkar-64_abhang1-3.mp3',
    name: 'Hari Mhana Tumi (Marathi - Baba Maharaj Satarkar)'
  },
  {
    key: 'he_karuna_na_karnara.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2012.mp3',
    name: 'He Karuna Na Karnara (Gujarati - Traditional)'
  }
];

async function downloadWave5() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE5_DOWNLOADS) {
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

downloadWave5();
