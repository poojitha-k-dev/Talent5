import fs from 'fs';
import path from 'path';

export const WAVE8_DOWNLOADS = [
  // --- KANNADA (Ananda Rao Srirangam - Dasa Sahitya) ---
  {
    key: 'gajavadana_beduve.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/gajavadanA%20bEduvE%20purandara%20dAsaru.mp3',
    name: 'Gajavadana Beduve (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'krishna_nee_begane.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/kRShNA%20nI%20bEgane%20bArO.mp3',
    name: 'Krishna Nee Begane Baro (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'rama_nama_payasakke.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/rAma%20nAma%20pAyasakke.mp3',
    name: 'Rama Nama Payasakke (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'tallanisadiru_kandya.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/tallanisadiru%20kanDya%20tAlu%20manavE%20-%20srI%20kanakadAsaru.mp3',
    name: 'Tallanisadiru Kandya Thalu Manave (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'ranga_baro.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/ranga%20bAro%20pAnduranga%20bAro.mp3',
    name: 'Ranga Baro Panduranga Baro (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'thugire_rangana.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/tUgire%20rangana%20tUgire%20kRShNana.mp3',
    name: 'Thugire Rangana Thugire Krishnana (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'venkataramanane_baro.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/vEnkaTaramaNane%20bArO.mp3',
    name: 'Venkataramanane Baro (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'gummana_karayadire.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/gummana%20karayadirE.mp3',
    name: 'Gummana Karayadire (Kannada - Ananda Rao Srirangam)'
  },

  // --- TAMIL ---
  {
    key: 'ma_ramanan.mp3',
    url: 'https://archive.org/download/kvn-226/KVN-P-05.mp3',
    name: 'Ma Ramanan (Tamil - K. V. Narayanaswamy)'
  },
  {
    key: 'eppo_varuvaro.mp3',
    url: 'https://archive.org/download/kvn-226/KVN-P-10.mp3',
    name: 'Eppo Varuvaro (Tamil - K. V. Narayanaswamy)'
  },
  {
    key: 'thillana_madhuvanthi.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/01%20Thillana%20in%20Madhuvanthi%20-%20Lalgudi%20G%20Jayaraman.mp3',
    name: 'Thillana in Madhuvanthi (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_kedaragowla.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2002/06%20Thillana%20in%20Kedaragowla%20-%20Walajapet%20Venkataramana%20Bhagavatar.mp3',
    name: 'Thillana in Kedaragowla (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_kalyani.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2002/07%20Thillana%20in%20Kalyani%20-%20Sankeerna%20Laghu%20Desadi%20-%20Ponniah%20Pillai.mp3',
    name: 'Thillana in Kalyani (Tamil - Sulochana Pattabhiraman)'
  },

  // --- TELUGU ---
  {
    key: 'sarasa_samadana.mp3',
    url: 'https://archive.org/download/tvs-concert-23/7%20sarasa%20sAmadAna%20-%20kApi%20nArayaNi.mp3',
    name: 'Sarasa Samadana (Telugu - T. V. Sankaranarayanan)'
  },
  {
    key: 'ennaga_manasuku.mp3',
    url: 'https://archive.org/download/kvn-226/KVN-P-07.mp3',
    name: 'Ennaga Manasuku (Telugu - K. V. Narayanaswamy)'
  },
  {
    key: 'mokshamu_galada.mp3',
    url: 'https://archive.org/download/kvn-226/KVN-P-08.mp3',
    name: 'Mokshamu Galada (Telugu - K. V. Narayanaswamy)'
  },

  // --- MALAYALAM ---
  {
    key: 'tharuni_njan.mp3',
    url: 'https://archive.org/download/kvn-mc-tn-swathi-thirunal-1980s/03%20Tharuni%20Gnan%20-%20Dwijavanthi%20-%20Swathi%20Thirunal.mp3',
    name: 'Tharuni Njan (Malayalam - K. V. Narayanaswamy)'
  },
  {
    key: 'alarsara_parithapam.mp3',
    url: 'https://archive.org/download/kvn-mc-tn-swathi-thirunal-1980s/06%20Alarshara%20Parithapam%20-%20Surutti%20-%20Swathi%20Thirunal.mp3',
    name: 'Alarsara Parithapam (Malayalam - K. V. Narayanaswamy)'
  },
  {
    key: 'gopa_nandana.mp3',
    url: 'https://archive.org/download/kvn-mc-tn-swathi-thirunal-1980s/01%20Gopa%20Nandana%20-%20Bhooshavali%20-%20Swathi%20Thirunal.mp3',
    name: 'Gopa Nandana (Malayalam - K. V. Narayanaswamy)'
  },

  // --- BENGALI ---
  {
    key: 'mor_prabhater_ei.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Mor%20Prabhater%20Ei%20II%20Ananya%20Majumdar.mp3',
    name: 'Mor Prabhater Ei (Bengali - Ananya Majumdar)'
  },
  {
    key: 'sansaro_jabe.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Sansaro%20Jabe%20II%20Nilima%20Sen.mp3',
    name: 'Sansaro Jabe (Bengali - Nilima Sen)'
  },
  {
    key: 'nutan_juger_bhore.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Nutan%20juger%20bhore%20Suchitra%20Mitra.mp3',
    name: 'Nutan Juger Bhore (Bengali - Suchitra Mitra)'
  },

  // --- GUJARATI ---
  {
    key: 'mane_pyaru_lage.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2011%20.mp3',
    name: 'Mane Pyaru Lage (Gujarati - Traditional)'
  },
  {
    key: 'he_jagdamba.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2017.mp3',
    name: 'He Jagjanani He Jagdamba (Gujarati - Traditional)'
  },
  {
    key: 'rame_ram_rame.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2018.mp3',
    name: 'Rame Ram Rame (Gujarati - Traditional)'
  },

  // --- PUNJABI ---
  {
    key: 'chet_govind_aradhiaei.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Chet%20govind%20aradhiaei%20%28Baarah%20Maah%20_2%29.mp3',
    name: 'Chet Govind Aradhiaei (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'kirat_karam_ke.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Kirat%20karam%20ke%20veechhde%20%28Baarah%20Maah%20_1%29.mp3',
    name: 'Kirat Karam Ke Veechhde (Punjabi - Bhai Harjinder Singh Ji)'
  },

  // --- MARATHI ---
  {
    key: 'deep_ghevoniya.mp3',
    url: 'https://archive.org/download/deep-ghevoniya-dhunditi-aandhar-by-sant-tukaram-s-phadke/deep%20ghevoniya%20dhunditi%20aandhar%20-%20by%20sant%20tukaram%20-%20s%20phadke.mp3',
    name: 'Deep Ghevoniya Dhunditi Aandhar (Marathi - Sudheer Phadke)'
  },

  // --- HINDI ---
  {
    key: 'sakhiya_wah_ghar.mp3',
    url: 'https://archive.org/download/kumar-gandharva-sakhiya-wha-ghar-sabse-niyara/kumar%20gandharva%20-%20_sakhiya%20wha%20ghar%20sabse%20niyara_.mp3',
    name: 'Sakhiya Wah Ghar Sabse Niyara (Hindi - Kumar Gandharva)'
  }
];

export async function downloadWave8() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE8_DOWNLOADS) {
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

if (process.argv[1] && process.argv[1].includes('download_wave8_gems.mjs')) {
  downloadWave8().catch(console.error);
}
