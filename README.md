# Talent5 (టాలెంట్5 / ট্যালেন্ট৫ / ಟ್ಯಾಲೆಂಟ್5) 🎵
> **Real Voices. Original Stories. Desi Talent.**  
> *The next-generation streaming & creator empowerment platform for authentic Indian regional vocal music.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🌟 Overview

**Talent5** is an Indian regional music streaming and artist monetization ecosystem built from the ground up to champion authentic, independent vocalists. Unlike traditional streaming platforms flooded with synthetic loops or algorithmic noise, Talent5 is curated strictly for **100% pure human vocal performances**, complete with full-length synchronized lyrics, transparent rights clearance, and gamified regional competitions.

---

## ✨ Key Features

### 🎙️ Curated Pure Human Vocal Catalog
- **281 Authenticated Master Tracks**: Zero AI hallucinations, zero synthetic karaoke tracks, and zero instrumental filler.
- **9 Indian Regional Languages**: Extensive repertoire across **Kannada, Bengali, Tamil, Telugu, Gujarati, Hindi, Punjabi, Malayalam, and Marathi**.
- **Classical & Devotional Heritage**: Purandara Dasa kritis, Rabindra Sangeet, Annamacharya kirtanas, Andal Tiruppavai, Meera bhajans, Sufi kalams, and Marathi Abhangs alongside contemporary indie singles.

### 📜 Real-Time Synchronized Lyrics Engine
- **Full-Song Verse-by-Verse Coverage**: Every track features complete, granular lyrics (Pallavi, Anupallavi, Charanam, Chorus, Bridge, and Outro) pacing naturally every 6–12 seconds.
- **Romanized English Transliteration**: Non-Latin regional scripts are systematically transliterated into standardized Romanized English for seamless cross-cultural accessibility.
- **Interactive Click-to-Seek**: Tap any lyric line in the drawer to instantly jump playback to that exact timestamp.
- **Smooth Auto-Centering**: Continuous auto-scrolling with glow indicators highlights the currently active vocal line.

### 🎛️ Creative Audio Experiences
- **Vinyl Turntable Showcase**: Realistic 33/45 RPM turntable physics with tonearm motion, needle drop, and vinyl spin animations.
- **Sound Mandala Visualizer**: Real-time frequency-reactive Sacred Geometry visualizer rendering dynamic harmonic resonance.

### ⚖️ Fair Rights & Transparent Royalties
- **Artist-First Revenue Splits**: Direct creator contracting, auditable stream attribution, and verified rights clearance.
- **Anti-Fraud Telemetry**: Built-in detection for artificial stream inflation, bot voting rings, and suspicious playback spikes.

### 🏆 Regional Competitions & Creator Studio
- **Talent Discovery Tournaments**: Regional contests where independent vocalists submit original recordings and win community backing.
- **Creator Studio Cockpit**: Track uploads, metadata tagging, royalty dashboards, and live performance metrics.
- **Admin Moderation Portal**: Multi-tier moderation dashboard with rights verification and catalog curation controls.

---

## 🏗️ Architecture & Monorepo Structure

Talent5 is built as an npm monorepo with clean separation of concerns between applications, shared component libraries, and infrastructure:

```
Talent5/
├── apps/
│   └── web/                     # Next.js 14 App Router full-stack web application
│       ├── public/media/        # Verified audio masters and high-res cover art
│       └── src/
│           ├── app/             # App router pages (streaming, player, creator, admin)
│           ├── components/      # UI components (LyricsDrawer, Player, Visualizers)
│           ├── context/         # AudioContext & global state providers
│           └── lib/             # Database client, auth, anti-fraud, and streaming utilities
├── packages/
│   ├── types/                   # Shared TypeScript models (Song, User, Lyrics, Rights)
│   ├── ui/                      # Modular design system & reusable UI components
│   └── utils/                   # Formatting, date helpers, audio maths, and validations
├── infrastructure/
│   ├── database/                # PostgreSQL relational schema and initial migrations
│   └── nginx/                   # High-performance reverse proxy & SSL configuration
└── scripts/                     # Automated data ingestion, audio curation, and test runners
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript 5.6](https://www.typescriptlang.org/) |
| **Styling** | [TailwindCSS 3.4](https://tailwindcss.com/), Glassmorphism, CSS Custom Properties |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/), Canvas 2D API |
| **State & Audio** | Custom React Context (`AudioContext`) with HTML5 Audio API & Web Audio API |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) with `pg` connection pooling |
| **Authentication** | Secure JWT with `bcryptjs` password hashing & role-based middleware |
| **Reverse Proxy** | [Nginx](https://nginx.org/) with gzip compression and caching headers |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or higher (`v20+` recommended)
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: `v15` or `v16` running locally or accessible via network

---

### 1. Clone the Repository
```bash
git clone https://github.com/poojitha-k-dev/Talent5.git
cd Talent5
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/talent5_v1"
JWT_SECRET="your-super-secret-jwt-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PORT=3000
```

### 4. Initialize & Seed Database
```bash
# Initialize schema and baseline tables
npm run db:init

# Ingest full authentic catalog with synchronized lyrics
node scripts/seed_281_vocal_catalog.mjs
```

### 5. Launch the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience Talent5.

---

## 🧪 Testing & Catalog Auditing

Talent5 includes an automated test suite verifying all end-to-end user journeys and catalog integrity:

```bash
# Run comprehensive E2E test suite (Auth, Streaming, Rights, Tournaments)
node scripts/test_e2e_features.mjs

# Audit all 281 pure vocal tracks for 0 duplicates, valid media, and complete lyrics
node scripts/verify_full_song_lyrics.mjs
```

---

## 📊 Regional Language Catalog Breakdown

| Language | Songs Active | Primary Traditions & Genres |
|---|:---:|---|
| **Kannada** | 59 | Haridasa Sahitya, Purandara Dasa, Kanaka Dasa, Sugama Sangeetha |
| **Bengali** | 46 | Rabindra Sangeet, Nazrul Geeti, Atul Prasad, Baul Folk |
| **Tamil** | 36 | Carnatic Kritis, Tiruppavai, Bharatiyar Songs, Classical Masters |
| **Telugu** | 35 | Annamacharya Sankeertanalu, Tyagaraja Kritis, Bhadrachala Ramadasu |
| **Gujarati** | 32 | Sugam Sangeet, Narsinh Mehta Pads, Gangasati Bhajans, Traditional Garba |
| **Hindi** | 25 | Sant Kabir Dohas, Mirabai Bhajans, Classical Bandishes, Ghazals |
| **Punjabi** | 24 | Gurbani Shabads, Bulleh Shah Sufi Kalams, Waris Shah Folk |
| **Malayalam** | 13 | Swathi Thirunal Compositions, Sopana Sangeetham, Irayimman Thampi |
| **Marathi** | 11 | Sant Tukaram Abhangs, Dnyaneshwari, Natyageet, Bhavgeet |
| **Total** | **281** | **100% Pure Human Vocals & Complete Synced Lyrics** |

---

## 📜 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/catalog` | Fetch curated catalog with language, genre, and trending filters |
| `GET` | `/api/v1/catalog/:id` | Fetch track details, artist metadata, and audio stream key |
| `GET` | `/api/v1/lyrics/:songId` | Fetch full song lyrics with timed synchronized line sequences |
| `POST` | `/api/v1/auth/login` | Authenticate user or creator with JWT issuance |
| `POST` | `/api/v1/auth/register` | Register new user or creator account |
| `GET` | `/api/v1/competitions` | List active regional vocal tournaments and leaderboards |
| `POST` | `/api/v1/competitions/vote` | Cast vote with anti-fraud duplicate IP and rate check |
| `GET` | `/api/v1/admin/stats` | Moderator overview of active songs, users, and rights claims |

---

## 🤝 Contributing

Contributions from artists, developers, and musicologists are welcome!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Crafted with passion for authentic Indian vocal music. Powered by <b>Talent5</b>.</sub>
</div>
