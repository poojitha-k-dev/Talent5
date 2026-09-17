import fs from 'fs';
import path from 'path';

export const WAVE12_FINAL40_DOWNLOADS = [
  // --- KANNADA (6) ---
  {
    key: 'aru_ninagidiradhika.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/Aru%20ninagidiradhika%20dhAruNiyoLage.mp3',
    name: 'Aru Ninagidiradhika Dharaniyolage'
  },
  {
    key: 'enendu_kondadi.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/Enendu%20konDADi%20stutisalo%20dEva%201.mp3',
    name: 'Enendu Kondadi Stutisalo Deva'
  },
  {
    key: 'i_muddu_krishnana_sukhave.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/I%20muddu%20kRShNana%20I%20kShaNada%20sukhavE%20sAku%20edited.mp3',
    name: 'I Muddu Krishnana I Kshanada Sukhave'
  },
  {
    key: 'odi_barayya_vaikuntha_ninna.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/ODi%20bAraiyya%20vaikunTha%20pati%20ninna%202.mp3',
    name: 'Odi Barayya Vaikuntha Pati Ninna'
  },
  {
    key: 'bandalu_node_mandiradolu.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/bandaLu%20nODe%20mandiradoLu%20bhAgyada%20lakShmi.mp3',
    name: 'Bandalu Node Mandiradolu Bhagyada Lakshmi'
  },
  {
    key: 'narasimhana_pada_bhajaneya.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/narasimhana%20pAda%20edited.mp3',
    name: 'Narasimhana Pada Bhajaneya Mado'
  },

  // --- BENGALI (13) ---
  {
    key: 'tomar_dekha_pabo_bole.mp3',
    url: 'https://archive.org/download/RabindraSangeet/01.TumarDekhaPaboBole.mp3',
    name: 'Tomar Dekha Pabo Bole'
  },
  {
    key: 'na_chahile_jare_paoa_jay.mp3',
    url: 'https://archive.org/download/RabindraSangeet/03.NaChahileJare.mp3',
    name: 'Na Chahile Jare Paoa Jay'
  },
  {
    key: 'tomay_gaan_shonabo.mp3',
    url: 'https://archive.org/download/RabindraSangeet/03.TumaiGaanShunabo.mp3',
    name: 'Tomay Gaan Shonabo'
  },
  {
    key: 'bhalobeshe_sakhi_nivrite.mp3',
    url: 'https://archive.org/download/RabindraSangeet/05.BhalobesheSakhi.mp3',
    name: 'Bhalobeshe Sakhi Nivrite'
  },
  {
    key: 'amare_karo_jeebon_daan.mp3',
    url: 'https://archive.org/download/RabindraSangeet/07.AmareKaroJeebonDan.mp3',
    name: 'Amare Karo Jeebon Daan'
  },
  {
    key: 'bandhu_michhe_raag.mp3',
    url: 'https://archive.org/download/RabindraSangeet/07.BandhuMichheRag.mp3',
    name: 'Bandhu Michhe Raag Koro Na'
  },
  {
    key: 'amar_pothe_pothe_pathor.mp3',
    url: 'https://archive.org/download/RabindraSangeet/08.AmarPothePothe.mp3',
    name: 'Amar Pothe Pothe Pathor'
  },
  {
    key: 'ami_keboli_swapon.mp3',
    url: 'https://archive.org/download/RabindraSangeet/08.AmiKeboliSwapon.mp3',
    name: 'Ami Keboli Swapon Korechhi Bopon'
  },
  {
    key: 'je_chhilo_amar_swapone.mp3',
    url: 'https://archive.org/download/RabindraSangeet/09.JeChhiloAmar.mp3',
    name: 'Je Chhilo Amar Swapone Charini'
  },
  {
    key: 'o_ki_elo_re_priyatama.mp3',
    url: 'https://archive.org/download/RabindraSangeet/10.OKiElo.mp3',
    name: 'O Ki Elo O Ki Elo Re Priyatama'
  },
  {
    key: 'dakbona_dakbona_aar_tomare.mp3',
    url: 'https://archive.org/download/RabindraSangeet/11.DakbonaDakbona.mp3',
    name: 'Dakbona Dakbona Aar Tomare'
  },
  {
    key: 'ami_hridoyer_katha_bolite.mp3',
    url: 'https://archive.org/download/RabindraSangeet/13.AmiHridoyerKatha.mp3',
    name: 'Ami Hridoyer Katha Bolite Byakul'
  },
  {
    key: 'khama_karo_more_shakhi.mp3',
    url: 'https://archive.org/download/RabindraSangeet/12.KhamaKaroMoore.mp3',
    name: 'Khama Karo More Shakhi'
  },

  // --- HINDI (10) ---
  {
    key: 'meera_aao_to_sari_mohan.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/Meera%20bhajan%20-%20Aao%20to%20sari%20re%20mohan%20By%20Tarasingh%20dodve%20%28Dr.sahab%29.mp3',
    name: 'Aao To Sahi Mohan Mere'
  },
  {
    key: 'meera_eri_sakhi_prem_diwani.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/Meera%20bhajan%20-%20Eri%20sakhi%20mai%20prem%20diwani%20by%20tarasingh%20dodve%20%28Dr.sahab%29.mp3',
    name: 'Eri Sakhi Main Prem Diwani'
  },
  {
    key: 'meera_maayi_ri_maine_liyo.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/Meera%20bhajan%20-%20Maayi%20ri%20maine%20liyo%20govindo%20mol%20by%20tarasingh%20dodve%20%28Dr.sahab%29.mp3',
    name: 'Maayi Ri Maine Liyo Govindo Mol'
  },
  {
    key: 'meera_kanha_sang_preet_lagi.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/Meera%20bhajan%20-%20kanha%20sang%20prit%20lagi%20by%20tarasingh%20dodve%20%28Dr.sahab%29.mp3',
    name: 'Kanha Sang Preet Lagi'
  },
  {
    key: 'meera_rana_ji_tharo_deshadlo.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/Meera%20bhajn%20-%20raana%20ji%20tharo%20deshadlo%20rang%20roodo%20by%20tarasingh%20dodve.mp3',
    name: 'Rana Ji Tharo Deshadlo Rang Roodo'
  },
  {
    key: 'kabir_duniya_ajab_diwani.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/kabir%20bhajan%20-%20duniya%20ajab%20diwani%20by%20tarasingh%20dodve%20%28Dr.%20sahab%29.mp3',
    name: 'Duniya Ajab Diwani'
  },
  {
    key: 'kabir_kaya_nagari_pardesi.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/kabir%20bhajan%20-%20kaya%20nagri%20me%20pardesi%20piyo%20bole%20by%20tarasingh%20dodve%28Dr.sahab%29.mp3',
    name: 'Kaya Nagari Me Pardesi Bole'
  },
  {
    key: 'kabir_kya_hove_nahaye_dhoye.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/kabir%20bhajan%20-%20kya%20hove%20nahaye%20dhoye%20by%20tarasingh%20dodve%20%28Dr.%20sahab%29.mp3',
    name: 'Kya Hove Re Nahaye Dhoye'
  },
  {
    key: 'kabir_na_jane_tera_saheb.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/Real%20kabir%20bhajan-%20na%20jane%20tera%20saheb%20kaisa%20hai%20by%20tarasingh%20dodve%28Dr.sahab%29.flv.mp3',
    name: 'Na Jane Tera Saheb Kaisa Hai'
  },
  {
    key: 'kabir_musafir_jana_padega.mp3',
    url: 'https://archive.org/download/HindiKabirBhajan-ByTarasinghDodveDr.sahab/kabir%20bhajan%20-%20musafir%20jana%20padega%20by%20tarasingh%20dodve%20%28Dr.%20sahab%29.mp3',
    name: 'Musafir Jana Padega Re Manva'
  },

  // --- GUJARATI (6) ---
  {
    key: 'gujarati_bhajan_29.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2029.mp3',
    name: 'Bhakti Re Karvi Ene Rank Thai Ne Rehvun'
  },
  {
    key: 'gujarati_bhajan_30.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2030.mp3',
    name: 'Krishna Kanha Tari Murli Vagire'
  },
  {
    key: 'gujarati_bhajan_31.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2031%20.mp3',
    name: 'Nath Tamaro Aadhar Che Re'
  },
  {
    key: 'gujarati_bhajan_32.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2032.mp3',
    name: 'Govind Gopal Radhe Shyam Bhajo'
  },
  {
    key: 'gujarati_bhajan_33.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2033.mp3',
    name: 'Jaya Jaya Shree Shrinathji Kripala'
  },
  {
    key: 'gujarati_bhajan_34.mp3',
    url: 'https://archive.org/download/GujaratiBhajan36/Gujarati%20Bhajan%2034.mp3',
    name: 'Rang Ma Rangai Jane Rangila Shreenathji'
  },

  // --- TELUGU (3) ---
  {
    key: 'bhavamu_lona_ms_subbulakshmi.mp3',
    url: 'https://archive.org/download/BhavamuLona/0010_1_BhavamuLona-MS_Sudhdhadhanyasi.mp3',
    name: 'Bhavamu Lona Bagu Matinche'
  },
  {
    key: 'jo_achyutananda_mukunda_annamacharya.mp3',
    url: 'https://archive.org/download/JoAtchutananda/JO%20ACHYUTHANANDA%20JO%20JO%20MUKUNDA%20%28139%29.mp3',
    name: 'Jo Achyutananda Jo Jo Mukunda'
  },
  {
    key: 'neeve_nannu_darbar_tvs.mp3',
    url: 'https://archive.org/download/tvs-concert-24/2%20neevE%20nannu%20-%20darbAr.mp3',
    name: 'Neeve Nannu Brova Beku'
  },

  // --- TAMIL (2) ---
  {
    key: 'maha_ganapathe_hamsadhwani_tvs.mp3',
    url: 'https://archive.org/download/tvs-concert-25/01%20mahAgaNapatE%20-%20hamsadwani.mp3',
    name: 'Maha Ganapathe Hamsadhwani'
  },
  {
    key: 'sri_matrubhutam_kannada_tvs.mp3',
    url: 'https://archive.org/download/tvs-concert-25/05%20sri%20mAtrubhootam%20-%20kannaDA.mp3',
    name: 'Sri Matrubhutam Trishiragiri Natham'
  }
];

export async function downloadWave12Final40() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE12_FINAL40_DOWNLOADS) {
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

if (process.argv[1] && process.argv[1].includes('download_wave12_final40.mjs')) {
  downloadWave12Final40().then(() => console.log('Wave 12 Final 40 downloads complete!')).catch(console.error);
}
