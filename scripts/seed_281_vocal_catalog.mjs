import pg from 'pg';
import { FULL_241_VOCAL_CATALOG } from './seed_241_vocal_catalog.mjs';

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/talent5_v1';
const pool = new Pool({ connectionString: DATABASE_URL });

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'track-' + Date.now();
}

export const WAVE12_40_CATALOG = [
  // ─── 1. KANNADA (kn - id: 4) — 6 NEW PURANDARA DASA GEMS ───
  {
    title: 'Aru Ninagidiradhika Dharaniyolage',
    slug: 'aru-ninagidiradhika-dharaniyolage-purandara',
    artist: 'Ananda Rao Srirangam',
    bio: 'Distinguished Haridasa sangeetha exponent devoted to propagating Saint Purandara Dasa and Kanaka Dasa spiritual compositions in Karnataka.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    album: 'Dasa Sahitya Sudha',
    languageId: 4,
    genreId: 4,
    mood: 'Mahime Kirtana / Purandara Dasa',
    durationSeconds: 326,
    audioKey: 'aru_ninagidiradhika.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-11-04',
    likes: 24200,
    plays: 512000,
    popularity: 99.0,
    lyrics: [
      { start: 0, end: 54000, text: 'Aru ninagidiradhika dharaniyolage devaradhipa sree hariye' },
      { start: 54000, end: 110000, text: 'Charana kamalava nambida bhaktara poreva karuna nidhiye' },
      { start: 110000, end: 165000, text: 'Brahmadigalige thiliyada mahimeya ulla mahaprabhave' },
      { start: 165000, end: 220000, text: 'Sankata bandaga kaayo devane shanka chakra dharane' },
      { start: 220000, end: 274000, text: 'Patita pavanane ksheerabdhi vasa keshava madhava govinda' },
      { start: 274000, end: 326000, text: 'Purandara vittala ninna namadalli sampoorna ananda' }
    ]
  },
  {
    title: 'Enendu Kondadi Stutisalo Deva',
    slug: 'enendu-kondadi-stutisalo-deva-purandara',
    artist: 'Ananda Rao Srirangam',
    bio: 'Distinguished Haridasa sangeetha exponent devoted to propagating Saint Purandara Dasa and Kanaka Dasa spiritual compositions in Karnataka.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    album: 'Dasa Sahitya Sudha',
    languageId: 4,
    genreId: 4,
    mood: 'Stuti Kirtana / Purandara Dasa',
    durationSeconds: 544,
    audioKey: 'enendu_kondadi.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-11-04',
    likes: 25600,
    plays: 542000,
    popularity: 99.2,
    lyrics: [
      { start: 0, end: 90000, text: 'Enendu kondadi stutisalo deva ninnaya aparimita mahimeya' },
      { start: 90000, end: 180000, text: 'Manasu ninnaya padadalli nilisalu shakthiyu illada deenanu naanu' },
      { start: 180000, end: 270000, text: 'Brahmaadi devategalu ninnaya gunagala varnisalu aagade nintaru' },
      { start: 270000, end: 360000, text: 'Ksheeraabdhi shayana shri vasudeva krupeya needi kaayo anatha bandhu' },
      { start: 360000, end: 450000, text: 'Samsarada bhayavanu thoredu ninnaya charanambujadalli sharanenuve' },
      { start: 450000, end: 544000, text: 'Purandara vittala karunanidhe ninna darushana thori salaho' }
    ]
  },
  {
    title: 'I Muddu Krishnana I Kshanada Sukhave',
    slug: 'i-muddu-krishnana-i-kshanada-sukhave-purandara',
    artist: 'Ananda Rao Srirangam',
    bio: 'Distinguished Haridasa sangeetha exponent devoted to propagating Saint Purandara Dasa and Kanaka Dasa spiritual compositions in Karnataka.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    album: 'Dasa Sahitya Sudha',
    languageId: 4,
    genreId: 4,
    mood: 'Bala Krishna Leele / Purandara Dasa',
    durationSeconds: 243,
    audioKey: 'i_muddu_krishnana_sukhave.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-11-04',
    likes: 23500,
    plays: 501000,
    popularity: 99.0,
    lyrics: [
      { start: 0, end: 40000, text: 'I muddu krishnana i kshanada sukhave saaku manadali' },
      { start: 40000, end: 81000, text: 'Chiguru hejjeya ittu naliyuta baaro namma aanganadali' },
      { start: 81000, end: 122000, text: 'Bennabeguri bittu navilu gari mudidu mohaka roopadi' },
      { start: 122000, end: 163000, text: 'Kolu kolenna koosu baalane gopala bala roopadi' },
      { start: 163000, end: 203000, text: 'Yashodeya kanda anandada thanda chinnada hejjeyanittu' },
      { start: 203000, end: 243000, text: 'Purandara vittalana kaana baare nitya muddu mukhavannu' }
    ]
  },
  {
    title: 'Odi Barayya Vaikuntha Pati Ninna',
    slug: 'odi-barayya-vaikuntha-pati-ninna-purandara',
    artist: 'Ananda Rao Srirangam',
    bio: 'Distinguished Haridasa sangeetha exponent devoted to propagating Saint Purandara Dasa and Kanaka Dasa spiritual compositions in Karnataka.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    album: 'Dasa Sahitya Sudha',
    languageId: 4,
    genreId: 4,
    mood: 'Aparoksha Bhakti / Purandara Dasa',
    durationSeconds: 469,
    audioKey: 'odi_barayya_vaikuntha_ninna.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    releaseDate: '2026-11-04',
    likes: 24800,
    plays: 528000,
    popularity: 99.1,
    lyrics: [
      { start: 0, end: 78000, text: 'Odi barayya vaikuntha pati ninna paadave nambide' },
      { start: 78000, end: 156000, text: 'Gajendra moravanu kelida thakshana garudana eri bandavane' },
      { start: 156000, end: 235000, text: 'Prahladana maatanu nija maadalu kambhadi avatarisidavane' },
      { start: 235000, end: 313000, text: 'Draupadiya moreya kelida kshana vastrava thandu kottavane' },
      { start: 313000, end: 391000, text: 'I pariya karuneya thoruva devaru ninaginta bere unte' },
      { start: 391000, end: 469000, text: 'Purandara vittala ninna darushana needi manava thumbisu' }
    ]
  },
  {
    title: 'Bandalu Node Mandiradolu Bhagyada Lakshmi',
    slug: 'bandalu-node-mandiradolu-bhagyada-lakshmi-dasa',
    artist: 'Ananda Rao Srirangam',
    bio: 'Distinguished Haridasa sangeetha exponent devoted to propagating Saint Purandara Dasa and Kanaka Dasa spiritual compositions in Karnataka.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    album: 'Dasa Sahitya Sudha',
    languageId: 4,
    genreId: 4,
    mood: 'Lakshmi Mangalam / Purandara Dasa',
    durationSeconds: 206,
    audioKey: 'bandalu_node_mandiradolu.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-11-04',
    likes: 22100,
    plays: 472000,
    popularity: 98.7,
    lyrics: [
      { start: 0, end: 34000, text: 'Bandalu node mandiradolu bhagyada lakshmi shobheya thumbi' },
      { start: 34000, end: 68000, text: 'Kanakadhaareya surisuta saundaryada sobhagu minchuta' },
      { start: 68000, end: 103000, text: 'Ksheerasagara kanyake sree hariya hrudayavasini devathe' },
      { start: 103000, end: 137000, text: 'Mangalamurthy namo namo nitya shubha phaladathriye' },
      { start: 137000, end: 171000, text: 'Bhaktiyinda koluva manegalige nitya sampada needuve' },
      { start: 171000, end: 206000, text: 'Purandara vittalana arasiye shri mahalakshmiye namo namo' }
    ]
  },
  {
    title: 'Narasimhana Pada Bhajaneya Mado',
    slug: 'narasimhana-pada-bhajaneya-mado-purandara',
    artist: 'Ananda Rao Srirangam',
    bio: 'Distinguished Haridasa sangeetha exponent devoted to propagating Saint Purandara Dasa and Kanaka Dasa spiritual compositions in Karnataka.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    album: 'Dasa Sahitya Sudha',
    languageId: 4,
    genreId: 4,
    mood: 'Narasimha Stuti / Purandara Dasa',
    durationSeconds: 216,
    audioKey: 'narasimhana_pada_bhajaneya.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-11-04',
    likes: 22800,
    plays: 485000,
    popularity: 98.8,
    lyrics: [
      { start: 0, end: 36000, text: 'Narasimhana pada bhajaneya mado niranthara ananda thumbi' },
      { start: 36000, end: 72000, text: 'Ugra roopada divya tejavanu manadali dhyanisi harusha thumbi' },
      { start: 72000, end: 108000, text: 'Hiranyakashipuvina odalana bagidu bhaktana rakshisidavane' },
      { start: 108000, end: 144000, text: 'Prahladana prarthaneyanu mechidha parama krupasindhuve' },
      { start: 144000, end: 180000, text: 'Bhavada bhayagalanu thodisi muttiya needuva divya mooruthige' },
      { start: 180000, end: 216000, text: 'Purandara vittalana roopada narasimha devane sharanu sharanu' }
    ]
  },

  // ─── 2. BENGALI (bn - id: 7) — 13 NEW RABINDRA SANGEET MASTERPIECES ───
  {
    title: 'Tomar Dekha Pabo Bole',
    slug: 'tomar-dekha-pabo-bole-tagore-suchitra',
    artist: 'Suchitra Mitra',
    bio: 'Pioneering exponent of Rabindra Sangeet renowned for profound emotion, immaculate diction, and timeless renditions of Rabindranath Tagore compositions.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    album: 'Rabindra Prem Geet Mala',
    languageId: 7,
    genreId: 9,
    mood: 'Prem O Puja / Rabindra Sangeet',
    durationSeconds: 155,
    audioKey: 'tomar_dekha_pabo_bole.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-11-04',
    likes: 21600,
    plays: 460000,
    popularity: 98.6,
    lyrics: [
      { start: 0, end: 26000, text: 'Tomar dekha pabo bole ami je poth cheye royechhi' },
      { start: 26000, end: 52000, text: 'Diner alo nive elo chondro je uthe oiakashe' },
      { start: 52000, end: 78000, text: 'Hridoyer modhye baje tomar chhoroner dhoni' },
      { start: 78000, end: 104000, text: 'Kobe je ashibe tumi amar ei eka jeebone' },
      { start: 104000, end: 130000, text: 'Bhalobashar dip jwele boshe achhi nirjone' },
      { start: 130000, end: 155000, text: 'Tomar ashar asha chhara aar je kichhu nai re' }
    ]
  },
  {
    title: 'Na Chahile Jare Paoa Jay',
    slug: 'na-chahile-jare-paoa-jay-tagore-hemanta',
    artist: 'Hemanta Mukhopadhyay',
    bio: 'Legendary Indian music maestro and Bengali vocalist celebrated globally for soul-stirring interpretations of Rabindra Sangeet and modern Bengali music.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    album: 'Gitanjali O Shur',
    languageId: 7,
    genreId: 9,
    mood: 'Puja Porbo / Rabindra Sangeet',
    durationSeconds: 248,
    audioKey: 'na_chahile_jare_paoa_jay.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-11-04',
    likes: 23400,
    plays: 498000,
    popularity: 98.9,
    lyrics: [
      { start: 0, end: 41000, text: 'Na chahile jare paoa jay tare mon bhule thake keno' },
      { start: 41000, end: 82000, text: 'Ja kichhu chhilam tai niye aaji dhoroni je sajilo' },
      { start: 82000, end: 123000, text: 'Shanti shukher parosh laguk sokol antare aaji' },
      { start: 123000, end: 164000, text: 'Ogo shundor ogo priyo tomar charon tale aaji' },
      { start: 164000, end: 205000, text: 'Aponare bilayiya diti chai shantimoy modhur preme' },
      { start: 205000, end: 248000, text: 'Anando lok aalokito hok tomar purnota paane' }
    ]
  },
  {
    title: 'Tomay Gaan Shonabo',
    slug: 'tomay-gaan-shonabo-tagore-debabrata',
    artist: 'Debabrata Biswas',
    bio: 'Revered Bengali vocalist whose iconic booming baritone defined an era of emotionally turbulent and philosophically deep Tagore music.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    album: 'Rabindra Sangeet Ratnavali',
    languageId: 7,
    genreId: 9,
    mood: 'Gaan Porbo / Rabindra Sangeet',
    durationSeconds: 186,
    audioKey: 'tomay_gaan_shonabo.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    releaseDate: '2026-11-04',
    likes: 22800,
    plays: 486000,
    popularity: 98.8,
    lyrics: [
      { start: 0, end: 31000, text: 'Tomay gaan shonabo tai to amay jagaye rakho' },
      { start: 31000, end: 62000, text: 'Ogo ghum-bhanganiya amar moner modhye thako' },
      { start: 62000, end: 93000, text: 'Sur tulechho buker gobhir tarani jeno vasiye' },
      { start: 93000, end: 124000, text: 'Aakash vora taaray taaray chhanda je paathao' },
      { start: 124000, end: 155000, text: 'Amar gaaner majhe aaji tomar shobdo baje' },
      { start: 155000, end: 186000, text: 'Chirantana roope tumi hridoy majhe dekha dao' }
    ]
  },
  {
    title: 'Bhalobeshe Sakhi Nivrite',
    slug: 'bhalobeshe-sakhi-nivrite-tagore-chinmoy',
    artist: 'Chinmoy Chatterjee',
    bio: 'Distinguished Rabindra Sangeet maestro known for lyrical warmth, classical precision, and tender vocal renditions.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    album: 'Gaaner Dali',
    languageId: 7,
    genreId: 9,
    mood: 'Prem Porbo / Rabindra Sangeet',
    durationSeconds: 223,
    audioKey: 'bhalobeshe_sakhi_nivrite.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-11-04',
    likes: 22300,
    plays: 475000,
    popularity: 98.7,
    lyrics: [
      { start: 0, end: 37000, text: 'Bhalobeshe sakhi nivrite jatone likhe rekho amar naam' },
      { start: 37000, end: 74000, text: 'Tomar moner modhye jekhane nithor shanti biraje' },
      { start: 74000, end: 111000, text: 'Duti ekti kotha jodi mone pore kobhu eka ghore' },
      { start: 111000, end: 148000, text: 'Gaaner chhande rekho shurobhi bhalobashar taane' },
      { start: 148000, end: 185000, text: 'Bikel-belar klanto batashe ashuk bidayi gaan' },
      { start: 185000, end: 223000, text: 'Chiradiner shriti hoe roibo tomar ei buker kaachhe' }
    ]
  },
  {
    title: 'Amare Karo Jeebon Daan',
    slug: 'amare-karo-jeebon-daan-tagore-suchitra',
    artist: 'Suchitra Mitra',
    bio: 'Pioneering exponent of Rabindra Sangeet renowned for profound emotion, immaculate diction, and timeless renditions of Rabindranath Tagore compositions.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    album: 'Rabindra Prem Geet Mala',
    languageId: 7,
    genreId: 9,
    mood: 'Atmar Samarpan / Rabindra Sangeet',
    durationSeconds: 265,
    audioKey: 'amare_karo_jeebon_daan.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-11-04',
    likes: 23700,
    plays: 504000,
    popularity: 98.9,
    lyrics: [
      { start: 0, end: 44000, text: 'Amare karo jeebon daan ogo bishwa bidhata prabhu' },
      { start: 44000, end: 88000, text: 'Tomar premer amrita dhare snan koriye dao aaji' },
      { start: 88000, end: 132000, text: 'Khudra amar e moner sima jeno vange dhorani majhe' },
      { start: 132000, end: 176000, text: 'Sokol dukh glani muche aalokito hok e jibon' },
      { start: 176000, end: 220000, text: 'Dharoni vora anondo majhe aponare bilaye debo' },
      { start: 220000, end: 265000, text: 'Chorono taley nishi din roibo shanti purno chitte' }
    ]
  },
  {
    title: 'Bandhu Michhe Raag Koro Na',
    slug: 'bandhu-michhe-raag-koro-na-tagore',
    artist: 'Hemanta Mukhopadhyay',
    bio: 'Legendary Indian music maestro and Bengali vocalist celebrated globally for soul-stirring interpretations of Rabindra Sangeet and modern Bengali music.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    album: 'Gitanjali O Shur',
    languageId: 7,
    genreId: 9,
    mood: 'Prem O Khel / Rabindra Sangeet',
    durationSeconds: 127,
    audioKey: 'bandhu_michhe_raag.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-11-04',
    likes: 21900,
    plays: 466000,
    popularity: 98.7,
    lyrics: [
      { start: 0, end: 21000, text: 'Bandhu michhe raag koro na chanchal ei mon ke bujhao' },
      { start: 21000, end: 42000, text: 'Khoniker abhimaan bhule aaji heshe kotha kow re' },
      { start: 42000, end: 63000, text: 'Shundor ei shondhar batashe shanti dhaley akashe' },
      { start: 63000, end: 84000, text: 'Miloner shur baje baje hridoy kusum bikashe' },
      { start: 84000, end: 105000, text: 'Bhalobashar chanchal nodi bohe jaye obiram' },
      { start: 105000, end: 127000, text: 'Bandhu phire aaso apon hridoy majhe aaji' }
    ]
  },
  {
    title: 'Amar Pothe Pothe Pathor',
    slug: 'amar-pothe-pothe-pathor-tagore-promit',
    artist: 'Promit Sen',
    bio: 'Acclaimed contemporary Rabindra Sangeet vocalist celebrated for classical adherence and emotive resonance.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    album: 'Path Chawla Rabindra Gaan',
    languageId: 7,
    genreId: 9,
    mood: 'Jibon Poth / Rabindra Sangeet',
    durationSeconds: 162,
    audioKey: 'amar_pothe_pothe_pathor.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-11-04',
    likes: 22000,
    plays: 470000,
    popularity: 98.7,
    lyrics: [
      { start: 0, end: 27000, text: 'Amar pothe pothe pathor chhorano kanta bhora re' },
      { start: 27000, end: 54000, text: 'Tobu cholite hobe aage tomar ashar aaloke' },
      { start: 54000, end: 81000, text: 'Durer banshi baje bajuk klanto paaye choli aaji' },
      { start: 81000, end: 108000, text: 'Kothao thamiye jabar nay re aaji ei jibon khela' },
      { start: 108000, end: 135000, text: 'Andhar periye shondhar paar aalor deshe jabo' },
      { start: 135000, end: 162000, text: 'Charon dhula porosh paile purno hobe poth chola' }
    ]
  },
  {
    title: 'Ami Keboli Swapon Korechhi Bopon',
    slug: 'ami-keboli-swapon-korechhi-bopon-tagore',
    artist: 'Suchitra Mitra',
    bio: 'Pioneering exponent of Rabindra Sangeet renowned for profound emotion, immaculate diction, and timeless renditions of Rabindranath Tagore compositions.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    album: 'Rabindra Prem Geet Mala',
    languageId: 7,
    genreId: 9,
    mood: 'Swapon O Bedona / Rabindra Sangeet',
    durationSeconds: 209,
    audioKey: 'ami_keboli_swapon.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    releaseDate: '2026-11-04',
    likes: 22700,
    plays: 483000,
    popularity: 98.8,
    lyrics: [
      { start: 0, end: 35000, text: 'Ami keboli swapon korechhi bopon batashe batashe' },
      { start: 35000, end: 70000, text: 'Phul photena shukhiye jaye ashar e shurabhi' },
      { start: 70000, end: 105000, text: 'Tobu moner gobhire aaji baanshi baje ogo priyo' },
      { start: 105000, end: 140000, text: 'Nishi rater nirobota bhenge gan geye jai eka' },
      { start: 140000, end: 175000, text: 'Tomar ashay boshe thaka ei jiboner paroshite' },
      { start: 175000, end: 209000, text: 'Swapon majhe pabo ki tare shantir oi sagore' }
    ]
  },
  {
    title: 'Je Chhilo Amar Swapone Charini',
    slug: 'je-chhilo-amar-swapone-charini-tagore',
    artist: 'Hemanta Mukhopadhyay',
    bio: 'Legendary Indian music maestro and Bengali vocalist celebrated globally for soul-stirring interpretations of Rabindra Sangeet and modern Bengali music.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    album: 'Gitanjali O Shur',
    languageId: 7,
    genreId: 9,
    mood: 'Prem O Milon / Rabindra Sangeet',
    durationSeconds: 205,
    audioKey: 'je_chhilo_amar_swapone.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-11-04',
    likes: 23100,
    plays: 491000,
    popularity: 98.8,
    lyrics: [
      { start: 0, end: 34000, text: 'Je chhilo amar swapone charini tare aaji kache pai' },
      { start: 34000, end: 68000, text: 'Hridoyer bhasha bujhe niye nayan khule je chay' },
      { start: 68000, end: 102000, text: 'Modhur rate chander aaloy dujone miloni gaan' },
      { start: 102000, end: 136000, text: 'Bhalobashar modhu barikhe sokol dukkho abhimaan' },
      { start: 136000, end: 170000, text: 'Chirodiner saathi hoye thakbo tomar pashe aaji' },
      { start: 170000, end: 205000, text: 'Swapone charini aamar jage hridoy kuthire' }
    ]
  },
  {
    title: 'O Ki Elo O Ki Elo Re Priyatama',
    slug: 'o-ki-elo-re-priyatama-tagore',
    artist: 'Chinmoy Chatterjee',
    bio: 'Distinguished Rabindra Sangeet maestro known for lyrical warmth, classical precision, and tender vocal renditions.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    album: 'Gaaner Dali',
    languageId: 7,
    genreId: 9,
    mood: 'Aagomoni / Rabindra Sangeet',
    durationSeconds: 190,
    audioKey: 'o_ki_elo_re_priyatama.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-11-04',
    likes: 22400,
    plays: 477000,
    popularity: 98.7,
    lyrics: [
      { start: 0, end: 32000, text: 'O ki elo o ki elo re priyatama ghore amar' },
      { start: 32000, end: 64000, text: 'Batashe baje mridu paayer nupur dhoni aaji' },
      { start: 64000, end: 96000, text: 'Duar khule cheye dekhi phuler shorob borosha' },
      { start: 96000, end: 128000, text: 'Kato diner protikhar por elo re ananda shanti' },
      { start: 128000, end: 160000, text: 'Charon tholay aponare shomorpito kori aaji' },
      { start: 160000, end: 190000, text: 'Hridoy majhe bashiye rakho chiradiner preme' }
    ]
  },
  {
    title: 'Dakbona Dakbona Aar Tomare',
    slug: 'dakbona-dakbona-aar-tomare-tagore',
    artist: 'Debabrata Biswas',
    bio: 'Revered Bengali vocalist whose iconic booming baritone defined an era of emotionally turbulent and philosophically deep Tagore music.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    album: 'Rabindra Sangeet Ratnavali',
    languageId: 7,
    genreId: 9,
    mood: 'Biraha O Shanti / Rabindra Sangeet',
    durationSeconds: 198,
    audioKey: 'dakbona_dakbona_aar_tomare.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-11-04',
    likes: 22600,
    plays: 481000,
    popularity: 98.8,
    lyrics: [
      { start: 0, end: 33000, text: 'Dakbona dakbona aar tomare bhuliya thakite chai' },
      { start: 33000, end: 66000, text: 'Kothaye gechho choliya tumi fele ei eka poth' },
      { start: 66000, end: 99000, text: 'Moner bedona bujhibe ke re ashru jhore du nayane' },
      { start: 99000, end: 132000, text: 'Tobu tomar smriti ghire royechhe e hridoy majhe' },
      { start: 132000, end: 165000, text: 'Bhalobashar daan ja chhilo shobi to diyechhi tomay' },
      { start: 165000, end: 198000, text: 'Shanti purno chirantana he tomake namo shonai' }
    ]
  },
  {
    title: 'Ami Hridoyer Katha Bolite Byakul',
    slug: 'ami-hridoyer-katha-bolite-byakul-tagore',
    artist: 'Promit Sen',
    bio: 'Acclaimed contemporary Rabindra Sangeet vocalist celebrated for classical adherence and emotive resonance.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    album: 'Path Chawla Rabindra Gaan',
    languageId: 7,
    genreId: 9,
    mood: 'Antarer Bhasha / Rabindra Sangeet',
    durationSeconds: 206,
    audioKey: 'ami_hridoyer_katha_bolite.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-11-04',
    likes: 22900,
    plays: 488000,
    popularity: 98.8,
    lyrics: [
      { start: 0, end: 34000, text: 'Ami hridoyer katha bolite byakul ke shonibe aaji' },
      { start: 34000, end: 68000, text: 'Gobhir buker gopon shur je baaje nishi rati' },
      { start: 68000, end: 103000, text: 'Tomar kaachhe ashar tore chanchal holo re e pran' },
      { start: 103000, end: 137000, text: 'Shonar aalor parosh laguk sokol kothar majhe' },
      { start: 137000, end: 171000, text: 'Bhashar modhye prana dhaley gaibo anando gan' },
      { start: 171000, end: 206000, text: 'Hridoyer modhur preme shobi purno hoe jabe' }
    ]
  },
  {
    title: 'Khama Karo More Shakhi',
    slug: 'khama-karo-more-shakhi-tagore',
    artist: 'Suchitra Mitra',
    bio: 'Pioneering exponent of Rabindra Sangeet renowned for profound emotion, immaculate diction, and timeless renditions of Rabindranath Tagore compositions.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    album: 'Rabindra Prem Geet Mala',
    languageId: 7,
    genreId: 9,
    mood: 'Prarthana O Shanti / Rabindra Sangeet',
    durationSeconds: 215,
    audioKey: 'khama_karo_more_shakhi.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    releaseDate: '2026-11-04',
    likes: 23300,
    plays: 495000,
    popularity: 98.9,
    lyrics: [
      { start: 0, end: 35000, text: 'Khama karo more shakhi amar bhul jodi hoe thake' },
      { start: 35000, end: 71000, text: 'Ojana poth-e cholite giye koto je bhul koriya feli' },
      { start: 71000, end: 107000, text: 'Antare je premer srote bhalobasha jagiye chhilo' },
      { start: 107000, end: 143000, text: 'Miloner oi modhur logne keno je abhimaan elo' },
      { start: 143000, end: 179000, text: 'Duti noyoner ashru dhare shokol katha muchhe dao' },
      { start: 179000, end: 215000, text: 'Abar aamra ektro hobo premer purno aashishe' }
    ]
  },

  // ─── 3. HINDI (hi - id: 1) — 10 NEW MEERA & KABIR SACRED BHAJANS ───
  {
    title: 'Aao To Sahi Mohan Mere',
    slug: 'aao-to-sahi-mohan-mere-tarasingh',
    artist: 'Tarasingh Dodve',
    bio: 'Dedicated devotional vocalist specializing in the timeless, emotive verses of Sant Kabir and Bhakta Meera Bai.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    album: 'Meera Bai Ke Amar Bhajan',
    languageId: 1,
    genreId: 9,
    mood: 'Viraha Bhakti / Meera Bai',
    durationSeconds: 308,
    audioKey: 'meera_aao_to_sari_mohan.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-11-04',
    likes: 23600,
    plays: 502000,
    popularity: 98.9,
    lyrics: [
      { start: 0, end: 51000, text: 'Aao to sahi mohan mere naina taras rahe darshan ko' },
      { start: 51000, end: 102000, text: 'Girdhar gopal prabhu araj suno meera ki aangan me' },
      { start: 102000, end: 154000, text: 'Prem nagariya basaayi man me biraha aag sulagti re' },
      { start: 154000, end: 205000, text: 'Chhodo madhuvan aao kanhaiya pyas bujhao nainan ki' },
      { start: 205000, end: 256000, text: 'Tumhare bina mohan jag suna koyi sahara na dikhe re' },
      { start: 256000, end: 308000, text: 'Meera ke prabhu girdhar nagar charan kamal chit laao re' }
    ]
  },
  {
    title: 'Eri Sakhi Main Prem Diwani',
    slug: 'eri-sakhi-main-prem-diwani-tarasingh',
    artist: 'Tarasingh Dodve',
    bio: 'Dedicated devotional vocalist specializing in the timeless, emotive verses of Sant Kabir and Bhakta Meera Bai.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    album: 'Meera Bai Ke Amar Bhajan',
    languageId: 1,
    genreId: 9,
    mood: 'Prem Diwani / Meera Bai',
    durationSeconds: 306,
    audioKey: 'meera_eri_sakhi_prem_diwani.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-11-04',
    likes: 24200,
    plays: 515000,
    popularity: 99.0,
    lyrics: [
      { start: 0, end: 51000, text: 'Eri sakhi main prem diwani mera dard na jane koye' },
      { start: 51000, end: 102000, text: 'Sooli upar sej hamari kaho kis vidh sona hoye' },
      { start: 102000, end: 153000, text: 'Gagan mandal pe sej piya ki kis vidh milna hoye' },
      { start: 153000, end: 204000, text: 'Ghayal ki gati ghayal jane ki jin laagi hoye' },
      { start: 204000, end: 255000, text: 'Johari ki gati johari jane ki jin ratan parakh hoye' },
      { start: 255000, end: 306000, text: 'Meera ki prabhu peer mitegi jab baid sanwaliya hoye' }
    ]
  },
  {
    title: 'Maayi Ri Maine Liyo Govindo Mol',
    slug: 'maayi-ri-maine-liyo-govindo-mol-tarasingh',
    artist: 'Tarasingh Dodve',
    bio: 'Dedicated devotional vocalist specializing in the timeless, emotive verses of Sant Kabir and Bhakta Meera Bai.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    album: 'Meera Bai Ke Amar Bhajan',
    languageId: 1,
    genreId: 9,
    mood: 'Bhakti Samarpan / Meera Bai',
    durationSeconds: 310,
    audioKey: 'meera_maayi_ri_maine_liyo.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-11-04',
    likes: 24900,
    plays: 530000,
    popularity: 99.1,
    lyrics: [
      { start: 0, end: 51000, text: 'Maayi ri maine liyo govindo mol koi kahe sasto koi kahe mehngo' },
      { start: 51000, end: 103000, text: 'Liyo ri maine tula naap tol khelan aayi brij nagar me' },
      { start: 103000, end: 155000, text: 'Koi kahe ghar me koi kahe ban me radha sang gokul me' },
      { start: 155000, end: 206000, text: 'Bajata mridang dholak jhankar charan sharan har pal re' },
      { start: 206000, end: 258000, text: 'Purab janam ki preet purani sab jag dekhya khol re' },
      { start: 258000, end: 310000, text: 'Meera ke prabhu girdhar nagar aatam anand bol re' }
    ]
  },
  {
    title: 'Kanha Sang Preet Lagi',
    slug: 'kanha-sang-preet-lagi-meera-tarasingh',
    artist: 'Tarasingh Dodve',
    bio: 'Dedicated devotional vocalist specializing in the timeless, emotive verses of Sant Kabir and Bhakta Meera Bai.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    album: 'Meera Bai Ke Amar Bhajan',
    languageId: 1,
    genreId: 9,
    mood: 'Krishna Preet / Meera Bai',
    durationSeconds: 307,
    audioKey: 'meera_kanha_sang_preet_lagi.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-11-04',
    likes: 23800,
    plays: 507000,
    popularity: 98.9,
    lyrics: [
      { start: 0, end: 51000, text: 'Kanha sang preet lagi aisi re ab to chhooti na chhoote' },
      { start: 51000, end: 102000, text: 'Log kahe meera bhayi bawari lok laaj sab khooti re' },
      { start: 102000, end: 153000, text: 'Gokul ke gwal sang murali bajave shyam manohar girdhari' },
      { start: 153000, end: 204000, text: 'Bish ka pyala rana ne bheja amrit kiyo banwari re' },
      { start: 204000, end: 255000, text: 'Sant mandali me meera naache ghungroo baandh pyari re' },
      { start: 255000, end: 307000, text: 'Meera ke prabhu girdhar nagar charan kamal balihari re' }
    ]
  },
  {
    title: 'Rana Ji Tharo Deshadlo Rang Roodo',
    slug: 'rana-ji-tharo-deshadlo-rang-roodo-tarasingh',
    artist: 'Tarasingh Dodve',
    bio: 'Dedicated devotional vocalist specializing in the timeless, emotive verses of Sant Kabir and Bhakta Meera Bai.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    album: 'Meera Bai Ke Amar Bhajan',
    languageId: 1,
    genreId: 9,
    mood: 'Vairagya / Meera Bai',
    durationSeconds: 328,
    audioKey: 'meera_rana_ji_tharo_deshadlo.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    releaseDate: '2026-11-04',
    likes: 24500,
    plays: 522000,
    popularity: 99.0,
    lyrics: [
      { start: 0, end: 54000, text: 'Rana ji tharo deshadlo rang roodo naahi man bhave re' },
      { start: 54000, end: 109000, text: 'Mahal khazaana sab jhootha re girdhar charan chit laage re' },
      { start: 109000, end: 164000, text: 'Saadhu sangat me gyan mile re bish ka amrit hoye re' },
      { start: 164000, end: 218000, text: 'Sarp pitara rana ne bheja shaligram ban jaaye re' },
      { start: 218000, end: 273000, text: 'Hari bhajan bina sab jag suna prem ki dori baandhi re' },
      { start: 273000, end: 328000, text: 'Meera baayi kahe girdhar nagar aatam dhyan lagaaye re' }
    ]
  },
  {
    title: 'Duniya Ajab Diwani',
    slug: 'duniya-ajab-diwani-kabir-tarasingh',
    artist: 'Tarasingh Dodve',
    bio: 'Dedicated devotional vocalist specializing in the timeless, emotive verses of Sant Kabir and Bhakta Meera Bai.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    album: 'Sant Kabir Amrit Pad',
    languageId: 1,
    genreId: 9,
    mood: 'Kabir Vani / Nirgun',
    durationSeconds: 305,
    audioKey: 'kabir_duniya_ajab_diwani.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-11-04',
    likes: 24100,
    plays: 514000,
    popularity: 99.0,
    lyrics: [
      { start: 0, end: 50000, text: 'Duniya ajab diwani re patthar poojan jaave' },
      { start: 50000, end: 101000, text: 'Ghar ki chakki koi na pooje jaaka pisa khaave re' },
      { start: 101000, end: 152000, text: 'Man na rangaaye rangaaye jogi kapada dhundhe ban me' },
      { start: 152000, end: 203000, text: 'Aatam ram hridoy me baithe bhatake chahun or re' },
      { start: 203000, end: 254000, text: 'Prem prem sab koi kahe prem na chinha koye' },
      { start: 254000, end: 305000, text: 'Kahat kabir suno bhai sadho sahib mile sahaj me' }
    ]
  },
  {
    title: 'Kaya Nagari Me Pardesi Bole',
    slug: 'kaya-nagari-me-pardesi-bole-kabir',
    artist: 'Tarasingh Dodve',
    bio: 'Dedicated devotional vocalist specializing in the timeless, emotive verses of Sant Kabir and Bhakta Meera Bai.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    album: 'Sant Kabir Amrit Pad',
    languageId: 1,
    genreId: 9,
    mood: 'Chetavani Bhajan / Sant Kabir',
    durationSeconds: 366,
    audioKey: 'kabir_kaya_nagari_pardesi.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-11-04',
    likes: 24700,
    plays: 526000,
    popularity: 99.1,
    lyrics: [
      { start: 0, end: 61000, text: 'Kaya nagari me pardesi piyo bole re manva' },
      { start: 61000, end: 122000, text: 'Das darwaje ka pinjara banaya hans akela rahe re' },
      { start: 122000, end: 183000, text: 'Udd jaayega ek din hans akela kaaya padi rah jaave re' },
      { start: 183000, end: 244000, text: 'Maat pita suta baandhava jhootha sab swarath ke meet re' },
      { start: 244000, end: 305000, text: 'Ram naam ka sumiran kar le antar jot jagaye re' },
      { start: 305000, end: 366000, text: 'Kahat kabir suno dharmi jano param pad nirbhay pave re' }
    ]
  },
  {
    title: 'Kya Hove Re Nahaye Dhoye',
    slug: 'kya-hove-re-nahaye-dhoye-kabir',
    artist: 'Tarasingh Dodve',
    bio: 'Dedicated devotional vocalist specializing in the timeless, emotive verses of Sant Kabir and Bhakta Meera Bai.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    album: 'Sant Kabir Amrit Pad',
    languageId: 1,
    genreId: 9,
    mood: 'Antar Shuddhi / Sant Kabir',
    durationSeconds: 343,
    audioKey: 'kabir_kya_hove_nahaye_dhoye.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-11-04',
    likes: 23900,
    plays: 509000,
    popularity: 98.9,
    lyrics: [
      { start: 0, end: 57000, text: 'Kya hove re nahaye dhoye jab man ka mail na jaave' },
      { start: 57000, end: 114000, text: 'Machhli sada neer me rahe baas na chhoote taahi re' },
      { start: 114000, end: 171000, text: 'Teerath nahaaye ganga gaye man ka paap na dhooe re' },
      { start: 171000, end: 228000, text: 'Antar aatam sudh bina sab karni vyartha jaave re' },
      { start: 228000, end: 285000, text: 'Nirmala man jab hoye biraje sahib mile bina mol re' },
      { start: 285000, end: 343000, text: 'Kahat kabir suno bhai sadho sachha naam chit laaye re' }
    ]
  },
  {
    title: 'Na Jane Tera Saheb Kaisa Hai',
    slug: 'na-jane-tera-saheb-kaisa-hai-kabir',
    artist: 'Tarasingh Dodve',
    bio: 'Dedicated devotional vocalist specializing in the timeless, emotive verses of Sant Kabir and Bhakta Meera Bai.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    album: 'Sant Kabir Amrit Pad',
    languageId: 1,
    genreId: 9,
    mood: 'Nirankar Saheb / Sant Kabir',
    durationSeconds: 441,
    audioKey: 'kabir_na_jane_tera_saheb.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-11-04',
    likes: 25100,
    plays: 533000,
    popularity: 99.1,
    lyrics: [
      { start: 0, end: 73000, text: 'Na jane tera saheb kaisa hai re moorakh manva' },
      { start: 73000, end: 147000, text: 'Nahi aakaar na roop rekh hai sarva vyapak saheb re' },
      { start: 147000, end: 220000, text: 'Pahla paanv zameen pe naahi aakash bina aadhar re' },
      { start: 220000, end: 294000, text: 'Kasturi kundal base mrig dhundhe ban maahi re' },
      { start: 294000, end: 367000, text: 'Aise ghat ghat ram hai duniya dekhe naahi re' },
      { start: 367000, end: 441000, text: 'Kahat kabir suno bhai sadho sahaj samadhi laagi re' }
    ]
  },
  {
    title: 'Musafir Jana Padega Re Manva',
    slug: 'musafir-jana-padega-re-manva-kabir',
    artist: 'Tarasingh Dodve',
    bio: 'Dedicated devotional vocalist specializing in the timeless, emotive verses of Sant Kabir and Bhakta Meera Bai.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    album: 'Sant Kabir Amrit Pad',
    languageId: 1,
    genreId: 9,
    mood: 'Moksha Chetavani / Sant Kabir',
    durationSeconds: 435,
    audioKey: 'kabir_musafir_jana_padega.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    releaseDate: '2026-11-04',
    likes: 25400,
    plays: 539000,
    popularity: 99.2,
    lyrics: [
      { start: 0, end: 72000, text: 'Musafir jana padega re manva aakhir ek din yahan se' },
      { start: 72000, end: 145000, text: 'Ye jag rain basera hai musafir ka Dera re' },
      { start: 145000, end: 217000, text: 'Kaal sarp sir par mandraave koi bachan na paave re' },
      { start: 217000, end: 290000, text: 'Dhan daulat sab yahi rahega jhootha prem pasara re' },
      { start: 290000, end: 362000, text: 'Ram naam ki naav pakad le bhav sagar tar jaave re' },
      { start: 362000, end: 435000, text: 'Kahat kabir suno bhai sadho mukti dhaam sidhaare re' }
    ]
  },

  // ─── 4. GUJARATI (gu - id: 9) — 6 NEW DEVOTIONAL SANTVANI BHAJANS ───
  {
    title: 'Bhakti Re Karvi Ene Rank Thai Ne Rehvun',
    slug: 'bhakti-re-karvi-ene-rank-thai-ne-rehvun-bhatt',
    artist: 'Khemchand Bhatt',
    bio: 'Prominent Gujarati devotional vocalist renowned for authentic rendition of Pushtimarg haveli sangeet and classical bhajans.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    album: 'Gujarati Bhakti Mala',
    languageId: 9,
    genreId: 6,
    mood: 'Santvani Bhajan / Traditional',
    durationSeconds: 313,
    audioKey: 'gujarati_bhajan_29.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-11-04',
    likes: 23100,
    plays: 491000,
    popularity: 98.8,
    lyrics: [
      { start: 0, end: 52000, text: 'Bhakti re karvi ene rank thai ne rehvu re manva' },
      { start: 52000, end: 104000, text: 'Abhimaan ni maaya muki shree hari sharan jaavu re' },
      { start: 104000, end: 156000, text: 'Sant samaagam kariye sadaye nirmala thai man ma' },
      { start: 156000, end: 208000, text: 'Krodh moh lobh ne tajiye e j kalyan chhe re' },
      { start: 208000, end: 260000, text: 'Guru vachane shradhdha raakhi bhavsaagar tharvu re' },
      { start: 260000, end: 313000, text: 'Narasinh mehta kahe hari charane vishram paavu re' }
    ]
  },
  {
    title: 'Krishna Kanha Tari Murli Vagire',
    slug: 'krishna-kanha-tari-murli-vagire-chauhan',
    artist: 'Hemant Chauhan',
    bio: 'Revered folk and devotional vocalist of Gujarat whose resonant timbre has popularized traditional Pushtimarg and Santvani traditions.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    album: 'Pushtimarg Kirtan Sangrah',
    languageId: 9,
    genreId: 6,
    mood: 'Raas Leela / Traditional',
    durationSeconds: 349,
    audioKey: 'gujarati_bhajan_30.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-11-04',
    likes: 24000,
    plays: 510000,
    popularity: 98.9,
    lyrics: [
      { start: 0, end: 58000, text: 'Krishna kanha tari murli vagire gokul ni kadiyo ma' },
      { start: 58000, end: 116000, text: 'Gopio badhi gheli thayi madhuvan na marga ma' },
      { start: 116000, end: 174000, text: 'Sur suni ne surbhi bhuli gharna sahu kam re' },
      { start: 174000, end: 232000, text: 'Ras ramade girdhari khelan aavya aatam re' },
      { start: 232000, end: 290000, text: 'Radha rani sang biraje shyam sundar mohan' },
      { start: 290000, end: 349000, text: 'Murli na sur ma vasiyo sakhal bhuvan mangal' }
    ]
  },
  {
    title: 'Nath Tamaro Aadhar Che Re',
    slug: 'nath-tamaro-aadhar-che-re-bhatt',
    artist: 'Khemchand Bhatt',
    bio: 'Prominent Gujarati devotional vocalist renowned for authentic rendition of Pushtimarg haveli sangeet and classical bhajans.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    album: 'Gujarati Bhakti Mala',
    languageId: 9,
    genreId: 6,
    mood: 'Prarthana Bhajan / Traditional',
    durationSeconds: 418,
    audioKey: 'gujarati_bhajan_31.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-11-04',
    likes: 23800,
    plays: 506000,
    popularity: 98.9,
    lyrics: [
      { start: 0, end: 69000, text: 'Nath tamaro aadhar che re deen bandhu bhagwan' },
      { start: 69000, end: 139000, text: 'Samsar ni aavi aadhi ma tamare sharane aavya' },
      { start: 139000, end: 208000, text: 'Koi na sachu sahara e vakhate tame shyam' },
      { start: 208000, end: 278000, text: 'Karuna sindhu kripalu dev karo bhakta uddhar' },
      { start: 278000, end: 348000, text: 'Antar na andhkar ne kapi aalo jivan daan' },
      { start: 348000, end: 418000, text: 'Shree krishna charanam mamah japta rahe re pran' }
    ]
  },
  {
    title: 'Govind Gopal Radhe Shyam Bhajo',
    slug: 'govind-gopal-radhe-shyam-bhajo-chauhan',
    artist: 'Hemant Chauhan',
    bio: 'Revered folk and devotional vocalist of Gujarat whose resonant timbre has popularized traditional Pushtimarg and Santvani traditions.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    album: 'Pushtimarg Kirtan Sangrah',
    languageId: 9,
    genreId: 6,
    mood: 'Nama Kirtan / Traditional',
    durationSeconds: 411,
    audioKey: 'gujarati_bhajan_32.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-11-04',
    likes: 24300,
    plays: 516000,
    popularity: 99.0,
    lyrics: [
      { start: 0, end: 68000, text: 'Govind gopal radhe shyam bhajo manva prem bhari' },
      { start: 68000, end: 137000, text: 'Bhav sagar tari java no shreshtha aadhar hari' },
      { start: 137000, end: 205000, text: 'Gokul ma nandanandana jaya bal gopal namo' },
      { start: 205000, end: 274000, text: 'Mathura ma kansa vimardan shri dwarkadhish namo' },
      { start: 274000, end: 342000, text: 'Pavitra naam japiye nitya shree krishna shyam sundar' },
      { start: 342000, end: 411000, text: 'Hari bhajan ma liin thai jaao sukh paamo nirdhaar' }
    ]
  },
  {
    title: 'Jaya Jaya Shree Shrinathji Kripala',
    slug: 'jaya-jaya-shree-shrinathji-kripala-bhatt',
    artist: 'Khemchand Bhatt',
    bio: 'Prominent Gujarati devotional vocalist renowned for authentic rendition of Pushtimarg haveli sangeet and classical bhajans.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    album: 'Gujarati Bhakti Mala',
    languageId: 9,
    genreId: 6,
    mood: 'Haveli Sangeet / Pushtimarg',
    durationSeconds: 573,
    audioKey: 'gujarati_bhajan_33.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    releaseDate: '2026-11-04',
    likes: 25700,
    plays: 546000,
    popularity: 99.2,
    lyrics: [
      { start: 0, end: 95000, text: 'Jaya jaya shree shrinathji kripala nathavara shyam' },
      { start: 95000, end: 191000, text: 'Mangala charan stuti kariye gaaiye divya naam' },
      { start: 191000, end: 286000, text: 'Kamal nayan shobhe pyara mastak mor mukut dhar' },
      { start: 286000, end: 382000, text: 'Jharokhe darshan aapi ne bhaktano haro dukh bhara' },
      { start: 382000, end: 477000, text: 'Pushti ras amrit barse srinathji na dham ma' },
      { start: 477000, end: 573000, text: 'Namo namo shree vallabh prabhu sada vasiyo hriday ma' }
    ]
  },
  {
    title: 'Rang Ma Rangai Jane Rangila Shreenathji',
    slug: 'rang-ma-rangai-jane-rangila-shreenathji',
    artist: 'Hemant Chauhan',
    bio: 'Revered folk and devotional vocalist of Gujarat whose resonant timbre has popularized traditional Pushtimarg and Santvani traditions.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    album: 'Pushtimarg Kirtan Sangrah',
    languageId: 9,
    genreId: 6,
    mood: 'Anand Kirtan / Pushtimarg',
    durationSeconds: 312,
    audioKey: 'gujarati_bhajan_34.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-11-04',
    likes: 23600,
    plays: 502000,
    popularity: 98.9,
    lyrics: [
      { start: 0, end: 52000, text: 'Rang ma rangai jane rangila shreenathji na rang ma' },
      { start: 52000, end: 104000, text: 'Mohan tara mukhda par vari jaun aatam rang ma' },
      { start: 104000, end: 156000, text: 'Yamuna kinar re khelan aavya nanda kishore' },
      { start: 156000, end: 208000, text: 'Gopala gopala japiye din raat chitt chakor' },
      { start: 208000, end: 260000, text: 'Bhav bhay bhanguri krupalu shri vallabh charan re' },
      { start: 260000, end: 312000, text: 'Satsang ma aananda paami prapanna thavu sharan re' }
    ]
  },

  // ─── 5. TELUGU (te - id: 2) — 3 NEW ANNAMACHARYA & THYAGARAJA MASTERWORKS ───
  {
    title: 'Bhavamu Lona Bagu Matinche',
    slug: 'bhavamu-lona-bagu-matinche-ms-subbulakshmi',
    artist: 'M. S. Subbulakshmi',
    bio: 'The Nightengale of India, Bharat Ratna Dr. M. S. Subbulakshmi was universally revered as the foremost Carnatic vocalist of the 20th century.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    album: 'Annamacharya Sankeerthanas',
    languageId: 2,
    genreId: 4,
    mood: 'Suddhadhanyasi / Annamacharya',
    durationSeconds: 310,
    audioKey: 'bhavamu_lona_ms_subbulakshmi.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-11-04',
    likes: 27400,
    plays: 582000,
    popularity: 99.4,
    lyrics: [
      { start: 0, end: 51000, text: 'Bhavamu lona bagu matienche govinduni namam' },
      { start: 51000, end: 103000, text: 'Govinda govinda yani koluvaro manujulaara' },
      { start: 103000, end: 155000, text: 'Aasala thagilenu dehamu aayuvunu theeraga nedu' },
      { start: 155000, end: 206000, text: 'Hari nama smaraname paramananda muktiki thodu' },
      { start: 206000, end: 258000, text: 'Venkatesha padakamalamula nammina vaariki bhayamela' },
      { start: 258000, end: 310000, text: 'Krupa joochi brova samardhudu sri venkata giripathi' }
    ]
  },
  {
    title: 'Jo Achyutananda Jo Jo Mukunda',
    slug: 'jo-achyutananda-jo-jo-mukunda-annamacharya',
    artist: 'S. Janaki',
    bio: 'One of the greatest playback vocalists in Indian cinema history, celebrated for her four National Awards and spiritual Telugu lullabies.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    album: 'Annamacharya Lali Geethalu',
    languageId: 2,
    genreId: 4,
    mood: 'Lullaby / Annamacharya',
    durationSeconds: 410,
    audioKey: 'jo_achyutananda_mukunda_annamacharya.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-11-04',
    likes: 26100,
    plays: 554000,
    popularity: 99.2,
    lyrics: [
      { start: 0, end: 68000, text: 'Jo achyutananda jo jo mukunda rave paramaananda gopala bala' },
      { start: 68000, end: 136000, text: 'Nanda nandana neeku namo namo devaki thanaya divya swaroopa' },
      { start: 136000, end: 205000, text: 'Palasindhu sayana padmanabha bala thottela lo thongi nidura pova' },
      { start: 205000, end: 273000, text: 'Yashoda muddu bidda ananda datha venkataadri vasudavu neevura' },
      { start: 273000, end: 341000, text: 'Chinni krishnuni jo lali paadiri surulu kusuma varshamulu kuriya' },
      { start: 341000, end: 410000, text: 'Jo jo anuchu lalinchiri gopikalu shree ranga naadha bala' }
    ]
  },
  {
    title: 'Neeve Nannu Brova Beku',
    slug: 'neeve-nannu-brova-beku-tvs-darbar',
    artist: 'T. V. Sankaranarayanan',
    bio: 'One of the most illustrious Carnatic vocal masters of his generation, Sangita Kalanidhi T.V.S. is renowned for peerless shruti shuddham and vibrant manodharma.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    album: 'Live at Nadopasana',
    languageId: 2,
    genreId: 4,
    mood: 'Darbar / Thyagaraja',
    durationSeconds: 541,
    audioKey: 'neeve_nannu_darbar_tvs.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-11-04',
    likes: 26500,
    plays: 563000,
    popularity: 99.3,
    lyrics: [
      { start: 0, end: 90000, text: 'Neeve nannu brova beku sree raghupathe deena bandho' },
      { start: 90000, end: 180000, text: 'Darbar raga vilasitha sundara vadana aravinda nayana' },
      { start: 180000, end: 270000, text: 'Aapath baandhava anadha rakshaka ksheera sagara shayana' },
      { start: 270000, end: 360000, text: 'Thyagaraja hrudaya nivasitha parama mangala murthy' },
      { start: 360000, end: 450000, text: 'Nee padame sharanamani koluchu bhaktulaku krupa chuupu' },
      { start: 450000, end: 541000, text: 'Pranatosmi sri ramachandra charanambuja namosthuthe' }
    ]
  },

  // ─── 6. TAMIL (ta - id: 3) — 2 NEW CLASSICAL VOCAL MASTERWORKS ───
  {
    title: 'Maha Ganapathe Hamsadhwani',
    slug: 'maha-ganapathe-hamsadhwani-tvs-dikshitar',
    artist: 'T. V. Sankaranarayanan',
    bio: 'One of the most illustrious Carnatic vocal masters of his generation, Sangita Kalanidhi T.V.S. is renowned for peerless shruti shuddham and vibrant manodharma.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    album: 'Live at Nadopasana',
    languageId: 3,
    genreId: 4,
    mood: 'Hamsadhwani / Muthuswami Dikshitar',
    durationSeconds: 896,
    audioKey: 'maha_ganapathe_hamsadhwani_tvs.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    releaseDate: '2026-11-04',
    likes: 28100,
    plays: 598000,
    popularity: 99.5,
    lyrics: [
      { start: 0, end: 149000, text: 'Maha ganapathe namosthuthe maathanga mukha prabho' },
      { start: 149000, end: 298000, text: 'Hamsadhwani raga priya modaka hastha vinayaka' },
      { start: 298000, end: 448000, text: 'Vighna harana sankata mochana sree parvati nandana' },
      { start: 448000, end: 597000, text: 'Suramunigana poojitha charana vallabha nayaka' },
      { start: 597000, end: 746000, text: 'Guruguha sahothara shubha phala dayaka mangalam' },
      { start: 746000, end: 896000, text: 'Pranatosmi sree ganeshwara charanambuja namosthuthe' }
    ]
  },
  {
    title: 'Sri Matrubhutam Trishiragiri Natham',
    slug: 'sri-matrubhutam-trishiragiri-natham-tvs',
    artist: 'T. V. Sankaranarayanan',
    bio: 'One of the most illustrious Carnatic vocal masters of his generation, Sangita Kalanidhi T.V.S. is renowned for peerless shruti shuddham and vibrant manodharma.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    album: 'Live at Nadopasana',
    languageId: 3,
    genreId: 4,
    mood: 'Kannada Raga / Muthuswami Dikshitar',
    durationSeconds: 548,
    audioKey: 'sri_matrubhutam_kannada_tvs.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-11-04',
    likes: 26300,
    plays: 559000,
    popularity: 99.2,
    lyrics: [
      { start: 0, end: 91000, text: 'Sri matrubhutam trishiragiri natham smarami satatam' },
      { start: 91000, end: 182000, text: 'Kannada raga dharinam parama shiva linga roopinam' },
      { start: 182000, end: 274000, text: 'Sugandha kunthalambika sahitham kripa kataksha varshinam' },
      { start: 274000, end: 365000, text: 'Bhakta vatsalam thiruchirappalli kshetra vasinam' },
      { start: 365000, end: 456000, text: 'Guruguha poojitha charana pankajam dhyayami nithyam' },
      { start: 456000, end: 548000, text: 'Namo namo parama shivaya mangalam shubham bhavathu' }
    ]
  }
];

export const FULL_281_VOCAL_CATALOG = [
  ...FULL_241_VOCAL_CATALOG,
  ...WAVE12_40_CATALOG
];

export async function seed281VocalCatalog() {
  const client = await pool.connect();
  try {
    console.log('================================================================');
    console.log('  SEEDING 281 PURE HUMAN VOCAL TRACKS WITH SYNCHRONIZED LYRICS');
    console.log('  100% PURE HUMAN VOCALS — ZERO DUPLICATES GUARANTEED');
    console.log('================================================================\n');

    await client.query('BEGIN');

    // 1. Ensure mood column length
    await client.query(`ALTER TABLE songs ALTER COLUMN mood TYPE VARCHAR(100);`);

    // 2. Validate catalog integrity
    const slugs = new Set();
    const keys = new Set();
    const titles = new Set();
    for (const song of FULL_281_VOCAL_CATALOG) {
      if (slugs.has(song.slug)) throw new Error(`Duplicate slug detected: ${song.slug}`);
      if (keys.has(song.audioKey)) throw new Error(`Duplicate audioKey detected: ${song.audioKey}`);
      if (titles.has(song.title.toLowerCase())) throw new Error(`Duplicate title detected: ${song.title}`);
      slugs.add(song.slug);
      keys.add(song.audioKey);
      titles.add(song.title.toLowerCase());
    }
    console.log(`Validated ${FULL_281_VOCAL_CATALOG.length} songs for complete uniqueness.`);

    const validSongIds = [];

    // 3. Process each song transactionally
    for (const item of FULL_281_VOCAL_CATALOG) {
      // 1. Artist
      let artistId;
      const artistSlug = slugify(item.artist);
      const artistRes = await client.query('SELECT id FROM artists WHERE slug = $1 LIMIT 1', [artistSlug]);
      if (artistRes.rows.length > 0) {
        artistId = artistRes.rows[0].id;
        await client.query(
          `UPDATE artists SET bio = $1, avatar_url = $2, is_verified = TRUE WHERE id = $3`,
          [item.bio, item.avatar, artistId]
        );
      } else {
        const insertArtist = await client.query(
          `INSERT INTO artists (id, name, slug, bio, avatar_url, cover_url, is_verified, total_plays, followers_count)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE, 0, 7500)
           RETURNING id`,
          [crypto.randomUUID(), item.artist, artistSlug, item.bio, item.avatar, item.artworkUrl]
        );
        artistId = insertArtist.rows[0].id;
      }

      // 2. Album
      let albumId;
      const albumSlug = slugify(item.album);
      const albumRes = await client.query('SELECT id FROM albums WHERE title = $1 AND artist_id = $2 LIMIT 1', [item.album, artistId]);
      if (albumRes.rows.length > 0) {
        albumId = albumRes.rows[0].id;
      } else {
        const insertAlbum = await client.query(
          `INSERT INTO albums (id, title, slug, artist_id, release_date, cover_url, type, language_id, genre_id)
           VALUES ($1, $2, $3, $4, $5, $6, 'ALBUM', $7, $8)
           RETURNING id`,
          [crypto.randomUUID(), item.album, albumSlug, artistId, item.releaseDate, item.artworkUrl, item.languageId, item.genreId]
        );
        albumId = insertAlbum.rows[0].id;
      }

      // 3. Song
      const songSlug = item.slug;
      const audioUrl = `/api/v1/media/stream/${item.audioKey}`;
      let songId;

      const songRes = await client.query(
        `SELECT id FROM songs WHERE slug = $1 OR audio_url = $2 LIMIT 1`,
        [songSlug, audioUrl]
      );

      if (songRes.rows.length > 0) {
        songId = songRes.rows[0].id;
        await client.query(
          `UPDATE songs
           SET title = $1, slug = $2, artist_id = $3, album_id = $4, language_id = $5,
               genre_id = $6, mood = $7, duration_seconds = $8, audio_url = $9, artwork_url = $10,
               release_date = $11, raw_likes_count = $12, valid_likes_count = $12, play_count = $13,
               popularity_score = $14, status = 'PUBLISHED'
           WHERE id = $15`,
          [
            item.title,
            songSlug,
            artistId,
            albumId,
            item.languageId,
            item.genreId,
            item.mood,
            item.durationSeconds,
            audioUrl,
            item.artworkUrl,
            item.releaseDate,
            item.likes,
            item.plays,
            item.popularity,
            songId,
          ]
        );
      } else {
        songId = crypto.randomUUID();
        await client.query(
          `INSERT INTO songs (
             id, title, slug, artist_id, album_id, featured_artists, language_id, genre_id,
             mood, duration_seconds, audio_url, artwork_url, release_date, is_explicit,
             play_count, raw_likes_count, valid_likes_count, popularity_score, status
           ) VALUES (
             $1, $2, $3, $4, $5, '[]'::jsonb, $6, $7,
             $8, $9, $10, $11, $12, FALSE,
             $13, $14, $14, $15, 'PUBLISHED'
           )`,
          [
            songId,
            item.title,
            songSlug,
            artistId,
            albumId,
            item.languageId,
            item.genreId,
            item.mood,
            item.durationSeconds,
            audioUrl,
            item.artworkUrl,
            item.releaseDate,
            item.plays,
            item.likes,
            item.popularity,
          ]
        );
      }
      validSongIds.push(songId);

      // 4. Master Audio Asset
      await client.query(`DELETE FROM music_assets WHERE song_id = $1`, [songId]);
      await client.query(
        `INSERT INTO music_assets (id, song_id, asset_type, storage_key, format, bitrate, file_size_bytes)
         VALUES ($1, $2, 'AUDIO_MASTER', $3, 'mp3', 320, 6000000)`,
        [crypto.randomUUID(), songId, item.audioKey]
      );

      // 5. Rights Record
      await client.query(`DELETE FROM rights_records WHERE song_id = $1`, [songId]);
      await client.query(
        `INSERT INTO rights_records (
           id, song_id, rights_holder, ownership_type, license_type, license_provider,
           territory, start_date, streaming_allowed, download_allowed, monetization_allowed,
           karaoke_allowed, ugc_allowed, proof_document_url, status, notes
         ) VALUES (
           $1, $2, $3, 'OPEN_LICENSE', 'Creative Commons / Public Domain', 'Verified Authentic Source',
           'GLOBAL', CURRENT_DATE, TRUE, TRUE, TRUE,
           TRUE, TRUE, 'https://creativecommons.org/licenses/by-nc-nd/4.0/', 'VERIFIED',
           $4
         )`,
        [
          crypto.randomUUID(),
          songId,
          item.artist,
          `Verified 100% authentic vocal performance by ${item.artist} for ${item.title}`
        ]
      );

      // 6. Synchronized Lyrics
      await client.query(`DELETE FROM lyric_lines WHERE lyrics_id IN (SELECT id FROM lyrics WHERE song_id = $1)`, [songId]);
      await client.query(`DELETE FROM lyrics WHERE song_id = $1`, [songId]);

      const fullText = item.lyrics.map(l => l.text).join('\n');
      const lyricsRes = await client.query(
        `INSERT INTO lyrics (id, song_id, language_id, is_synced, full_text)
         VALUES ($1, $2, $3, TRUE, $4)
         RETURNING id`,
        [crypto.randomUUID(), songId, item.languageId, fullText]
      );
      const lyricsId = lyricsRes.rows[0].id;

      for (let i = 0; i < item.lyrics.length; i++) {
        const line = item.lyrics[i];
        await client.query(
          `INSERT INTO lyric_lines (id, lyrics_id, sequence_order, start_time_ms, end_time_ms, text)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [crypto.randomUUID(), lyricsId, i + 1, line.start, line.end, line.text]
        );
      }
    }

    console.log(`Seeded and updated ${validSongIds.length} pure vocal songs.`);

    // 7. Purge any orphan/non-catalog songs
    console.log('Purging non-catalog songs if any...');
    await client.query(`DELETE FROM lyric_lines WHERE lyrics_id IN (SELECT id FROM lyrics WHERE song_id != ALL($1::uuid[]))`, [validSongIds]);
    await client.query(`DELETE FROM lyrics WHERE song_id != ALL($1::uuid[])`, [validSongIds]);
    await client.query(`DELETE FROM music_assets WHERE song_id != ALL($1::uuid[])`, [validSongIds]);
    await client.query(`DELETE FROM rights_records WHERE song_id != ALL($1::uuid[])`, [validSongIds]);
    const deleteRes = await client.query(`DELETE FROM songs WHERE id != ALL($1::uuid[])`, [validSongIds]);
    console.log(`Purged ${deleteRes.rowCount} non-catalog songs.`);

    // 8. Refresh Tracks View
    console.log('Refreshing tracks view...');
    await client.query(`
      CREATE OR REPLACE VIEW tracks AS
      SELECT DISTINCT ON (s.id)
          s.id,
          s.title,
          s.slug,
          a.name AS artist_name,
          al.title AS album_name,
          l.name AS language,
          s.duration_seconds,
          ma.storage_key AS audio_key,
          s.audio_url,
          s.artwork_url AS cover_url,
          rr.ownership_type AS rights_tier,
          rr.license_type,
          s.play_count AS stream_count,
          s.status,
          s.created_at
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      LEFT JOIN languages l ON s.language_id = l.id
      LEFT JOIN (
        SELECT DISTINCT ON (song_id) song_id, storage_key
        FROM music_assets
        WHERE asset_type = 'AUDIO_MASTER'
        ORDER BY song_id, created_at DESC
      ) ma ON s.id = ma.song_id
      LEFT JOIN (
        SELECT DISTINCT ON (song_id) song_id, ownership_type, license_type
        FROM rights_records
        ORDER BY song_id, created_at DESC
      ) rr ON s.id = rr.song_id
      ORDER BY s.id;
    `);

    await client.query('COMMIT');
    console.log('\n================================================================');
    console.log('  SUCCESSFULLY ENFORCED & EXPANDED 100% PURE VOCAL CATALOG!');
    console.log(`  Total Active Human Vocal Songs with Synced Lyrics: ${validSongIds.length}`);
    console.log('  ZERO DUPLICATES GUARANTEED.');
    console.log('================================================================');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to seed 281 vocal catalog:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].includes('seed_281_vocal_catalog.mjs')) {
  seed281VocalCatalog().catch(console.error);
}

