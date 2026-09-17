import pg from 'pg';
import crypto from 'crypto';

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

// 40+ Rich songs covering all 13 Indian Languages
export const MULTILINGUAL_SONGS = [
  // ─── 1. TELUGU (te - id: 2) ───
  {
    title: 'Brochevarevarura',
    slug: 'brochevarevarura',
    artist: 'Arun Chillara',
    languageId: 2, // Telugu
    genreId: 4, // Carnatic Classical
    mood: 'Classical / Devotional',
    durationSeconds: 257,
    audioUrl: '/api/v1/media/stream/brochevarevarura.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    releaseDate: '2026-05-20',
    likes: 8150,
    plays: 198000,
    popularity: 95,
  },
  {
    title: 'Samajavaragamana',
    slug: 'samajavaragamana',
    artist: 'Ananya Rao',
    languageId: 2, // Telugu
    genreId: 7, // Telugu Melody
    mood: 'Soulful Carnatic Fusion',
    durationSeconds: 285,
    audioUrl: '/api/v1/media/stream/jamendo_2162882.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-06-10',
    likes: 12400,
    plays: 245000,
    popularity: 98,
  },
  {
    title: 'Neeve Naa Praanam',
    slug: 'neeve-naa-praanam',
    artist: 'Ananya Rao',
    languageId: 2, // Telugu
    genreId: 7, // Telugu Melody
    mood: 'Romantic Acoustic Melody',
    durationSeconds: 242,
    audioUrl: '/api/v1/media/stream/jamendo_1182292.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-07-02',
    likes: 9850,
    plays: 182000,
    popularity: 92,
  },
  {
    title: 'Deccan Grooves',
    slug: 'deccan-grooves',
    artist: 'Karthik Raja',
    languageId: 2, // Telugu
    genreId: 6, // Folk Fusion
    mood: 'High Energy Telugu Folk',
    durationSeconds: 215,
    audioUrl: '/api/v1/media/stream/jamendo_1319970.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-07-15',
    likes: 7420,
    plays: 156000,
    popularity: 89,
  },
  {
    title: 'Vennela Chirunavvu',
    slug: 'vennela-chirunavvu',
    artist: 'Arun Chillara',
    languageId: 2, // Telugu
    genreId: 10, // Acoustic & Unplugged
    mood: 'Meditative Night Raga',
    durationSeconds: 268,
    audioUrl: '/api/v1/media/stream/jamendo_1319971.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800',
    releaseDate: '2026-08-01',
    likes: 8900,
    plays: 167000,
    popularity: 91,
  },

  // ─── 2. TAMIL (ta - id: 3) ───
  {
    title: 'Kadhale Kadhale',
    slug: 'kadhale-kadhale',
    artist: 'Karthik Raja',
    languageId: 3, // Tamil
    genreId: 8, // Tamil Indie
    mood: 'Madras Acoustic Love',
    durationSeconds: 275,
    audioUrl: '/api/v1/media/stream/jamendo_1593988.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-06-01',
    likes: 14200,
    plays: 289000,
    popularity: 97,
  },
  {
    title: 'Aazhi Soozhndha',
    slug: 'aazhi-soozhndha',
    artist: 'Meera Swaminathan',
    languageId: 3, // Tamil
    genreId: 4, // Carnatic Classical
    mood: 'Carnatic Ocean Waves',
    durationSeconds: 295,
    audioUrl: '/api/v1/media/stream/jamendo_1871840.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    releaseDate: '2026-06-18',
    likes: 11100,
    plays: 210000,
    popularity: 94,
  },
  {
    title: 'Madras Street Pulse',
    slug: 'madras-street-pulse',
    artist: 'Karthik Raja',
    languageId: 3, // Tamil
    genreId: 1, // Desi Hip-Hop
    mood: 'Raw Street Beats',
    durationSeconds: 204,
    audioUrl: '/api/v1/media/stream/jamendo_1999390.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    releaseDate: '2026-07-20',
    likes: 10500,
    plays: 230000,
    popularity: 93,
  },

  // ─── 3. KANNADA (kn - id: 4) ───
  {
    title: 'Beladingala Rathri',
    slug: 'beladingala-rathri',
    artist: 'Sanjay Murthy',
    languageId: 4, // Kannada
    genreId: 10, // Acoustic & Unplugged
    mood: 'Moonlit Romantic Ballad',
    durationSeconds: 260,
    audioUrl: '/api/v1/media/stream/jamendo_2329587.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    releaseDate: '2026-05-12',
    likes: 8700,
    plays: 175000,
    popularity: 90,
  },
  {
    title: 'Kaveri Theerada',
    slug: 'kaveri-theerada',
    artist: 'Sanjay Murthy',
    languageId: 4, // Kannada
    genreId: 6, // Folk Fusion
    mood: 'Riverside Folk Melodies',
    durationSeconds: 238,
    audioUrl: '/api/v1/media/stream/jamendo_2329593.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-06-28',
    likes: 9300,
    plays: 188000,
    popularity: 92,
  },

  // ─── 4. MALAYALAM (ml - id: 5) ───
  {
    title: 'Malare Ninne',
    slug: 'malare-ninne',
    artist: 'Harish Nair',
    languageId: 5, // Malayalam
    genreId: 10, // Acoustic & Unplugged
    mood: 'Kerala Rain Acoustic',
    durationSeconds: 310,
    audioUrl: '/api/v1/media/stream/jamendo_2333332.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-06-05',
    likes: 13500,
    plays: 265000,
    popularity: 96,
  },
  {
    title: 'Aaromaley Soul',
    slug: 'aaromaley-soul',
    artist: 'Harish Nair',
    languageId: 5, // Malayalam
    genreId: 3, // Sufi & Ghazal
    mood: 'Backwater Twilight Hymn',
    durationSeconds: 280,
    audioUrl: '/api/v1/media/stream/jamendo_311428.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    releaseDate: '2026-07-10',
    likes: 10200,
    plays: 198000,
    popularity: 92,
  },

  // ─── 5. MARATHI (mr - id: 6) ───
  {
    title: 'Man Udhan Varyache',
    slug: 'man-udhan-varyache',
    artist: 'Rohan Deshmukh',
    languageId: 6, // Marathi
    genreId: 6, // Folk Fusion
    mood: 'Monsoon Wind Folk',
    durationSeconds: 265,
    audioUrl: '/api/v1/media/stream/jamendo_379155.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800',
    releaseDate: '2026-05-30',
    likes: 11800,
    plays: 235000,
    popularity: 94,
  },
  {
    title: 'Gondhal Rhythms',
    slug: 'gondhal-rhythms',
    artist: 'Rohan Deshmukh',
    languageId: 6, // Marathi
    genreId: 1, // Desi Hip-Hop
    mood: 'Traditional Sambal Beats',
    durationSeconds: 220,
    audioUrl: '/api/v1/media/stream/jamendo_593975.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    releaseDate: '2026-07-05',
    likes: 9100,
    plays: 178000,
    popularity: 89,
  },

  // ─── 6. BENGALI (bn - id: 7) ───
  {
    title: 'Bhorer Alo',
    slug: 'bhorer-alo',
    artist: 'Suhasini Roy',
    languageId: 7, // Bengali
    genreId: 6, // Folk Fusion
    mood: 'Serene Baul Morning',
    durationSeconds: 228,
    audioUrl: '/api/v1/media/stream/jamendo_689398.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-02-25',
    likes: 12100,
    plays: 242000,
    popularity: 95,
  },
  {
    title: 'Majhe Majhe Tobo',
    slug: 'majhe-majhe-tobo',
    artist: 'Debojit Das',
    languageId: 7, // Bengali
    genreId: 10, // Acoustic & Unplugged
    mood: 'Rabindra Sangeet Acoustic',
    durationSeconds: 290,
    audioUrl: '/api/v1/media/stream/jamendo_763970.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-06-15',
    likes: 10800,
    plays: 215000,
    popularity: 93,
  },

  // ─── 7. PUNJABI (pa - id: 8) ───
  {
    title: 'Aa Mahiya',
    slug: 'aa-mahiya',
    artist: 'Irfan Iqbal',
    languageId: 8, // Punjabi
    genreId: 5, // Punjabi Beats
    mood: 'Romantic Punjabi / Dholak',
    durationSeconds: 428,
    audioUrl: '/api/v1/media/stream/aa_mahiya.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    releaseDate: '2026-06-25',
    likes: 9240,
    plays: 231000,
    popularity: 96,
  },
  {
    title: 'Bhola Vaid Na Janayi',
    slug: 'bhola-vaid-na-janayi',
    artist: 'Padamshri Bhai Nirmal Singh Ji Khalsa',
    languageId: 8, // Punjabi
    genreId: 3, // Sufi & Ghazal
    mood: 'Spiritual Sufi Shabad',
    durationSeconds: 529,
    audioUrl: '/api/v1/media/stream/bhola_vaid.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-06-10',
    likes: 12500,
    plays: 310000,
    popularity: 98,
  },
  {
    title: 'Bambookat',
    slug: 'bambookat',
    artist: 'Hasanpreet Mehma',
    languageId: 8, // Punjabi
    genreId: 5, // Punjabi Beats
    mood: 'High Energy Bhangra Groove',
    durationSeconds: 190,
    audioUrl: '/api/v1/media/stream/bambookat.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    releaseDate: '2026-07-01',
    likes: 7400,
    plays: 185000,
    popularity: 88,
  },
  {
    title: 'Pind Di Beat',
    slug: 'pind-di-beat',
    artist: 'DJ Shera',
    languageId: 8, // Punjabi
    genreId: 5, // Punjabi Beats
    mood: 'Thumping Folk-Drill',
    durationSeconds: 182,
    audioUrl: '/api/v1/media/stream/jamendo_1041239.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    releaseDate: '2026-03-01',
    likes: 15400,
    plays: 340000,
    popularity: 99,
  },

  // ─── 8. GUJARATI (gu - id: 9) ───
  {
    title: 'Bhakti Bhavna Kirtan',
    slug: 'bhakti-bhavna-kirtan',
    artist: 'DadaBhagwan Foundation',
    languageId: 9, // Gujarati
    genreId: 3, // Sufi & Ghazal
    mood: 'Devotional Gujarati Kirtan',
    durationSeconds: 318,
    audioUrl: '/api/v1/media/stream/bhakti_bhavna.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800',
    releaseDate: '2026-06-15',
    likes: 5400,
    plays: 112000,
    popularity: 85,
  },
  {
    title: 'Hraday Sitar',
    slug: 'hraday-sitar',
    artist: 'DadaBhagwan Foundation',
    languageId: 9, // Gujarati
    genreId: 9, // Hindustani Classical
    mood: 'Soulful Instrumental Sitar',
    durationSeconds: 398,
    audioUrl: '/api/v1/media/stream/hraday_sitar.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    releaseDate: '2026-06-20',
    likes: 6200,
    plays: 134000,
    popularity: 87,
  },
  {
    title: 'Mor Bani Thanghat Kare',
    slug: 'mor-bani-thanghat-kare',
    artist: 'DadaBhagwan Foundation',
    languageId: 9, // Gujarati
    genreId: 6, // Folk Fusion
    mood: 'Festive Garba Folk',
    durationSeconds: 245,
    audioUrl: '/api/v1/media/stream/jamendo_2162882.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-07-12',
    likes: 7800,
    plays: 160000,
    popularity: 89,
  },

  // ─── 9. ODIA (or - id: 10) ───
  {
    title: 'Rangabati Urban Beats',
    slug: 'rangabati-urban-beats',
    artist: 'Debojit Das',
    languageId: 10, // Odia
    genreId: 6, // Folk Fusion
    mood: 'Sambalpuri Folk Rhythm',
    durationSeconds: 230,
    audioUrl: '/api/v1/media/stream/jamendo_1182292.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-05-18',
    likes: 6800,
    plays: 145000,
    popularity: 86,
  },
  {
    title: 'Kalia Mo Suna',
    slug: 'kalia-mo-suna',
    artist: 'Debojit Das',
    languageId: 10, // Odia
    genreId: 4, // Carnatic/Odissi Classical
    mood: 'Devotional Raga',
    durationSeconds: 275,
    audioUrl: '/api/v1/media/stream/jamendo_1319970.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-07-08',
    likes: 5900,
    plays: 120000,
    popularity: 84,
  },

  // ─── 10. ASSAMESE (as - id: 11) ───
  {
    title: 'Bihu Re Bihu',
    slug: 'bihu-re-bihu',
    artist: 'Debojit Das',
    languageId: 11, // Assamese
    genreId: 6, // Folk Fusion
    mood: 'Brahmaputra Bihu Beats',
    durationSeconds: 215,
    audioUrl: '/api/v1/media/stream/jamendo_1319971.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-04-14',
    likes: 8300,
    plays: 162000,
    popularity: 88,
  },
  {
    title: 'Luitporia Melody',
    slug: 'luitporia-melody',
    artist: 'Debojit Das',
    languageId: 11, // Assamese
    genreId: 10, // Acoustic & Unplugged
    mood: 'Acoustic River Folk',
    durationSeconds: 250,
    audioUrl: '/api/v1/media/stream/jamendo_1593988.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800',
    releaseDate: '2026-06-22',
    likes: 6400,
    plays: 130000,
    popularity: 85,
  },

  // ─── 11. URDU (ur - id: 12) ───
  {
    title: 'Afreen Sufi Soul',
    slug: 'afreen-sufi-soul',
    artist: 'Ustad Tariq Khan',
    languageId: 12, // Urdu
    genreId: 3, // Sufi & Ghazal
    mood: 'Soulful Qawwali / Harmonium',
    durationSeconds: 345,
    audioUrl: '/api/v1/media/stream/jamendo_1871840.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    releaseDate: '2026-05-15',
    likes: 13900,
    plays: 275000,
    popularity: 96,
  },
  {
    title: 'Chhaap Tilak',
    slug: 'chhaap-tilak',
    artist: 'Ustad Tariq Khan',
    languageId: 12, // Urdu
    genreId: 3, // Sufi & Ghazal
    mood: 'Amir Khusro Mystical Sufi',
    durationSeconds: 380,
    audioUrl: '/api/v1/media/stream/jamendo_1999390.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    releaseDate: '2026-06-30',
    likes: 12200,
    plays: 248000,
    popularity: 94,
  },

  // ─── 12. HINDI (hi - id: 1) ───
  {
    title: 'Ye Mausam',
    slug: 'ye-mausam',
    artist: 'Arun Chillara',
    languageId: 1, // Hindi
    genreId: 10, // Acoustic & Unplugged
    mood: 'Soulful / Acoustic Melody',
    durationSeconds: 323,
    audioUrl: '/api/v1/media/stream/ye_mausam.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-06-15',
    likes: 6420,
    plays: 142000,
    popularity: 88,
  },
  {
    title: 'Baarish',
    slug: 'baarish',
    artist: 'Arun Chillara',
    languageId: 1, // Hindi
    genreId: 3, // Sufi & Ghazal
    mood: 'Rain / Melancholy',
    durationSeconds: 232,
    audioUrl: '/api/v1/media/stream/baarish.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-07-08',
    likes: 5890,
    plays: 124000,
    popularity: 87,
  },
  {
    title: 'Dhuan',
    slug: 'dhuan',
    artist: 'Arun Chillara',
    languageId: 1, // Hindi
    genreId: 1, // Desi Hip-Hop
    mood: 'Introspective Street Rap',
    durationSeconds: 240,
    audioUrl: '/api/v1/media/stream/dhuan.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    releaseDate: '2026-05-10',
    likes: 7800,
    plays: 154000,
    popularity: 89,
  },
  {
    title: 'Jee Le Zara',
    slug: 'jee-le-zara',
    artist: 'Arun Chillara',
    languageId: 1, // Hindi
    genreId: 2, // Bollywood Pop
    mood: 'Uplifting Pop Ballad',
    durationSeconds: 204,
    audioUrl: '/api/v1/media/stream/jee_le_zara.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800',
    releaseDate: '2026-04-18',
    likes: 8200,
    plays: 172000,
    popularity: 90,
  },
  {
    title: 'Flying High',
    slug: 'flying-high',
    artist: 'Arun Chillara',
    languageId: 1, // Hindi
    genreId: 2, // Bollywood Pop
    mood: 'Energetic Indie Vibe',
    durationSeconds: 200,
    audioUrl: '/api/v1/media/stream/flying_high.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    releaseDate: '2026-03-25',
    likes: 6700,
    plays: 139000,
    popularity: 86,
  },
  {
    title: 'Dil Me Chupi',
    slug: 'dil-me-chupi',
    artist: 'Kontraa',
    languageId: 1, // Hindi
    genreId: 2, // Bollywood Pop
    mood: 'Electro Indie Pop',
    durationSeconds: 291,
    audioUrl: '/api/v1/media/stream/dil_me_chupi.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    releaseDate: '2026-06-20',
    likes: 8900,
    plays: 182000,
    popularity: 91,
  },
  {
    title: 'Deep Love',
    slug: 'deep-love',
    artist: 'Kontraa',
    languageId: 1, // Hindi
    genreId: 2, // Bollywood Pop
    mood: 'Deep House Romantic Fusion',
    durationSeconds: 243,
    audioUrl: '/api/v1/media/stream/deep_love.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    releaseDate: '2026-07-01',
    likes: 7600,
    plays: 158000,
    popularity: 88,
  },
  {
    title: 'Baras Jaye',
    slug: 'baras-jaye',
    artist: 'Kontraa',
    languageId: 1, // Hindi
    genreId: 3, // Sufi & Ghazal
    mood: 'Soothing Acoustic Rainy Day',
    durationSeconds: 241,
    audioUrl: '/api/v1/media/stream/baras_jaye.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    releaseDate: '2026-07-15',
    likes: 7100,
    plays: 146000,
    popularity: 87,
  },
  {
    title: 'Hum He Sitare',
    slug: 'hum-he-sitare',
    artist: 'DadaBhagwan Foundation',
    languageId: 1, // Hindi
    genreId: 2, // Bollywood Pop
    mood: 'Inspirational Community Anthem',
    durationSeconds: 266,
    audioUrl: '/api/v1/media/stream/hum_he_sitare.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    releaseDate: '2026-05-01',
    likes: 9500,
    plays: 195000,
    popularity: 92,
  },
  {
    title: 'Desi-Hum',
    slug: 'desi-hum',
    artist: 'Sohil',
    languageId: 1, // Hindi
    genreId: 1, // Desi Hip-Hop
    mood: 'Street Hip-Hop Fusion',
    durationSeconds: 208,
    audioUrl: '/api/v1/media/stream/desi_hum.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    releaseDate: '2026-06-12',
    likes: 8400,
    plays: 174000,
    popularity: 89,
  },
  {
    title: 'Tum Bin Mann Kaha',
    slug: 'tum-bin-mann-kaha',
    artist: 'Kabir Sen',
    languageId: 1, // Hindi
    genreId: 3, // Sufi & Ghazal
    mood: 'Romantic / Soulful',
    durationSeconds: 214,
    audioUrl: '/api/v1/media/stream/jamendo_2329587.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800',
    releaseDate: '2026-01-15',
    likes: 13120,
    plays: 242100,
    popularity: 95,
  },

  // ─── 13. ENGLISH (en - id: 13) ───
  {
    title: 'Monsoon Rain Acoustic',
    slug: 'monsoon-rain-acoustic',
    artist: 'Arun Chillara',
    languageId: 13, // English
    genreId: 10, // Acoustic & Unplugged
    mood: 'Soulful Indian English Ballad',
    durationSeconds: 270,
    audioUrl: '/api/v1/media/stream/jamendo_2329593.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    releaseDate: '2026-06-25',
    likes: 7900,
    plays: 165000,
    popularity: 89,
  },
  {
    title: 'Bombay Sunset Chill',
    slug: 'bombay-sunset-chill',
    artist: 'Ashay Raut',
    languageId: 13, // English
    genreId: 10, // Acoustic & Unplugged
    mood: 'Chillhop / Sitar Ambient',
    durationSeconds: 235,
    audioUrl: '/api/v1/media/stream/jamendo_2333332.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    releaseDate: '2026-07-10',
    likes: 8800,
    plays: 180000,
    popularity: 91,
  },
];

async function seedMultilingualCatalog() {
  const client = await pool.connect();
  console.log('Beginning Multilingual Catalog Seeding across 13 Indian Languages...\n');

  try {
    await client.query('BEGIN');

    // Cache artists to resolve or insert
    const artistCache = new Map();
    const existingArtists = await client.query('SELECT id, name FROM artists');
    for (const a of existingArtists.rows) {
      artistCache.set(a.name.toLowerCase().trim(), a.id);
    }

    // Cache albums or create default
    let defaultAlbumId = null;
    const albumRes = await client.query('SELECT id FROM albums LIMIT 1');
    if (albumRes.rows.length > 0) {
      defaultAlbumId = albumRes.rows[0].id;
    }

    let insertedCount = 0;
    let updatedCount = 0;

    for (const song of MULTILINGUAL_SONGS) {
      // 1. Resolve or create artist
      let artistId = artistCache.get(song.artist.toLowerCase().trim());
      if (!artistId) {
        artistId = crypto.randomUUID();
        const artistSlug = slugify(song.artist);
        await client.query(
          `INSERT INTO artists (id, name, slug, bio, avatar_url, cover_url, is_verified, total_plays, followers_count)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, $8)
           ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [
            artistId,
            song.artist,
            artistSlug,
            `Acclaimed Desi artist specializing in regional melodies, folk fusion and modern vocal production.`,
            song.artworkUrl,
            song.artworkUrl,
            song.plays * 2,
            Math.floor(song.likes * 1.5),
          ]
        );
        artistCache.set(song.artist.toLowerCase().trim(), artistId);
      }

      // 2. Check if song already exists by slug
      const existingSong = await client.query('SELECT id FROM songs WHERE slug = $1', [song.slug]);

      let songId;
      if (existingSong.rows.length > 0) {
        songId = existingSong.rows[0].id;
        await client.query(
          `UPDATE songs
           SET title = $1, artist_id = $2, language_id = $3, genre_id = $4,
               mood = $5, duration_seconds = $6, audio_url = $7, artwork_url = $8,
               popularity_score = $9, valid_likes_count = $10, play_count = $11,
               status = 'PUBLISHED'
           WHERE id = $12`,
          [
            song.title,
            artistId,
            song.languageId,
            song.genreId,
            song.mood,
            song.durationSeconds,
            song.audioUrl,
            song.artworkUrl,
            song.popularity,
            song.likes,
            song.plays,
            songId,
          ]
        );
        updatedCount++;
      } else {
        songId = crypto.randomUUID();
        await client.query(
          `INSERT INTO songs (
             id, title, slug, artist_id, album_id, language_id, genre_id,
             mood, duration_seconds, audio_url, artwork_url, release_date,
             is_explicit, play_count, raw_likes_count, valid_likes_count,
             popularity_score, status, featured_artists
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7,
             $8, $9, $10, $11, $12,
             FALSE, $13, $14, $15,
             $16, 'PUBLISHED', '[]'::jsonb
           )`,
          [
            songId,
            song.title,
            song.slug,
            artistId,
            defaultAlbumId,
            song.languageId,
            song.genreId,
            song.mood,
            song.durationSeconds,
            song.audioUrl,
            song.artworkUrl,
            song.releaseDate,
            song.plays,
            song.likes,
            song.likes,
            song.popularity,
          ]
        );
        insertedCount++;
      }

      // 3. Ensure Verified Rights Record exists
      const rightsCheck = await client.query('SELECT id FROM rights_records WHERE song_id = $1', [songId]);
      if (rightsCheck.rows.length === 0) {
        await client.query(
          `INSERT INTO rights_records (
             id, song_id, rights_holder, ownership_type, license_type, license_provider,
             territory, start_date, streaming_allowed, download_allowed, monetization_allowed,
             karaoke_allowed, ugc_allowed, proof_document_url, status, notes
           ) VALUES (
             $1, $2, $3, 'CREATOR_OWNED', 'Talent5 Verified Desi Master', 'Talent5 Direct Independent Creator Agreement',
             'GLOBAL', CURRENT_DATE, TRUE, TRUE, TRUE, TRUE, TRUE,
             'https://talent5.com/rights/verified', 'VERIFIED',
             $4
           )`,
          [
            crypto.randomUUID(),
            songId,
            song.artist,
            `100% verified original Desi master rights by ${song.artist}. Full publishing and streaming rights verified.`,
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`\n🎉 Multilingual Catalog Seeding Completed!`);
    console.log(`   - New songs inserted: ${insertedCount}`);
    console.log(`   - Existing songs updated: ${updatedCount}`);
    console.log(`   - Total catalog size: ${insertedCount + updatedCount} tracks\n`);

    // Distribution breakdown
    const dist = await client.query(`
      SELECT l.name as language, l.code, COUNT(s.id) as count
      FROM languages l
      LEFT JOIN songs s ON l.id = s.language_id
      GROUP BY l.id, l.name, l.code
      ORDER BY count DESC, l.id ASC
    `);
    console.log('Language Catalog Distribution:');
    console.table(dist.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedMultilingualCatalog();
