import fs from 'fs';
import path from 'path';

export const WAVE10_DOWNLOADS = [
  // --- KANNADA (Ananda Rao Srirangam) ---
  {
    key: 'gali_banda_kaiyalli.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/gALi%20banda%20kaiyalli%20dUri%20koLLiro.mp3',
    name: 'Gali Banda Kaiyalli (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'haridasara_sanga.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/haridAsara%20sanga%20dorekitu%20enagIga.mp3',
    name: 'Haridasara Sanga Dorekitu (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'intha_hennina.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/inthA%20heNNina%20nAnelli%20kANeno.mp3',
    name: 'Intha Hennina Nanelli Kaneno (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'kagata_bandide.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/kAgata%20bandide.mp3',
    name: 'Kagata Bandide (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'maneyolagado_govinda.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/maneyoLagADO%20gOvinda.mp3',
    name: 'Maneyolagado Govinda (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'na_madida_karma.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/nA%20mADida%20karma%20balavantavAdare%202.mp3',
    name: 'Na Madida Karma Balavantavadare (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'narasimha_mantra.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/narasimha%20mantra%20ondiralu%20sAkku.mp3',
    name: 'Narasimha Mantra Ondiralu Sakku (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'entha_punyave_gopi.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/enthA%20puNyave%20gOpi.mp3',
    name: 'Entha Punyave Gopi (Kannada - Ananda Rao Srirangam)'
  },

  // --- BENGALI ---
  {
    key: 'aguner_poroshmoni.mp3',
    url: 'https://archive.org/download/ClassicSongVolume1/Aguner%20Poroshmoni.mp3',
    name: 'Aguner Poroshmoni (Bengali - Hemanta Mukhopadhyay)'
  },
  {
    key: 'aha_aji_e_boshanto.mp3',
    url: 'https://archive.org/download/RabindraSangeet/01.AhaAjiEBoshanto.mp3',
    name: 'Aha Aji E Boshanto (Bengali - Suchitra Mitra)'
  },
  {
    key: 'bhalobashi_bhalobashi.mp3',
    url: 'https://archive.org/download/RabindraSangeet/01.BhalobashiBhalobashi.mp3',
    name: 'Bhalobashi Bhalobashi (Bengali - Hemanta Mukhopadhyay)'
  },
  {
    key: 'amar_mon_manena.mp3',
    url: 'https://archive.org/download/RabindraSangeet/04.AmarMonManena.mp3',
    name: 'Amar Mon Manena (Bengali - Suchitra Mitra)'
  },
  {
    key: 'aamar_e_poth.mp3',
    url: 'https://archive.org/download/ClassicSongVolume1/Aamar%20E%20Poth%20Tomar%20Pather.mp3',
    name: 'Aamar E Poth Tomar Pather (Bengali - Gautam Mitra)'
  },
  {
    key: 'aamar_prabhat.mp3',
    url: 'https://archive.org/download/ClassicSongVolume1/Aamar%20Prabhat%20Madhur%20Holo.mp3',
    name: 'Aamar Prabhat Madhur Holo (Bengali - Promit Sen)'
  },

  // --- GUJARATI (GujaratiBhajan18) ---
  {
    key: 'gujarati_bhajan_11.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2011%20.mp3',
    name: 'Mane Vhalu Lage Shreeji (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_12.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2012.mp3',
    name: 'Bhakti Karvi Ene (Gujarati - Hemant Chauhan)'
  },
  {
    key: 'gujarati_bhajan_13.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2013.mp3',
    name: 'Kanha Ne Makhan Bhave (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_14.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2014.mp3',
    name: 'Nand Ke Anand Bhayo (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_15.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2015.mp3',
    name: 'Shree Krishna Govind Hare Murari (Gujarati - Traditional)'
  },

  // --- PUNJABI (Bhai Harjinder Singh Ji Sri Nagar Wale) ---
  {
    key: 'jinn_jinn_naam.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Jinn%20jinn%20naam%20dhyaeya%2014.mp3',
    name: 'Jinn Jinn Naam Dhyaeya (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'kattak_karam.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Kattak%20karam%20kamavane%20%28Baarah%20Maah%20_9%29.mp3',
    name: 'Kattak Karam Kamavane (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'maagh_majan.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Maagh%20majan%20sangh%20sadhuaa%20%28Baarah%20Maah%20_12%29.mp3',
    name: 'Maagh Majan Sangh Sadhuaa (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'manghar_mahe.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Manghar%20mahe%20sohandiyan%20%28Baarah%20Maah%20_10%29.mp3',
    name: 'Manghar Mahe Sohandiyan (Punjabi - Bhai Harjinder Singh Ji)'
  },

  // --- TAMIL ---
  {
    key: 'thillana_kapi_kunrakkudi.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2002/03%20Thillana%20in%20Kapi%20-%20Kunrakkudi%20Krishna%20Iyer.mp3',
    name: 'Thillana in Kapi Kunrakkudi (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_sankarabaranam_desadi.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2002/04%20Thillana%20in%20Sankarabaranam%20-%20Desadi%20-%20Moolaiveettu%20Rangasami%20Pillai.mp3',
    name: 'Thillana in Sankarabaranam Desadi (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'pranatoshmi_devam.mp3',
    url: 'https://archive.org/download/tvs-concert-24/1%20praNatOshmi%20dEvam%20-%20nATa.mp3',
    name: 'Pranatoshmi Devam (Tamil / Sanskrit - T. V. Sankaranarayanan)'
  },

  // --- TELUGU ---
  {
    key: 'seetapathe_na_manasuna.mp3',
    url: 'https://archive.org/download/tvs-concert-24/4%20seetApatE%20-%20kamAs.mp3',
    name: 'Seetapathe Na Manasuna (Telugu - T. V. Sankaranarayanan)'
  },
  {
    key: 'tanayuni_brova.mp3',
    url: 'https://archive.org/download/tvs-concert-25/06%20tanayuni%20brOva%20-%20bhairavi.mp3',
    name: 'Tanayuni Brova (Telugu - T. V. Sankaranarayanan)'
  },
  {
    key: 'enduku_dayaradura.mp3',
    url: 'https://archive.org/download/tvs-concert-27/04%20enduku%20dayarAdurA%20-%20tODi.mp3',
    name: 'Enduku Dayaradura (Telugu - T. V. Sankaranarayanan)'
  },

  // --- MALAYALAM ---
  {
    key: 'pankajakshanam_namami.mp3',
    url: 'https://archive.org/download/kvn-mc-tn-swathi-thirunal-1980s/05%20Pankajakshanam%20-%20Thodi%20-%20Swathi%20Thirunal.mp3',
    name: 'Pankajakshanam Namami (Malayalam - K. V. Narayanaswamy)'
  },
  {
    key: 'bhavaye_sri_gopalam.mp3',
    url: 'https://archive.org/download/BhavayeSriGopalamRagamalikaSwathiThirunal/BhavayeSriGopalam-ragamalika-swathiThirunal.mp3',
    name: 'Bhavaye Sri Gopalam (Malayalam - K. J. Yesudas)'
  },

  // --- MARATHI ---
  {
    key: 'kona_kashi_kalavi.mp3',
    url: 'https://archive.org/download/20201223_20201223_0230/%E0%A4%95%E0%A5%8B%E0%A4%A3%E0%A4%BE%20%E0%A4%95%E0%A4%B6%E0%A5%80%20%E0%A4%95%E0%A4%B3%E0%A4%BE%E0%A4%B5%E0%A5%80.mp3',
    name: 'Kona Kashi Kalavi (Marathi - Kumar Gandharva)'
  },
  {
    key: 'prem_kele_kay.mp3',
    url: 'https://archive.org/download/20201223_20201223_0230/%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A5%87%E0%A4%AE%20%E0%A4%95%E0%A5%87%E0%A4%B2%E0%A5%87%20%E0%A4%95%E0%A4%BE%E0%A4%AF%20%E0%A4%B9%E0%A4%BE%20%E0%A4%9D%E0%A4%BE%E0%A4%B2%E0%A4%BE%20%E0%A4%97%E0%A5%81%E0%A4%A8%E0%A5%8D%E0%A4%B9%E0%A4%BE.mp3',
    name: 'Prem Kele Kay Ha Jhala Gunha (Marathi - Kumar Gandharva)'
  }
];

export async function downloadWave10() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE10_DOWNLOADS) {
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

if (process.argv[1] && process.argv[1].includes('download_wave10_gems.mjs')) {
  downloadWave10().catch(console.error);
}
