import fs from 'fs';
import path from 'path';

export const WAVE9_DOWNLOADS = [
  // --- KANNADA (Ananda Rao Srirangam) ---
  {
    key: 'kangalidyatako.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/kaNgaLidyAtako.mp3',
    name: 'Kangalidyatako (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'kandu_kandu.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/kanDu%20kanDu%20nIyenna%20kai%20biDuvare.mp3',
    name: 'Kandu Kandu Neeyen (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'kolalanudutta.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/koLalanUdutta%20banda%20namma%20gOpiya%20kanda.mp3',
    name: 'Kolalanudutta Banda (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'baravva_mahabhagyada.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/bAravva%20mahAbhAgyada%20abhimAni.mp3',
    name: 'Baravva Mahabhagyada Abhimani (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'idu_bhagya.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/idu%20bhAgya%20idu%20bhAgya.mp3',
    name: 'Idu Bhagya Idu Bhagya (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'ikko_node.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/ikkO%20nODe%20ranganAthana%20puTTa%20pAdava.mp3',
    name: 'Ikko Node Ranganathana (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'lali_lali_hariye.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/lAli%20lAli%20namma%20hariye%20lAli.mp3',
    name: 'Lali Lali Namma Hariye (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'muraliya_bariso.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/muraliya%20bAriso%20mAdhavA.mp3',
    name: 'Muraliya Bariso Madhava (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'ranganathana_noduva.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/ranganAthana%20nODuva%20banni.mp3',
    name: 'Ranganathana Noduva Banni (Kannada - Ananda Rao Srirangam)'
  },
  {
    key: 'yashode_ninna_kandage.mp3',
    url: 'https://archive.org/download/dasa_sahitya_shri_ananda_rao_srirangam/yashOde%20ninna%20kandage%20Esu%20rUpave.mp3',
    name: 'Yashode Ninna Kandage (Kannada - Ananda Rao Srirangam)'
  },

  // --- TAMIL ---
  {
    key: 'thillana_poorvi.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2002/09%20Thillana%20in%20Poorvi%20-%20Thirugokaranam%20Vaidhyanatha%20Bhagavatar.mp3',
    name: 'Thillana in Poorvi (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_surutti.mp3',
    url: 'https://archive.org/download/sulochana-pattabhiraman-thillana-charithram-vol-1-2/Sulochana%20Pattabhiraman%20Group/Thillana%20Charithram%20Vol%2001/11%20Thillana%20in%20Surutti%20-%20Ooththukkadu%20Venkatsubba%20Iyer.mp3',
    name: 'Thillana in Surutti (Tamil - Sulochana Pattabhiraman)'
  },
  {
    key: 'thillana_kuntalavarali.mp3',
    url: 'https://archive.org/download/kvn-226/KVN-P-12.mp3',
    name: 'Thillana in Kuntalavarali (Tamil - K. V. Narayanaswamy)'
  },
  {
    key: 'abhaya_varade.mp3',
    url: 'https://archive.org/download/tvs-concert-24/5%20abhaya%20varade%20SAradE%20-%20hindOLam.mp3',
    name: 'Abhaya Varade Sharade (Tamil / Sanskrit - T. V. Sankaranarayanan)'
  },

  // --- TELUGU ---
  {
    key: 'sogasujuda_tarama.mp3',
    url: 'https://archive.org/download/tvs-concert-25/02%20sogasujooda%20taramA%20-%20kannaDagowLa.mp3',
    name: 'Sogasujuda Tarama (Telugu - T. V. Sankaranarayanan)'
  },
  {
    key: 'neeve_nannu.mp3',
    url: 'https://archive.org/download/tvs-concert-24/2%20neevE%20nannu%20-%20darbAr.mp3',
    name: 'Neeve Nannu Brovavale (Telugu - T. V. Sankaranarayanan)'
  },
  {
    key: 'geetha_vadhya.mp3',
    url: 'https://archive.org/download/tvs-concert-26/05%20geeta%20vAdya%20-%20nATakapriyA.mp3',
    name: 'Geetha Vadhya (Telugu - T. V. Sankaranarayanan)'
  },

  // --- MALAYALAM ---
  {
    key: 'rajeevaksha_baro.mp3',
    url: 'https://archive.org/download/kvn-mc-tn-swathi-thirunal-1980s/04%20Rajeevaksha%20Baro%20-%20Sankarabaranam%20-%20Swathi%20Thirunal.mp3',
    name: 'Rajeevaksha Baro (Malayalam / Sanskrit - K. V. Narayanaswamy)'
  },
  {
    key: 'saramaina_marulu.mp3',
    url: 'https://archive.org/download/kvn-mc-tn-swathi-thirunal-1980s/07%20Saramaina%20-%20Behag%20-%20Swathi%20Thirunal.mp3',
    name: 'Saramaina Marulu (Malayalam - K. V. Narayanaswamy)'
  },
  {
    key: 'somasayaka.mp3',
    url: 'https://archive.org/download/kvn-mc-tn-swathi-thirunal-1980s/02%20Sooma%20Sayaka%20-%20Kapi%20-%20Swathi%20Thirunal.mp3',
    name: 'Somasayaka (Malayalam - K. V. Narayanaswamy)'
  },

  // --- PUNJABI ---
  {
    key: 'asan_prem_umahra.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Asan%20prem%20umahra%20%28Baarah%20Maah%20_8%29.mp3',
    name: 'Asan Prem Umahra (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'asarh_tapanda.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Asarh%20tapanda%20tis%20lagai%20%28Baarah%20Maah%20_5%29.mp3',
    name: 'Asarh Tapanda Tis Lagai (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'har_jeth_jurhanda.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Har%20jeth%20jurhanda%20loriyai%20%28Baarah%20Maah%20_4%29.mp3',
    name: 'Har Jeth Jurhanda Loriyai (Punjabi - Bhai Harjinder Singh Ji)'
  },
  {
    key: 'bhaduye_bhram.mp3',
    url: 'https://archive.org/download/kirat-karam-ke-veechhde-baarah-maah-1/Bhaduye%20bhram%20bhulaniya%20%28Baarah%20Maah%20_7%29.mp3',
    name: 'Bhaduye Bhram Bhulaniya (Punjabi - Bhai Harjinder Singh Ji)'
  },

  // --- GUJARATI ---
  {
    key: 'shree_ram_jai_ram.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2019.mp3',
    name: 'Shree Ram Jai Ram (Gujarati - Traditional)'
  },
  {
    key: 'mara_ghat_ma.mp3',
    url: 'https://archive.org/download/GujaratiBhajan18/Gujarati%20Bhajan%2020.mp3',
    name: 'Mara Ghat Ma Birajta Shreenathji (Gujarati - Traditional)'
  },

  // --- BENGALI ---
  {
    key: 'je_dhrubho.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Je%20Dhrubho%20Gautam%20Mitra.mp3',
    name: 'Je Dhrubho (Bengali - Gautam Mitra)'
  },
  {
    key: 'mono_jago.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Mono%20Jago%20Promit%20Sen.mp3',
    name: 'Mono Jago Mangalaloke (Bengali - Promit Sen)'
  },
  {
    key: 'nuton_pran.mp3',
    url: 'https://archive.org/download/rabindra-sangeet/Nuton%20Pran%20Anusaruti%20Mitra.mp3',
    name: 'Nuton Pran Dao He (Bengali - Anusaruti Mitra)'
  }
];

export async function downloadWave9() {
  const dir = path.resolve('apps/web/public/media');
  for (const item of WAVE9_DOWNLOADS) {
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

if (process.argv[1] && process.argv[1].includes('download_wave9_gems.mjs')) {
  downloadWave9().catch(console.error);
}
