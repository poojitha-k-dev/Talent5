import fs from 'fs';
import path from 'path';

const WAVE7_DOWNLOADS = [
  {
    key: 'jaya_jaya_ganapati.mp3',
    url: 'https://archive.org/download/tvs-concert-23/1%20jaya%20jaya%20gaNapati%20-%20hamsadwani.mp3',
    name: 'Jaya Jaya Ganapati (Telugu - T. V. Sankaranarayanan)'
  },
  {
    key: 'bagilanu_teredu.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/bAgilanu%20teredu%20sEvayanu%20koDo.mp3',
    name: 'Bagilanu Teredu (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'chandrachooda.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/candra%20cUDa%20shivashankara%20pArvati%20-%20song.mp3',
    name: 'Chandrachooda Shiva Shankara (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'bhooshanakke.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/bhUShaNakke%20bhUShaNa%20idu%20bhUShaNa.mp3',
    name: 'Bhooshanakke Bhooshana (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'bare_namma_manege.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/bArE%20nammani%20tanaka.mp3',
    name: 'Bare Namma Manege (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'thillana_vasantha.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2002/02%20Thillana%20in%20Vasantha%20-%20Ammachatram%20Kannusami%20Pillai.mp3',
    name: 'Thillana in Vasantha (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_hindolam.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2002/05%20Thillana%20in%20Hindolam%20-%20Kanda%20Eka%20-%20T%20Subbier.mp3',
    name: 'Thillana in Hindolam (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_sankarabaranam.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/09%20Thillana%20in%20Sankarabaranam%20-%20Tisra%20Adi%20-%20Ponniah%20Pillai.mp3',
    name: 'Thillana in Sankarabaranam (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_bageshri.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2002/01%20Thillana%20in%20Bageshri%20-%20Kanda%20Chapu%20-%20T%20K%20Rangachari.mp3',
    name: 'Thillana in Bageshri (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'jakhon_porbe_na.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Jakhan%20porbe%20na%20Hemanta%20Mukhopadhyay.mp3',
    name: 'Jakhon Porbe Na (Bengali - Hemanta Mukhopadhyay)'
  },
  {
    key: 'mor_veena.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Mor%20Veena%20Hemanta%20Mukhopadhyay.mp3',
    name: 'Mor Veena (Bengali - Hemanta Mukhopadhyay)'
  },
  {
    key: 'nayan_tomare.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Nayan%20Tomare%20Pay%20II%20Nilima%20Sen.mp3',
    name: 'Nayan Tomare Pay (Bengali - Nilima Sen)'
  },
  {
    key: 'he_nutan.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/He%20Natun%20II%20Swagatalakshmi%20Dasgupta.mp3',
    name: 'He Nutan (Bengali - Swagatalakshmi Dasgupta)'
  },
  {
    key: 'shree_krishna_sharanam.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2015.mp3',
    name: 'Shree Krishna Sharanam Mama (Gujarati - Traditional)'
  },
  {
    key: 'govind_bolo.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2016.mp3',
    name: 'Govind Bolo Hari Gopal Bolo (Gujarati - Traditional)'
  }
];

async function downloadWave7() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE7_DOWNLOADS) {
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

downloadWave7();
