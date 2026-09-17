'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  ArrowRight,
  Volume2,
  Check,
  Music2,
  Mic2,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

/* ─────────────────────────────────────────────
   TYPE
───────────────────────────────────────────── */
interface TrackItem {
  id: string;
  title: string;
  artist: string;
  language: string;
  audioUrl: string;
  artworkUrl: string;
  durationSeconds: number;
}

/* ─────────────────────────────────────────────
   TRACKS — authentic vocal recordings
───────────────────────────────────────────── */
const TRACKS: TrackItem[] = [
  {
    id: '884de491-9f49-4726-8222-a89f6c6b03e2',
    title: 'Ye Mausam',
    artist: 'Arun Chillara',
    language: 'Hindi · Acoustic',
    audioUrl: '/api/v1/media/stream/ye_mausam.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    durationSeconds: 323,
  },
  {
    id: 'da14ca00-79ee-4a4f-bea0-2e27eee47e00',
    title: 'Brochevarevarura',
    artist: 'Arun Chillara',
    language: 'Telugu · Carnatic',
    audioUrl: '/api/v1/media/stream/brochevarevarura.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    durationSeconds: 257,
  },
  {
    id: '374b999c-5c33-4440-b8a6-dc67abfce4fd',
    title: 'Aa Mahiya',
    artist: 'Irfan Iqbal',
    language: 'Punjabi · Folk',
    audioUrl: '/api/v1/media/stream/aa_mahiya.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    durationSeconds: 428,
  },
  {
    id: 'fe1bf662-606a-4689-823b-42414c2f7e65',
    title: 'Baarish',
    artist: 'Arun Chillara',
    language: 'Hindi · Indie',
    audioUrl: '/api/v1/media/stream/baarish.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    durationSeconds: 301,
  },
  {
    id: 'fe284f1e-da41-44a8-8568-473aabda2b3d',
    title: 'Dhuan',
    artist: 'Arun Chillara',
    language: 'Hindi · Rock',
    audioUrl: '/api/v1/media/stream/dhuan.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    durationSeconds: 276,
  },
  {
    id: '94e01ac1-54ac-479b-9a35-60c62e1a43c8',
    title: 'Deep Love',
    artist: 'Kontraa',
    language: 'Hindi · R&B',
    audioUrl: '/api/v1/media/stream/deep_love.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    durationSeconds: 161,
  },
  {
    id: '1ed0e905-0b90-41ec-adc1-f182c9fe3d46',
    title: 'Baras Jaye',
    artist: 'Kontraa',
    language: 'Hindi · Pop',
    audioUrl: '/api/v1/media/stream/baras_jaye.mp3',
    artworkUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    durationSeconds: 160,
  },
];

/* ─────────────────────────────────────────────
   WAVEFORM — animated bars
───────────────────────────────────────────── */
const WAVE_HEIGHTS = [45, 80, 30, 90, 60, 40, 95, 70, 50, 85, 35, 75];

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[2px] h-3" aria-hidden>
      {WAVE_HEIGHTS.map((h, i) => (
        <span
          key={i}
          style={{
            height: active ? `${h}%` : '25%',
            animationDelay: active ? `${i * 0.07}s` : '0s',
          }}
          className={`w-[2px] rounded-full transition-all duration-300 ${
            active
              ? 'bg-amber-500 animate-wave-1'
              : 'bg-slate-300 dark:bg-white/20'
          }`}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function LandingPage() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const [isFollowing, setIsFollowing] = useState(false);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);

  /* helpers */
  const isCurrentPlaying = (url: string) =>
    currentSong?.audioUrl === url && isPlaying;

  const handlePlay = (track: TrackItem) => {
    if (currentSong?.audioUrl === track.audioUrl) {
      togglePlay();
    } else {
      playSong({
        id: track.id,
        title: track.title,
        artistName: track.artist,
        audioUrl: track.audioUrl,
        artworkUrl: track.artworkUrl,
        durationSeconds: track.durationSeconds,
      } as any);
    }
  };

  const featured = TRACKS[featuredIdx] ?? TRACKS[0];

  /* Ticker scroll — continuous loop via CSS animation */
  const tickerTracks = [...TRACKS.slice(0, 4), ...TRACKS.slice(0, 4)];

  return (
    <div className="relative landing-page-layer text-[var(--text-primary)] transition-colors duration-500 overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">

      {/* Background rendered by LandingBackground component in layout.tsx — only shows on / */}

      {/* All content sits above the background layer */}
      <div className="relative z-10">

      {/* ═══════════════════════════════════════════════════════════════
          CHAPTER 01 — EDITORIAL ASYMMETRIC HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-8 sm:pt-12 lg:pt-16 pb-0 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

          {/* ── LEFT: editorial headline ── */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left z-10">
            {/* eyebrow */}
            <div className="inline-flex items-center gap-2 mb-5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                aria-hidden
              />
              <span className="text-[10px] font-bold tracking-[0.32em] text-amber-400 uppercase">
                TALENT5 / MUSIC DISCOVERY
              </span>
            </div>

            {/* headline */}
            <h1 className="font-serif text-[3.4rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[5.8rem] font-normal tracking-[-0.02em] leading-[0.93] text-white mb-6">
              MUSIC
              <br />
              YOU HAVEN&apos;T
              <br />
              HEARD{' '}
              <span className="italic text-amber-500 underline decoration-amber-400/30 decoration-wavy underline-offset-8">
                YET.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 font-light leading-relaxed max-w-md mb-8">
              Discover original music, independent artists and voices from across India.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/music"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] tracking-widest uppercase transition-all shadow-md hover:-translate-y-0.5 active:scale-95"
              >
                EXPLORE MUSIC
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="#meet-voices"
                className="inline-flex items-center px-6 py-3.5 rounded-full border border-white/30 text-white hover:border-amber-400 hover:text-amber-400 font-medium text-[11px] tracking-widest uppercase transition-all"
              >
                MEET THE ARTISTS
              </Link>
            </div>
          </div>

          {/* ── RIGHT: editorial glass composition — no photo, lets bg breathe ── */}
          <div className="lg:col-span-6 relative mt-2 lg:mt-0">
            <div className="relative w-full max-w-lg mx-auto">

              {/* Main glass card — large */}
              <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/10 dark:border-white/8 shadow-2xl"
                style={{ background: 'rgba(10,10,16,0.42)', backdropFilter: 'blur(18px)' }}>

                {/* Top badge */}
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[0.28em] text-amber-400 uppercase">
                      Studio Session · Live
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40 tracking-wider">TALENT5</span>
                </div>

                {/* Big artist name display */}
                <div className="px-5 pb-2">
                  <p className="font-serif text-4xl sm:text-5xl text-white font-normal leading-tight tracking-tight">
                    Arun<br />Chillara
                  </p>
                  <p className="text-sm text-amber-400/90 font-medium mt-1">Hyderabad · Telugu Acoustic</p>
                </div>

                {/* Waveform visual */}
                <div className="px-5 py-4 flex items-end gap-[3px]">
                  {[22,40,28,55,38,65,30,58,44,70,32,60,48,36,68,26,52,42,62,34,50,44,58,30,66].map((h, i) => (
                    <div key={i} className="rounded-t-sm flex-1"
                      style={{
                        height: `${h}px`,
                        background: i % 3 === 0 ? 'rgba(245,158,11,0.75)' : i % 3 === 1 ? 'rgba(20,184,166,0.55)' : 'rgba(255,255,255,0.20)',
                        animation: `waveBars ${0.5 + (i % 5) * 0.15}s ease-in-out infinite`,
                        animationDelay: `${i * 0.06}s`,
                      }} />
                  ))}
                </div>

                {/* Now playing row */}
                <div className="mx-4 mb-4 rounded-2xl border border-amber-500/20 p-3 flex items-center gap-3"
                  style={{ background: 'rgba(245,158,11,0.08)' }}>
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={TRACKS[0].artworkUrl} alt={TRACKS[0].title} className="w-full h-full object-cover" />
                    {isCurrentPlaying(TRACKS[0].audioUrl) && (
                      <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                        <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{TRACKS[0].title}</p>
                    <p className="text-[11px] text-white/50 truncate">{TRACKS[0].artist} · {TRACKS[0].language}</p>
                    <Waveform active={isCurrentPlaying(TRACKS[0].audioUrl)} />
                  </div>
                  <button onClick={() => handlePlay(TRACKS[0])}
                    className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95"
                    aria-label={isCurrentPlaying(TRACKS[0].audioUrl) ? 'Pause' : 'Play Ye Mausam'}>
                    {isCurrentPlaying(TRACKS[0].audioUrl)
                      ? <Pause className="w-4 h-4 fill-slate-950" />
                      : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
                  </button>
                </div>
              </div>

              {/* Overlapping small track card — top-right stagger */}
              <div className="hidden sm:block absolute -top-4 -right-4 w-36 rounded-2xl overflow-hidden shadow-2xl border border-white/10 rotate-3 z-20 transition-transform duration-300 hover:rotate-0 cursor-pointer"
                style={{ background: 'rgba(10,10,16,0.55)', backdropFilter: 'blur(16px)' }}
                onClick={() => handlePlay(TRACKS[1])}>
                <div className="relative aspect-square overflow-hidden">
                  <img src={TRACKS[1].artworkUrl} alt={TRACKS[1].title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow">
                      {isCurrentPlaying(TRACKS[1].audioUrl)
                        ? <Pause className="w-3.5 h-3.5 fill-current" />
                        : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                    </div>
                  </div>
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-[10px] font-bold text-white truncate">{TRACKS[1].title}</p>
                  <p className="text-[9px] text-amber-400/80 truncate">{TRACKS[1].language}</p>
                </div>
              </div>

              {/* Language tag strip — bottom stagger */}
              <div className="absolute -bottom-3 left-4 right-4 flex flex-wrap gap-1.5 justify-center z-20">
                {['Hindi','Telugu','Punjabi','Tamil','Bengali'].map((lang) => (
                  <span key={lang}
                    className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                    style={{ background: 'rgba(10,10,16,0.70)', backdropFilter: 'blur(12px)', borderColor: 'rgba(245,158,11,0.25)', color: 'rgba(245,158,11,0.85)' }}>
                    {lang}
                  </span>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LISTENING NOW STRIP — zero gap below hero
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full mt-8 border-y border-white/10 py-3.5 px-4 sm:px-8"
        style={{ background: 'rgba(8,7,14,0.25)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-4 md:gap-6">
          {/* Label */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-[10px] font-bold tracking-[0.28em] text-amber-400 uppercase whitespace-nowrap">
              LISTENING NOW
            </span>
          </div>

          {/* Scrollable track buttons */}
          <div className="flex items-center gap-5 overflow-x-auto no-scrollbar py-0.5 flex-1">
            {TRACKS.slice(0, 4).map((t) => {
              const active = isCurrentPlaying(t.audioUrl);
              return (
                <button
                  key={t.id}
                  onClick={() => handlePlay(t)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium transition-colors group ${
                    active
                      ? 'text-amber-400 font-bold'
                      : 'text-white/80 hover:text-amber-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors text-[10px] flex-shrink-0 ${
                      active
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950'
                    }`}
                    aria-hidden
                  >
                    {active ? (
                      <Pause className="w-2.5 h-2.5 fill-current" />
                    ) : (
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    )}
                  </span>
                  <span>
                    {t.title}{' '}
                    <span className="opacity-55">— {t.artist}</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase text-amber-400/70">
                    {t.language.split(' · ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View all */}
          <Link
            href="/music"
            className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-white/50 hover:text-amber-400 transition-colors flex-shrink-0"
          >
            VIEW ALL
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CHAPTER 02 — CURATED DISCOVERY + TYPOGRAPHY MOMENT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="pt-14 sm:pt-16 pb-14 sm:pb-16 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* section header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <span className="text-[10px] font-bold tracking-[0.28em] text-amber-400 uppercase block mb-1">
              CURATED SELECTION
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-[2.8rem] font-normal tracking-tight text-white leading-tight">
              DISCOVER SOMETHING NEW.
            </h2>
          </div>
          <Link
            href="/music"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-white/50 hover:text-amber-400 transition-colors"
          >
            EXPLORE CATALOG
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* asymmetric composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ── Featured album (large left) ── */}
          <div className="lg:col-span-7 rounded-3xl p-5 sm:p-7 border border-white/10 shadow-2xl flex flex-col sm:flex-row gap-6 items-center"
            style={{ background: 'rgba(8,7,14,0.28)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)' }}>
            <div className="relative w-full sm:w-56 flex-shrink-0 aspect-square rounded-2xl overflow-hidden group shadow-md">
              <img
                src={featured.artworkUrl}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <button
                onClick={() => handlePlay(featured)}
                className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Play ${featured.title}`}
              >
                <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform">
                  {isCurrentPlaying(featured.audioUrl) ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </div>
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between text-left">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/12 text-amber-400 border border-amber-500/22 mb-3">
                  {featured.language}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white leading-tight">
                  {featured.title}
                </h3>
                <p className="text-sm font-medium text-white/80 mt-1">
                  {featured.artist}
                </p>
                <p className="text-xs text-white/55 mt-3 line-clamp-3 leading-relaxed font-light">
                  A soulful acoustic journey rooted in traditional Indian melodic sensibilities,
                  performed by genuine independent voices.
                </p>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={() => handlePlay(featured)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] tracking-wider uppercase transition-all shadow-sm active:scale-95"
                >
                  {isCurrentPlaying(featured.audioUrl) ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      PAUSE
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      PLAY SONG
                    </>
                  )}
                </button>
                <span className="text-[11px] text-white/55 font-mono tabular-nums">
                  {Math.floor(featured.durationSeconds / 60)}:
                  {String(featured.durationSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* ── Staggered secondary artworks (right) ── */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {TRACKS.slice(1, 5).map((t, idx) => {
              const active = isCurrentPlaying(t.audioUrl);
              const selected = featured.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setFeaturedIdx(idx + 1)}
                  className={`group relative rounded-2xl p-3 border cursor-pointer transition-all ${
                    selected
                      ? 'border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : 'border-white/10 hover:border-amber-500/30'
                  }`}
                  style={{ background: selected ? 'rgba(245,158,11,0.10)' : 'rgba(8,7,14,0.28)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' }}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5">
                    <img
                      src={t.artworkUrl}
                      alt={t.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePlay(t); }}
                      className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/65 backdrop-blur-md text-amber-400 flex items-center justify-center shadow hover:bg-amber-500 hover:text-slate-950 transition-colors"
                      aria-label={`Play ${t.title}`}
                    >
                      {active ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-white truncate">
                    {t.title}
                  </p>
                  <p className="text-[11px] text-white/55 truncate">
                    {t.artist}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Editorial Typography Moment — no gap ── */}
        <div className="mt-14 pt-10 border-t border-white/15 text-center max-w-3xl mx-auto">
          <blockquote className="font-serif text-3xl sm:text-4xl md:text-[2.8rem] font-normal text-white tracking-tight leading-[1.1] mb-4">
            &ldquo;Some songs find you.
            <br />
            Some songs{' '}
            <span className="italic text-amber-400">change you.&rdquo;</span>
          </blockquote>
          <p className="text-xs sm:text-sm text-white/55 font-light tracking-wide leading-relaxed">
            Curating original recordings across 13 Indian languages directly from grassroots studios.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 tracking-wider uppercase">
            <Music2 className="w-3 h-3" />
            Updated weekly — new drops every Friday
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CHAPTER 03 — DESI MUSIC SIGNATURE SPREAD + MEET THE VOICES
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full" aria-label="Desi Music">
        {/* Full-width cinematic spread — transparent, aligns with fixed bg photo */}
        <div className="relative w-full min-h-[420px] sm:min-h-[480px] flex items-center justify-center overflow-hidden">
          {/* No separate image — the fixed background girl photo shows through */}
          {/* Dark gradient overlay with amber warmth — matches the bg tone */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(6,5,10,0.55) 0%, rgba(6,5,10,0.30) 50%, rgba(6,5,10,0.55) 100%)' }} />
          {/* Amber warm band centre */}
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(180,80,0,0.18) 0%, transparent 65%)' }} />

          <div className="relative z-10 max-w-4xl mx-auto px-6 py-14 text-center text-white">
            <span className="text-[10px] font-bold tracking-[0.32em] uppercase text-amber-400 mb-3 block">
              DESI MUSIC
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-[3.4rem] font-normal tracking-tight leading-[1.04] mb-4">
              ORIGINAL VOICES.
              <br />
              <span className="italic text-amber-300">ORIGINAL STORIES.</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-200 font-light max-w-lg mx-auto mb-5 leading-relaxed">
              Discover independent artists, original songs and stories shaped by India&apos;s many sounds.
            </p>

            {/* Language stream — flowing text line */}
            <p className="text-xs sm:text-sm font-light text-amber-200/85 tracking-wide leading-loose mb-7 max-w-2xl mx-auto">
              Hindi · Telugu · Tamil · Kannada · Malayalam · Bengali · Marathi ·
              Punjabi · Gujarati · Odia · Assamese · Urdu · Bhojpuri
            </p>

            <Link
              href="/desi"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] tracking-widest uppercase transition-all shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              EXPLORE DESI MUSIC
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Meet the Voices — direct connection, zero gap ── */}
        <div id="meet-voices" className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Artist large portrait */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/8 group">
                <img
                  src="/images/landing/creator_story_artist.jpg"
                  alt="Arun Chillara — featured artist"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                    FEATURED ARTIST
                  </span>
                  <p className="text-xl font-bold mt-0.5">Arun Chillara</p>
                  <p className="text-xs text-gray-300">Hyderabad · Telugu Acoustic</p>
                </div>
                {/* Staggered secondary portrait hint */}
                <div className="hidden sm:block absolute top-5 -right-6 w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-white/70 dark:border-white/15 rotate-3 z-10">
                  <img
                    src={TRACKS[2].artworkUrl}
                    alt="Irfan Iqbal"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Artist story */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              <span className="text-[10px] font-bold tracking-[0.28em] text-amber-400 uppercase mb-3">
                MEET THE VOICES
              </span>

              <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-white mb-2">
                Arun Chillara
              </h3>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/12 text-amber-400 border border-amber-500/25">
                  Telugu
                </span>
                <span className="text-xs text-white/55">
                  · Indie · Acoustic
                </span>
              </div>

              <blockquote className="font-serif italic text-xl sm:text-2xl text-white/80 leading-snug mb-8 max-w-lg border-l-2 border-amber-500 pl-4">
                &ldquo;Every song carries a piece of where I come from.&rdquo;
              </blockquote>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handlePlay(TRACKS[1])}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] tracking-widest uppercase transition-all shadow-md active:scale-95"
                >
                  {isCurrentPlaying(TRACKS[1].audioUrl) ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      PAUSE
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      PLAY BROCHEVAREVARURA
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsFollowing((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-[11px] tracking-widest uppercase font-medium border transition-all ${
                    isFollowing
                      ? 'border-teal-500 text-teal-400 bg-teal-500/8'
                      : 'border-white/30 text-white hover:border-amber-400 hover:text-amber-400'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-500" />
                      FOLLOWING
                    </>
                  ) : (
                    'FOLLOW'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CHAPTER 04 — VISUAL MUSIC WALL + CREATOR MOMENT
      ═══════════════════════════════════════════════════════════════ */}
      <section className="pt-10 sm:pt-12 pb-12 sm:pb-14 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

        {/* Centrepiece message */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[2.8rem] font-normal tracking-tight text-white leading-tight mb-2">
            YOUR NEXT FAVOURITE
            <br />
            <span className="italic text-amber-400">MIGHT BE UNKNOWN.</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/55 max-w-sm mx-auto font-light leading-relaxed">
            Discover emerging voices before they become familiar names.
          </p>
        </div>

        {/* ── Artistic floating music wall ── */}
        <div className="relative py-4 flex items-center justify-center overflow-hidden sm:overflow-visible">
          {/* Soft ambient glow behind the wall */}
          <div
            className="absolute inset-0 blur-3xl opacity-20 dark:opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.35) 0%, transparent 70%)',
            }}
            aria-hidden
          />

          <div className="flex items-end justify-center -space-x-6 sm:-space-x-10 md:-space-x-14 relative z-10">
            {TRACKS.slice(0, 5).map((track, i) => {
              const rotations = ['-rotate-[4deg]', 'rotate-[2deg]', 'rotate-0 scale-[1.06] z-20', 'rotate-[3deg]', '-rotate-[3deg]'];
              const sizes = [
                'w-36 sm:w-44 md:w-52',
                'w-40 sm:w-48 md:w-56',
                'w-44 sm:w-56 md:w-64',
                'w-40 sm:w-48 md:w-56',
                'w-36 sm:w-44 md:w-52',
              ];
              const active = isCurrentPlaying(track.audioUrl);

              return (
                <div
                  key={track.id}
                  onClick={() => handlePlay(track)}
                  className={`group relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:scale-110 hover:z-30 cursor-pointer ${rotations[i]} ${sizes[i]}`}
                  role="button"
                  aria-label={`Play ${track.title}`}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handlePlay(track)}
                >
                  <img
                    src={track.artworkUrl}
                    alt={track.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent flex flex-col justify-end p-3 text-white opacity-90 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs sm:text-sm font-semibold truncate leading-tight">
                      {track.title}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-300 truncate">
                      {track.artist}
                    </p>
                  </div>
                  <div
                    className={`absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border border-white/15 transition-colors ${
                      active
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-black/55 backdrop-blur-md text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950'
                    }`}
                  >
                    {active ? (
                      <Pause className="w-3 h-3 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Creator Moment — studio photo backdrop ── */}
        <div className="mt-12 relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center border border-black/5 dark:border-white/8 shadow-xl max-w-5xl mx-auto">
          <img
            src="/images/landing/creator_cta_studio.jpg"
            alt="Recording studio"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.32] contrast-[1.08] select-none"
            draggable={false}
          />
          <div className="relative z-10 text-white max-w-xl mx-auto">
            <span className="text-[10px] font-bold tracking-[0.3em] text-amber-400 uppercase block mb-3">
              FOR THE PEOPLE MAKING MUSIC
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-3 leading-tight">
              Your sound deserves to be heard.
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed mb-7">
              Talent5 gives independent musicians a place to share original music and find listeners who care.
            </p>
            <Link
              href="/creator-studio/apply"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] tracking-widest uppercase transition-all shadow-lg hover:scale-[1.02] active:scale-95"
            >
              BECOME A CREATOR
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CHAPTER 05 — FINAL CTA (high-contrast, compact)
      ═══════════════════════════════════════════════════════════════ */}
      <section
        className="pt-10 pb-16 sm:pb-20 text-center max-w-3xl mx-auto px-5 sm:px-8"
        aria-label="Call to action"
      >
        {/* decorative rule */}
        <div className="flex items-center gap-4 justify-center mb-8" aria-hidden>
          <span className="flex-1 max-w-[80px] h-px bg-white/15" />
          <Mic2 className="w-4 h-4 text-amber-500/60" />
          <span className="flex-1 max-w-[80px] h-px bg-white/15" />
        </div>

        <span className="text-[10px] font-bold tracking-[0.28em] text-amber-400 uppercase block mb-3">
          JOIN THE COMMUNITY
        </span>

        <h2 className="font-serif text-4xl sm:text-5xl md:text-[3.5rem] font-normal tracking-tight text-white mb-3 leading-[1.05]">
          LISTEN DIFFERENTLY.
        </h2>

        <p className="text-sm text-white/60 max-w-xs mx-auto mb-7 font-light leading-relaxed">
          Your next favourite artist might already be here.
        </p>

        <Link
          href="/home"
          className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-[11px] tracking-widest uppercase transition-all shadow-lg hover:-translate-y-0.5 active:scale-95"
        >
          EXPLORE TALENT5
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      </div>
    </div>
  );
}
