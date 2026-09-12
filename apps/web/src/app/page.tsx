'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Sparkles,
  Trophy,
  ShieldCheck,
  Coins,
  Mic,
  ArrowRight,
  Music,
  Compass,
  Flame,
  CheckCircle2,
  Users,
  Globe,
  Headphones,
  Radio,
  Star,
  Layers,
  Heart,
  Disc3,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAudio } from '@/context/AudioContext';
import { SoundMandalaVisualizer } from '@/components/creative/SoundMandalaVisualizer';
import { RagaSoundscapeExplorer } from '@/components/creative/RagaSoundscapeExplorer';
import { VinylTurntableShowcase } from '@/components/creative/VinylTurntableShowcase';
import { LipiScriptWall } from '@/components/creative/LipiScriptWall';

export default function LandingPage() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();

  const featuredTracks = [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      title: 'Tum Bin Mann Kaha',
      artist: 'Kabir Sen',
      genre: 'Sufi & Ghazal',
      language: 'Hindi',
      duration: '3:30',
      audioUrl: 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3',
      artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
      likes: '14.2K',
      instrument: 'Acoustic Sitar & Sarangi',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000003',
      title: 'Desi Cypher Anthem',
      artist: 'DJ Shera ft. Young Veer',
      genre: 'Desi Hip-Hop',
      language: 'Punjabi',
      duration: '2:45',
      audioUrl: 'https://cdn.freesound.org/previews/665/665183_11861866-lq.mp3',
      artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
      likes: '28.9K',
      instrument: '808s & Punjabi Tumbi',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      title: 'Chennai Rain Raga',
      artist: 'Meera Swaminathan',
      genre: 'Carnatic Fusion',
      language: 'Tamil',
      duration: '4:10',
      audioUrl: 'https://cdn.freesound.org/previews/612/612608_11861866-lq.mp3',
      artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400',
      likes: '19.4K',
      instrument: 'Venu Flute & Mridangam',
    },
  ];

  const handlePlayPreview = (track: typeof featuredTracks[0]) => {
    if (currentSong?.id === track.id) {
      togglePlay();
      return;
    }

    playSong({
      id: track.id,
      title: track.title,
      artistName: track.artist,
      audioUrl: track.audioUrl,
      artworkUrl: track.artworkUrl,
      durationSeconds: 210,
    } as any);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden transition-colors duration-300">
      {/* 1. DYNAMIC HERO SECTION WITH SOUND MANDALA */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glowing Ambient Backdrop Aura */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80 z-0">
          <SoundMandalaVisualizer size="lg" />
        </div>

        <div className="text-center space-y-6 max-w-4xl mx-auto relative z-10">
          {/* Sanskrit / English Desi Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-midnight-900/90 border border-amber-500/30 shadow-saffronGlow backdrop-blur-md animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest">
              Real Voices • Original Stories • Desi Talent
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Where India’s Indie Music <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-teal-600 dark:from-amber-400 dark:via-amber-300 dark:to-teal-300 bg-clip-text text-transparent">
              Comes to Life.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Stream high-fidelity original music across 13 Indian languages, support independent creators with validated engagement rewards, and discover grassroots superstars.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/home">
              <Button
                variant="primary"
                size="lg"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-8 py-3.5 shadow-saffronGlow rounded-full hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Start Listening Free
              </Button>
            </Link>

            <Link href="/creator-studio/apply">
              <Button
                variant="ghost"
                size="lg"
                className="border border-slate-300 dark:border-white/15 hover:border-teal-500 hover:bg-teal-500/10 text-slate-800 dark:text-white font-bold text-sm px-8 py-3.5 rounded-full backdrop-blur-md transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2 text-teal-600 dark:text-teal-400" />
                Become a Verified Creator
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-amber-500/15 dark:border-white/10 text-left">
            <div className="p-3">
              <div className="text-2xl font-bold font-display text-slate-900 dark:text-white">13+</div>
              <div className="text-xs text-slate-500 dark:text-gray-400">Indian Languages</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400">100%</div>
              <div className="text-xs text-slate-500 dark:text-gray-400">Original Masters</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold font-display text-teal-600 dark:text-teal-400">₹0.10</div>
              <div className="text-xs text-slate-500 dark:text-gray-400">Reward Per Valid Like</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold font-display text-rose-600 dark:text-rose-400">₹1,00,000+</div>
              <div className="text-xs text-slate-500 dark:text-gray-400">Tournament Prizes</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REGIONAL LIPI SCRIPT WALL */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-amber-500/15 dark:border-white/5">
        <LipiScriptWall />
      </section>

      {/* 3. VINYL TURNTABLE SHOWCASE */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <VinylTurntableShowcase />
      </section>

      {/* 4. ANCIENT & CONTEMPORARY RAGA MOOD EXPLORER */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <RagaSoundscapeExplorer />
      </section>

      {/* 5. TRENDING DESI ORIGINALS AUDIO TEASER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-amber-500/15 dark:border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Pure Independent Masters</span>
            </div>
            <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">
              Trending Desi Originals
            </h2>
          </div>
          <Link
            href="/music"
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 transition-colors"
          >
            <span>Explore Full 13-Language Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTracks.map((track) => {
            const isThisPlaying = currentSong?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                className="p-5 rounded-3xl bg-white/80 dark:bg-midnight-900/60 border border-slate-200/80 dark:border-white/10 hover:border-amber-500/40 transition-all flex items-center justify-between gap-4 group backdrop-blur-md shadow-card hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-midnight-950 flex-shrink-0 relative">
                    <img
                      src={track.artworkUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{track.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-gray-400 truncate mt-0.5">{track.artist}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-amber-700 dark:text-amber-400">
                        {track.language} • {track.genre}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-gray-400 flex items-center gap-0.5">
                        <Heart className="w-3 h-3 text-rose-500 fill-current" />
                        {track.likes}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePlayPreview(track)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isThisPlaying
                      ? 'bg-amber-500 text-slate-950 shadow-saffronGlow scale-105'
                      : 'bg-slate-100 dark:bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-slate-800 dark:text-white'
                  }`}
                >
                  {isThisPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. PLATFORM PILLARS (4 CORE EXPERIENCES) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-amber-500/15 dark:border-white/5 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
            A Next-Generation Music Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
            Built for Listeners, Creators & Innovators
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
            Engineered with strict legal provenance, real-time engagement economics, and AI vocal technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/50 border border-slate-200 dark:border-white/5 hover:border-amber-500/30 transition-all space-y-4 shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Spotify-Grade Streaming</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Uninterrupted global audio engine with real-time millisecond-matched teleprompter lyrics across 13 Indian languages.
            </p>
            <Link href="/music" className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline">
              <span>Browse Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/50 border border-slate-200 dark:border-white/5 hover:border-teal-500/30 transition-all space-y-4 shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Validated Economics</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Creators earn transparently (₹0.10 / valid like). Anti-fraud heuristics filter bot velocity and enable direct UPI withdrawals.
            </p>
            <Link href="/creator-studio/apply" className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline">
              <span>Creator Rewards</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/50 border border-slate-200 dark:border-white/5 hover:border-rose-500/30 transition-all space-y-4 shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Talent Tournaments</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Nationwide challenges with ₹1,00,000+ cash prizes, live audience voting, and real-time audited leaderboards.
            </p>
            <Link href="/competitions" className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline">
              <span>View Challenges</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/50 border border-slate-200 dark:border-white/5 hover:border-purple-500/30 transition-all space-y-4 shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">AI Singing Lab</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              Sing along with authentic Indian raga backing tracks and receive instant AI pitch and rhythm adjudication.
            </p>
            <Link href="/karaoke" className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline">
              <span>Enter Vocal Lab</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. RIGHTS-FIRST COMPLIANCE BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-teal-500/10 via-white to-amber-500/10 dark:from-midnight-900 dark:via-midnight-900/90 dark:to-teal-950/40 border border-teal-500/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-card">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Legal & Rights-Enforced</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
              Every Song. Every Master. Legally Verified.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
              Talent5 operates under strict copyright provenance. Our schema-enforced rights engine tracks direct publisher licenses, creator-owned master deeds, and statutory streaming compliance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
            <Link href="/login">
              <Button variant="primary" size="lg" className="bg-teal-600 hover:bg-teal-500 text-white font-bold">
                Join the Platform
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost" size="lg" className="text-xs text-slate-700 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white border border-slate-300 dark:border-white/10">
                Command Center
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
