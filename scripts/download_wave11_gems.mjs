import fs from 'fs';
import path from 'path';

export const WAVE11_DOWNLOADS = [
  // --- KANNADA (10 Songs - Ananda Rao Srirangam) ---
  {
    key: 'bare_nammani.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/bArE%20nammani%20tanaka.mp3',
    name: 'Bare Nammani Tanaka (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'lalisidalu_magana.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/lAlisidaLu%20magana%20yashOde.mp3',
    name: 'Lalisidalu Magana Yashode (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'madhuravu_madhurasa.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/madhuravu%20madhurA%20nAthana%20nAmavu.mp3',
    name: 'Madhuravu Madhuranathana (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'huva_taruvara.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/hUva%20taruvara%20manege%20hulla%20taruva%202.mp3',
    name: 'Huva Taruvara Manege (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'muttaidagirabeku.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/muttaidAgirabEku%20mudadindali.mp3',
    name: 'Muttaidagirabeku Mudadindali (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'nama_kirtane.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/nAma%20kIrtane%20anudina.mp3',
    name: 'Nama Kirtane Anudina (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'vrindavana_devi.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/vRndAvana%20dEvi%20namO%20namO.mp3',
    name: 'Vrindavana Devi Namo Namo (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'yarige_yaruntu.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/yArige%20yarunTu%20eravina%20samsAra.mp3',
    name: 'Yarige Yaruntu Eravina Samsara (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'brahmadigalu_ksheera.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/brahmAdigalu%20kshIra%20sAgarakke.mp3',
    name: 'Brahmadigalu Ksheera Sagarakke (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'buddhi_matu_helidare.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/buddhi%20mAtu%20hElidare.mp3',
    name: 'Buddhi Matu Helidare (Kannada - Ananda Rao Srirangam)'
  },

  // --- PUNJABI (4 Songs - Bhai Harjinder Singh Ji) ---
  {
    key: 'phalgun_anand.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Phalgun%20anand%20upaarjana%20%28Baarah%20Maah%20_13%29.mp3',
    name: 'Phalgun Anand Upaarjana (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'pokh_tukhar.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Pokh%20tukhar%20na%20vyapayi%20%28Baarah%20Maah%20_11%29.mp3',
    name: 'Pokh Tukhar Na Vyapayi (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'sawan_sarsi.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Sawan%20sarsi%20kamni%20%28Baarah%20Maah%20_6%29.mp3',
    name: 'Sawan Sarsi Kamni (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'vaisakh_dheeran.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Vaisakh%20dheeran%20kyo%20wadhiya%20%28Baarah%20Maah%20_3%29.mp3',
    name: 'Vaisakh Dheeran Kyo Wadhiya (Punjabi - Bhai Harjinder Singh Ji)'
  },

  // --- GUJARATI (7 Songs - Traditional Bhajans) ---
  {
    key: 'gujarati_bhajan_16.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2016.mp3',
    name: 'Hari Bhajata Sahu Dukh Jaye (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_17.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2017.mp3',
    name: 'He Karuna Na Karnara (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_18.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2018.mp3',
    name: 'Prabhu Taro Prem Apaar (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_25.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2025.mp3',
    name: 'Shiv Shankar Shambhu Bhajo (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_26.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2026.mp3',
    name: 'Mane Maya Lagadi Re (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_27.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2027.mp3',
    name: 'Shree Nathji Ni Maya (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_28.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2028.mp3',
    name: 'Ganga Re Jamuna Na Neer (Gujarati - Traditional)'
  },

  // --- BENGALI (6 Songs - Classic Rabindra Sangeet) ---
  {
    key: 'aar_nai_re_bela.mp3',
    url: 'https://archive.org/download/ClassicSongVolume1/Aar%20Nai%20Re%20Bela.mp3',
    name: 'Aar Nai Re Bela (Bengali - Rabindranath Tagore)'
  },
  {
    key: 'abak_prithibi.mp3',
    url: 'https://archive.org/download/ClassicSongVolume1/Abak%20Prithibi.mp3',
    name: 'Abak Prithibi (Bengali - Sukanta Bhattacharya / Salil Chowdhury)'
  },
  {
    key: 'aj_rate_ghumiye.mp3',
    url: 'https://archive.org/download/ClassicSongVolume1/Aj%20Rate%20Ghumiye%20Porona.mp3',
    name: 'Aj Rate Ghumiye Porona (Bengali - Hemanta Mukhopadhyay)'
  },
  {
    key: 'sakhi_bohe_gelo.mp3',
    url: 'https://archive.org/download/RabindraSangeet/02.SakhiBoheGelo.mp3',
    name: 'Sakhi Bohe Gelo Bela (Bengali - Rabindranath Tagore)'
  },
  {
    key: 'ami_tumar_preme.mp3',
    url: 'https://archive.org/download/RabindraSangeet/03.AmiTumarPreme.mp3',
    name: 'Ami Tumar Preme Hobo Bhikari (Bengali - Rabindranath Tagore)'
  },
  {
    key: 'sukhe_amar_rakhbe.mp3',
    url: 'https://archive.org/download/RabindraSangeet/03.SukheAmarRakhbe.mp3',
    name: 'Sukhe Amar Rakhbe Keno (Bengali - Rabindranath Tagore)'
  },

  // --- TAMIL (3 Songs) ---
  {
    key: 'bhuvaneshwariya_nene.mp3',
    url: 'https://archive.org/download/tvs-concert-24/3%20bhuvanEshvariya%20-%20mOhankalyANi.mp3',
    name: 'Bhuvaneshwariya Nene Manave (Tamil / Kannada - T. V. Sankaranarayanan)'
  },
  {
    key: 'thillana_senchurutti_ooththukkadu.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2002/10%20Thilllana%20in%20Senchurutti%20-%20Ooththukkadu%20Venkatasubba%20Iyer.mp3',
    name: 'Thillana in Senchurutti Ooththukkadu (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'inda_paramukam_poorvikalyani.mp3',
    url: 'https://archive.org/download/tvs-concert-25/04%20inda%20parAmukam%20-%20poorvikalyANi.mp3',
    name: 'Inda Paramukam (Tamil - T. V. Sankaranarayanan)'
  },

  // --- TELUGU (3 Songs) ---
  {
    key: 'jaya_jaya_swamin_tvs.mp3',
    url: 'https://archive.org/download/tvs-concert-26/01%20jaya%20jaya%20swAmin%20-%20nATa.mp3',
    name: 'Jaya Jaya Swamin Nata (Telugu / Sanskrit - T. V. Sankaranarayanan)'
  },
  {
    key: 'ra_ra_ma_intidaga_tvs.mp3',
    url: 'https://archive.org/download/tvs-concert-26/02%20rA%20rA%20mA%20inTidAga%20-%20asAvEri.mp3',
    name: 'Ra Ra Ma Intidaga Asaveri (Telugu - T. V. Sankaranarayanan)'
  },
  {
    key: 'sukhi_evvaro_tvs.mp3',
    url: 'https://archive.org/download/tvs-concert-26/06%20sukhi%20evvarO%20-%20kAnaDA.mp3',
    name: 'Sukhi Evvaro Kanada (Telugu - T. V. Sankaranarayanan)'
  },

  // --- MALAYALAM (1 Song) ---
  {
    key: 'smara_janaka_tvs.mp3',
    url: 'https://archive.org/download/tvs-concert-26/07%20smarajanaka%20-%20behAg.mp3',
    name: 'Smara Janaka Behag (Malayalam / Sanskrit - T. V. Sankaranarayanan)'
  },

  // --- HINDI (1 Song) ---
  {
    key: 'nirgun_bhajan_kumar.mp3',
    url: 'https://archive.org/download/RaagLaganGandharNirgunBhajan/02%20-%20%20Kumar%20Gandharva%20-%20Nirgun%20Bhajan.mp3',
    name: 'Nirgun Bhajan (Hindi - Kumar Gandharva)'
  }
];

export async function downloadWave11() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE11_DOWNLOADS) {
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

if (process.argv[1] && process.argv[1].includes('download_wave11_gems.mjs')) {
  downloadWave11().catch(console.error);
}
