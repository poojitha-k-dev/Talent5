import fs from 'fs';
import path from 'path';

export const WAVE12_DOWNLOADS = [
  // --- KANNADA (10 Songs - Ananda Rao Srirangam / Dasa Sahitya) ---
  {
    key: 'adidano_ranga_adbhutadindali.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/ADidanO%20rangA%20adbhutatindali%20-%20srI%20purandara%20dAsaru.mp3',
    name: 'Adidano Ranga Adbhutadindali (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'acharavillada_nalige_purandara.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/AcAravillada%20nAlige.mp3',
    name: 'Acharavillada Nalige (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'aru_ninagidiradhika_dharaniyolage.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/Aru%20ninagidiradhika%20dhAruNiyoLage.mp3',
    name: 'Aru Ninagidiradhika Dharaniyolage (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'ava_rogavo_enage_deva_dhanvantri.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/Ava%20rOgavo%20enagE%20dEva%20danvantri%20-%20republish.mp3',
    name: 'Ava Rogavo Enage Deva Dhanvantri (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'enu_dhanyalo_lakumi_purandara.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/Enu%20dhanyalO%20lakumi%20edited.mp3',
    name: 'Enu Dhanyalo Lakumi (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'i_muddu_krishnana_purandara.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/I%20muddu%20kRShNana%20I%20kShaNada%20sukhavE%20sAku%20edited.mp3',
    name: 'I Muddu Krishnana (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'odi_barayya_vaikuntha_pati.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/ODi%20bAraiyya%20vaikunTha%20pati%20ninna%202.mp3',
    name: 'Odi Barayya Vaikuntha Pati (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'alli_nodalu_rama_purandara.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/alli%20nOdalu%20rAmA.mp3',
    name: 'Alli Nodalu Rama (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'anjikinyatakayya_sajjanarigidu.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/anjikinyAtakayyA%20purandara%20dAsaru.mp3',
    name: 'Anjikinyatakayya Sajjanarigidu (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'bagilanu_teredu_kanaka_dasa.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/bAgilanu%20teredu%20sEvayanu%20koDo.mp3',
    name: 'Bagilanu Teredu Sevayanu Kodo (Kannada - Ananda Rao Srirangam)'
  },

  // --- BENGALI (6 Songs - Rabindra Sangeet) ---
  {
    key: 'tomar_dekha_pabo_bole.mp3',
    url: 'https://archive.org/download/RabindraSangeet/01.TumarDekhaPaboBole.mp3',
    name: 'Tomar Dekha Pabo Bole (Bengali - Rabindra Sangeet)'
  },
  {
    key: 'na_chahile_jare_paoa_jay.mp3',
    url: 'https://archive.org/download/RabindraSangeet/03.NaChahileJare.mp3',
    name: 'Na Chahile Jare Paoa Jay (Bengali - Rabindra Sangeet)'
  },
  {
    key: 'tomay_gaan_shonabo.mp3',
    url: 'https://archive.org/download/RabindraSangeet/03.TumaiGaanShunabo.mp3',
    name: 'Tomay Gaan Shonabo (Bengali - Rabindra Sangeet)'
  },
  {
    key: 'bhalobeshe_sakhi_nivrite.mp3',
    url: 'https://archive.org/download/RabindraSangeet/05.BhalobesheSakhi.mp3',
    name: 'Bhalobeshe Sakhi Nivrite (Bengali - Rabindra Sangeet)'
  },
  {
    key: 'amare_karo_jeebon_daan.mp3',
    url: 'https://archive.org/download/RabindraSangeet/07.AmareKaroJeebonDan.mp3',
    name: 'Amare Karo Jeebon Daan (Bengali - Rabindra Sangeet)'
  },
  {
    key: 'amar_pothe_pothe_pathor.mp3',
    url: 'https://archive.org/download/RabindraSangeet/08.AmarPothePothe.mp3',
    name: 'Amar Pothe Pothe Pathor (Bengali - Rabindra Sangeet)'
  },

  // --- PUNJABI (5 Songs - Bhai Harjinder Singh Ji Sri Nagar Wale) ---
  {
    key: 'asan_prem_umahra.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Asan%20prem%20umahra%20%28Baarah%20Maah%20_8%29.mp3',
    name: 'Asan Prem Umahra (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'asarh_tapanda_tis_lagai.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Asarh%20tapanda%20tis%20lagai%20%28Baarah%20Maah%20_5%29.mp3',
    name: 'Asarh Tapanda Tis Lagai (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'bhaduye_bhram_bhulaniya.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Bhaduye%20bhram%20bhulaniya%20%28Baarah%20Maah%20_7%29.mp3',
    name: 'Bhaduye Bhram Bhulaniya (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'har_jeth_jurhanda_loriyai.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Har%20jeth%20jurhanda%20loriyai%20%28Baarah%20Maah%20_4%29.mp3',
    name: 'Har Jeth Jurhanda Loriyai (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'maagh_majan_sangh_sadhuaa.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Maagh%20majan%20sangh%20sadhuaa%20%28Baarah%20Maah%20_12%29.mp3',
    name: 'Maagh Majan Sangh Sadhuaa (Punjabi - Bhai Harjinder Singh Ji)'
  },

  // --- GUJARATI (6 Songs - Traditional Bhajans) ---
  {
    key: 'gujarati_bhajan_28.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2028.mp3',
    name: 'Mane Pyaru Lage Shreeji Taru Naam (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_29.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2029.mp3',
    name: 'Bhakti Re Karvi Ene Rank Thai Ne (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_30.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2030.mp3',
    name: 'Krishna Kanha Tari Murli Vagire (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_31.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2031%20.mp3',
    name: 'Nath Tamaro Aadhar Che Re (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_32.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2032.mp3',
    name: 'Govind Gopal Radhe Shyam Bhajo (Gujarati - Traditional)'
  },
  {
    key: 'gujarati_bhajan_33.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2033.mp3',
    name: 'Jaya Jaya Shree Shrinathji Kripala (Gujarati - Traditional)'
  },

  // --- HINDI (4 Songs - Classical Meera & Kabir Bhajans) ---
  {
    key: 'meera_aao_to_sari_mohan.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/Meera%20bhajan%20-%20Aao%20to%20sari%20re%20mohan%20By%20Tarasingh%20dodve%20%28Dr.sahab%29.mp3',
    name: 'Aao To Sahi Mohan Mere (Hindi - Meera Bhajan)'
  },
  {
    key: 'meera_eri_sakhi_prem_diwani.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/Meera%20bhajan%20-%20Eri%20sakhi%20mai%20prem%20diwani%20by%20tarasingh%20dodve%20%28Dr.sahab%29.mp3',
    name: 'Eri Sakhi Main Prem Diwani (Hindi - Meera Bhajan)'
  },
  {
    key: 'meera_maayi_ri_maine_liyo.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/Meera%20bhajan%20-%20Maayi%20ri%20maine%20liyo%20govindo%20mol%20by%20tarasingh%20dodve%20%28Dr.sahab%29.mp3',
    name: 'Maayi Ri Maine Liyo Govindo Mol (Hindi - Meera Bhajan)'
  },
  {
    key: 'sakhiya_wah_ghar_sabse_niyara.mp3',
    url: 'https://archive.org/download/kumar-gandharva-sakhiya-wha-ghar-sabse-niyara/kumar%20gandharva%20-%20_sakhiya%20wha%20ghar%20sabse%20niyara_.mp3',
    name: 'Sakhiya Wah Ghar Sabse Niyara (Hindi - Kumar Gandharva / Kabir)'
  },

  // --- TELUGU (3 Songs - Annamacharya & Thyagaraja Kritis) ---
  {
    key: 'bhavamu_lona_ms_subbulakshmi.mp3',
    url: 'https://archive.org/download/BhavamuLona/0010_1_BhavamuLona-MS_Sudhdhadhanyasi.mp3',
    name: 'Bhavamu Lona (Telugu - M. S. Subbulakshmi / Annamacharya)'
  },
  {
    key: 'jo_achyutananda_mukunda_annamacharya.mp3',
    url: 'https://archive.org/download/JoAtchutananda/JO%20ACHYUTHANANDA%20JO%20JO%20MUKUNDA%20%28139%29.mp3',
    name: 'Jo Achyutananda (Telugu - Annamacharya)'
  },
  {
    key: 'sogasujuda_tarama_tvs.mp3',
    url: 'https://archive.org/download/tvs-concert-25/02%20sogasujooda%20taramA%20-%20kannaDagowLa.mp3',
    name: 'Sogasujuda Tarama (Telugu - T. V. Sankaranarayanan / Thyagaraja)'
  },

  // --- TAMIL (3 Songs - Classical Thillanas & Kritis) ---
  {
    key: 'thillana_madhuvanthi_lalgudi.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/01%20Thillana%20in%20Madhuvanthi%20-%20Lalgudi%20G%20Jayaraman.mp3',
    name: 'Thillana in Madhuvanthi (Tamil - Sulochana Pattabhiraman / Lalgudi Jayaraman)'
  },
  {
    key: 'thillana_behag_papanasam_sivan.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/03%20Thillana%20in%20Behag%20-%20Papanasam%20Sivan.mp3',
    name: 'Thillana in Behag (Tamil - Sulochana Pattabhiraman / Papanasam Sivan)'
  },
  {
    key: 'maha_ganapathe_hamsadhwani_tvs.mp3',
    url: 'https://archive.org/download/tvs-concert-25/01%20mahAgaNapatE%20-%20hamsadwani.mp3',
    name: 'Maha Ganapathe Hamsadhwani (Tamil / Sanskrit - T. V. Sankaranarayanan / Dikshitar)'
  },

  // --- MALAYALAM (2 Songs - Swathi Thirunal & Irayimman Thampi) ---
  {
    key: 'omanathinkal_kidavo_malayalam.mp3',
    url: 'https://archive.org/download/OoamanathinkalKidaavo/OmanatthinkaLkkidAvO.mp3',
    name: 'Omanathinkal Kidavo (Malayalam - Classical Lullaby)'
  },
  {
    key: 'thillana_dhanasri_swathi_thirunal.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/10%20Thillana%20in%20Dhanasri%20-%20Swathi%20Thirunal.mp3',
    name: 'Thillana in Dhanasri (Malayalam / Sanskrit - Swathi Thirunal)'
  },

  // --- MARATHI (1 Song - Sant Tukaram Abhang) ---
  {
    key: 'deep_ghevoniya_dhunditi_aandhar.mp3',
    url: 'https://archive.org/download/deep-ghevoniya-dhunditi-aandhar-by-sant-tukaram-s-phadke/deep%20ghevoniya%20dhunditi%20aandhar%20-%20by%20sant%20tukaram%20-%20s%20phadke.mp3',
    name: 'Deep Ghevoniya Dhunditi Aandhar (Marathi - Sant Tukaram / Sudhir Phadke)'
  }
];

export async function downloadWave12() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE12_DOWNLOADS) {
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

if (process.argv[1] && process.argv[1].includes('download_wave12_gems.mjs')) {
  downloadWave12().then(() => console.log('Wave 12 downloads complete!')).catch(console.error);
}
