'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  Heart,
  Bookmark,
  Search,
  Pin,
  PinOff,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Mic2,
  Trophy,
  Flame,
  Radio,
  Clock,
  Music,
  FileText,
  Upload,
  Headphones,
  CheckCircle2,
  ChevronRight,
  Compass,
  ShieldCheck,
  Shield,
  LogIn,
  User,
  Library,
  Share2,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { usePinnedPlaylists } from '@/hooks/usePinnedPlaylists';
import { Song, Artist, Competition, Playlist } from '@talent5/types';
import { SongRow } from '@/components/ui/SongRow';
import { TrackCard } from '@/components/ui/TrackCard';
import { ArtistCard } from '@/components/ui/ArtistCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { HeroSkeleton, SongRowSkeleton, TrackCardSkeleton } from '@/components/ui/SkeletonLoader';
import { formatCompactNumber, formatDuration } from '@talent5/utils';

export default function RootHomePage() {
  const { user } = useAuth();

  // If user is authenticated, render the rich Personal Dashboard
  // If not authenticated, render the dedicated high-impact Landing Page
  if (user) {
    return <PersonalDashboard />;
  }

  return <LandingPage />;
}

/* =========================================================================
   1. VISITOR LANDING PAGE (Unauthenticated: Music Importance & Discovery)
   ========================================================================= */
function LandingPage() {
  const { playSong, isPlaying, currentSong, togglePlay } = useAudio();
  const [previewTracks, setPreviewTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/catalog/home')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const songs = json.data.trending || json.data.newReleases || [];
          setPreviewTracks(songs.slice(0, 6));
        }
      })
      .catch((err) => console.error('Failed to load landing preview tracks', err))
      .finally(() => setLoading(false));
  }, []);

  const scrollToExplore = () => {
    const el = document.getElementById('explore-now');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-white selection:bg-amber-500 selection:text-black overflow-x-hidden relative">
      {/* ─── DEDICATED TOP NAVIGATION BAR ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-midnight-950/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-teal-400 p-0.5 shadow-saffronGlow group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-midnight-950 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="6" width="2.2" height="6" rx="1.1" fill="#F59E0B" />
                  <rect x="4.4" y="3" width="2.2" height="12" rx="1.1" fill="#F59E0B" />
                  <rect x="7.9" y="1" width="2.2" height="16" rx="1.1" fill="#FBBF24" />
                  <rect x="11.4" y="4" width="2.2" height="10" rx="1.1" fill="#F59E0B" />
                  <rect x="14.8" y="7" width="2.2" height="4" rx="1.1" fill="#F59E0B" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                TALENT<span className="text-amber-500">5</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-gray-400 font-mono">
                Real Voices • Desi Talent
              </span>
            </div>
          </Link>

          {/* Story Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#music-importance" className="hover:text-amber-400 transition-colors">
              Why Real Music Matters
            </a>
            <a href="#vocal-discovery" className="hover:text-amber-400 transition-colors">
              New Vocal Discovery
            </a>
            <a href="#explore-now" className="hover:text-amber-400 transition-colors">
              Explore Now
            </a>
            <Link href="/competitions" className="hover:text-amber-400 transition-colors">
              Live Tournaments
            </Link>
          </nav>

          {/* Top Right Corner Auth Options */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
              title="Talent5 Admin Portal Gateway"
            >
              <Shield className="w-3.5 h-3.5 text-rose-400" />
              <span>Admin</span>
            </Link>
            <Link
              href="/login?mode=login"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login?mode=register"
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-midnight-950 font-bold text-xs sm:text-sm shadow-saffronGlow hover:scale-105 transition-all"
            >
              Join Talent5 Free
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION: MUSIC IMPORTANCE & HUMAN SOUL ─── */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-amber-500/20 via-rose-500/10 to-teal-500/15 rounded-full blur-[160px] pointer-events-none" />
        
        {/* Floating Sargam Notes */}
        {[
          { text: 'सा', x: '8%', y: '20%', delay: '0s' },
          { text: 'रे', x: '12%', y: '65%', delay: '1s' },
          { text: 'ग', x: '86%', y: '25%', delay: '1.5s' },
          { text: 'म', x: '90%', y: '70%', delay: '0.5s' },
          { text: 'प', x: '4%', y: '85%', delay: '2s' },
          { text: 'ध', x: '92%', y: '88%', delay: '2.5s' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="absolute hidden lg:block text-5xl font-serif text-amber-500/15 select-none pointer-events-none animate-pulse"
            style={{ left: item.x, top: item.y, animationDelay: item.delay }}
          >
            {item.text}
          </div>
        ))}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-sm animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Soul of Indian Vocal Artistry • 100% Human Masters</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight leading-[1.1] text-white">
            Music is Sacred. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-teal-300 bg-clip-text text-transparent">
              Real Voices Matter.
            </span>
          </h1>

          {/* Story on Music Importance */}
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-gray-300 font-normal leading-relaxed">
            In an era crowded with synthetic algorithms and auto-tuned noise, Indian musical heritage was born from genuine breath, raga precision, and soulful human emotion. Talent5 is the sanctuary where raw vocalists, classical masters, and indie lyricists are celebrated without artificial dilution.
          </p>

          {/* Dual Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={scrollToExplore}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-midnight-950 font-black text-base shadow-saffronGlow hover:scale-105 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Explore Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-base hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Mic2 className="w-4 h-4 text-amber-400" />
              <span>Discover New Talents</span>
            </Link>
          </div>

          {/* Trust Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-white/10 max-w-4xl mx-auto text-center">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-2xl sm:text-3xl font-black font-display text-amber-400">340+</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Authentic Master Tracks</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-2xl sm:text-3xl font-black font-display text-teal-400">9</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Desi Regional Languages</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-2xl sm:text-3xl font-black font-display text-rose-400">100%</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Human-Verified Singing</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-2xl sm:text-3xl font-black font-display text-amber-400">0</p>
              <p className="text-xs text-gray-400 font-medium mt-1">AI-Generated Clones</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: WHY REAL MUSIC MATTERS (PHILOSOPHY) ─── */}
      <section id="music-importance" className="py-20 border-t border-white/10 bg-midnight-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
              <Music className="w-3.5 h-3.5" /> The Philosophy
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
              Why Real Human Vocals Cannot Be Replaced
            </h2>
            <p className="text-base text-gray-300 leading-relaxed">
              Every authentic vocal performance carries the subtle micro-intonations (gamakas), genuine breathing pauses, and emotional truth born from personal story and cultural lineage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                सा
              </div>
              <h3 className="text-xl font-bold font-display text-white">Soul & Micro-Nuance</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                From classical aalapana to modern Sufi vibratos, real vocal cords convey lived grief, ecstasy, and devotion that no synthesizer can emulate.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-teal-500/40 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                रे
              </div>
              <h3 className="text-xl font-bold font-display text-white">Living Cultural Heritage</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Centuries-old folk traditions, ghazals, and regional poetry in Tamil, Telugu, Hindi, Bengali, and beyond deserve genuine human custody and honor.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-rose-500/40 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                ग
              </div>
              <h3 className="text-xl font-bold font-display text-white">Fair Artist Sovereignty</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Creators retain ownership of their masters, transparent telemetry protects from play-bot fraud, and listeners vote with real weight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: NEW VOCALS DISCOVERY PIPELINE ─── */}
      <section id="vocal-discovery" className="py-20 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-teal-400">
                <Mic2 className="w-3.5 h-3.5" /> The Talent Discovery Engine
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
                Unearthing the Next Generation of Indian Voices
              </h2>
              <p className="text-base text-gray-300 leading-relaxed">
                Talent5 bridges the gap between bedroom singers, classical proteges, indie composers, and passionate listeners.
              </p>
            </div>

            <Link href="/new-talent">
              <Button variant="peacock" size="lg" className="font-bold gap-2">
                <span>View New Talent Spotlight</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Verified Master Auditions</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Singers submit live auditions to our musicologists. Only verified human voices receive the Talent5 badge.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">9 Regional Dialects</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Filter by cultural mother-tongue and musical scales (Ragas) instead of generic mainstream charts.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Desi Indie Tournaments</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Public community voting with anti-fraud voter verification gives equal opportunity to unknown indie singers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Synchronized Lyrics</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Follow every verse in real time with line-by-line speech timing that preserves genuine instrumental breath pauses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: "EXPLORE NOW" INTERACTIVE PREVIEW SHOWCASE ─── */}
      <section id="explore-now" className="py-20 border-t border-white/10 bg-midnight-900/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
                <Headphones className="w-3.5 h-3.5" /> Instant Audio Experience
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-display text-white">
                Explore the Sound of Talent5 Now
              </h2>
              <p className="text-sm text-gray-400">
                Tap play on any master recording below to experience high-fidelity Desi streaming immediately.
              </p>
            </div>

            <Link href="/discover">
              <Button variant="secondary" size="md" className="font-semibold text-xs gap-1.5">
                <span>View Full 340+ Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <TrackCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {previewTracks.map((song) => {
                const isThisPlaying = currentSong?.id === song.id && isPlaying;
                return (
                  <div
                    key={song.id}
                    className="p-5 rounded-3xl bg-midnight-950/80 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-card"
                  >
                    <div className="space-y-4">
                      {/* Artwork with play overlay */}
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-midnight-900 border border-white/10">
                        <img
                          src={song.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'}
                          alt={song.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (currentSong?.id === song.id) togglePlay();
                              else playSong(song, previewTracks);
                            }}
                            className="w-12 h-12 rounded-full bg-amber-500 text-midnight-950 flex items-center justify-center shadow-saffronGlow hover:scale-110 transition-transform"
                          >
                            {isThisPlaying ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current translate-x-0.5" />
                            )}
                          </button>
                        </div>

                        {/* Language Badge */}
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-white/10 uppercase tracking-wider">
                          {song.languageName || 'Desi'}
                        </div>
                      </div>

                      {/* Song Info */}
                      <div>
                        <Link
                          href={`/song/${song.id}`}
                          className="text-base font-bold text-white hover:text-amber-400 transition-colors line-clamp-1 block"
                        >
                          {song.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{song.artistName}</p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                      <span>{formatDuration(song.durationSeconds)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (currentSong?.id === song.id) togglePlay();
                          else playSong(song, previewTracks);
                        }}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        {isThisPlaying ? 'Pause Stream' : 'Play Preview'} →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── FINAL JOIN CTA ─── */}
      <section className="py-24 border-t border-white/10 relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-saffronGlow">
            <Mic2 className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            Ready to Experience Real Desi Voices?
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Create your account today to save your favorite songs, pin custom playlists, support emerging vocalists, and even share your own music.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/login?mode=register"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-midnight-950 font-black text-base shadow-saffronGlow hover:scale-105 transition-all"
            >
              Create Free Account
            </Link>
            <Link
              href="/login?mode=login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-base hover:scale-105 transition-all"
            >
              Sign In to Your Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-xs text-gray-500 font-mono">
        <p>© 2026 Talent5 Music Platform. Safeguarding 100% Real Human Indian Vocals & Master Rights.</p>
      </footer>
    </div>
  );
}

/* =========================================================================
   2. PERSONALIZED DASHBOARD (Authenticated: Liked Songs, Pinned Playlists, Search, Add Songs)
   ========================================================================= */
function PersonalDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { pinnedIds, togglePin, isPinned } = usePinnedPlaylists(user?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [libraryData, setLibraryData] = useState<{
    likedSongs: Song[];
    playlists: Playlist[];
    savedSongs: Song[];
    followedArtists: Artist[];
  }>({
    likedSongs: [],
    playlists: [],
    savedSongs: [],
    followedArtists: [],
  });

  const [feedData, setFeedData] = useState<{
    trending: Song[];
    risingArtists: Artist[];
    competitions: Competition[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Fetch user library (liked songs, user playlists)
  useEffect(() => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      fetch('/api/v1/library', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/v1/catalog/home', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([libRes, feedRes]) => {
        if (libRes.success && libRes.data) {
          setLibraryData({
            likedSongs: libRes.data.likedSongs || [],
            playlists: libRes.data.playlists || [],
            savedSongs: libRes.data.savedSongs || [],
            followedArtists: libRes.data.followedArtists || [],
          });
        }
        if (feedRes.success && feedRes.data) {
          setFeedData(feedRes.data);
        }
      })
      .catch((err) => console.error('Dashboard load error', err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePlayLikedSongs = () => {
    if (libraryData.likedSongs.length > 0) {
      playSong(libraryData.likedSongs[0], libraryData.likedSongs);
    }
  };

  const pinnedPlaylists = libraryData.playlists.filter((p) => isPinned(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* ─── 1. TOP HEADER & PROMINENT SEARCH BAR ─── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
              Namaste, {user?.fullName || user?.username} 👋
            </h1>
            <p className="text-sm text-gray-400">
              Welcome to your personal Indian vocal hub. Pick up where you left off.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-3">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all shadow-sm"
            >
              <Library className="w-4 h-4 text-amber-400" />
              <span>Your Library ({libraryData.likedSongs.length + libraryData.playlists.length})</span>
            </Link>

            <Link
              href="/creator-studio/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-midnight-950 font-bold text-xs shadow-saffronGlow transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Add Your Song</span>
            </Link>
          </div>
        </div>

        {/* Big Search Bar on the Front */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-3xl">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, ragas, or regional lyrics..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-midnight-900/90 border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-card transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-midnight-950 font-bold text-xs transition-colors"
          >
            Search
          </button>
        </form>
      </section>

      {/* ─── 2. FRONT ROW: LIKED SONGS & PINNED PLAYLISTS ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liked Songs Hero Card */}
        <div className="lg:col-span-1 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-rose-900/40 via-amber-900/20 to-midnight-900 border border-white/10 shadow-card flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
            <Heart className="w-36 h-36 fill-current text-rose-500" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 fill-current" />
            </div>

            <div>
              <h2 className="text-2xl font-black font-display text-white tracking-tight">Liked Songs</h2>
              <p className="text-xs text-rose-200/70 font-medium mt-1">
                {libraryData.likedSongs.length} {libraryData.likedSongs.length === 1 ? 'song' : 'songs'} saved to your favorites
              </p>
            </div>

            {/* Quick snippet of liked songs */}
            <div className="space-y-2 pt-2">
              {libraryData.likedSongs.slice(0, 3).map((song) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song, libraryData.likedSongs)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors text-xs"
                >
                  <img
                    src={song.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'}
                    alt={song.title}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">{song.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{song.artistName}</p>
                  </div>
                  <Play className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 relative z-10 flex items-center justify-between">
            <Button
              variant="primary"
              size="md"
              disabled={libraryData.likedSongs.length === 0}
              onClick={handlePlayLikedSongs}
              className="gap-2 font-bold shadow-saffronGlow text-midnight-950"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All Liked</span>
            </Button>

            <Link href="/library" className="text-xs font-semibold text-amber-400 hover:underline">
              View All →
            </Link>
          </div>
        </div>

        {/* Pinned Playlists on the Front */}
        <div className="lg:col-span-2 rounded-3xl p-6 sm:p-8 bg-midnight-900/60 border border-white/10 shadow-card flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Pin className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold font-display text-white">Pinned Playlists</h2>
              </div>

              <button
                type="button"
                onClick={() => setIsPinModalOpen(true)}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center gap-1.5 transition-colors"
              >
                <span>Manage Pins</span>
                <span>📌</span>
              </button>
            </div>

            {pinnedPlaylists.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Pin className="w-8 h-8 text-gray-500 mx-auto opacity-60" />
                <p className="text-sm text-gray-300 font-medium">No playlists pinned to the front yet.</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Pin your favorite playlists here for instantaneous 1-tap playback right when you open Talent5.
                </p>
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(true)}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-amber-400 transition-colors"
                >
                  Pin Playlists Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pinnedPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all flex items-center justify-between group"
                  >
                    <Link href={`/playlist/${pl.id}`} className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/30 to-teal-500/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Music className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                          {pl.name}
                        </p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                          {pl.songCount || 0} tracks
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => togglePin(pl.id)}
                        className="p-2 text-amber-400 hover:text-gray-400 rounded-lg hover:bg-white/5 transition-colors"
                        title="Unpin playlist"
                      >
                        <PinOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <span>{pinnedPlaylists.length} pinned to front</span>
            <Link href="/library" className="hover:text-white font-semibold">
              Open Library →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 3. ADD YOUR OWN SONGS / CREATOR STUDIO SECTION ─── */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-teal-950/40 via-midnight-900 to-amber-950/30 border border-teal-500/30 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Creator Studio & Submissions
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              Add Your Own Songs & Voices
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
              Are you an independent singer, classical vocalist, or composer? Publish original audio, add synchronized lyrics, and participate in community voting.
            </p>
          </div>

          <Link href="/creator-studio/upload">
            <Button variant="peacock" size="lg" className="font-bold gap-2 text-midnight-950">
              <Upload className="w-4 h-4" />
              <span>Upload Track</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <Link
            href="/creator-studio/upload"
            className="p-5 rounded-2xl bg-midnight-950/60 border border-white/10 hover:border-teal-400/40 transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">Upload Master Recording</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Publish lossless audio with verified master rights and synchronized lyric timings.
            </p>
          </Link>

          <Link
            href="/creator-studio/apply"
            className="p-5 rounded-2xl bg-midnight-950/60 border border-white/10 hover:border-amber-400/40 transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic2 className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">Apply for Creator Verification</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Submit your vocal audition to join the verified Desi Talent5 roster and earn royalties.
            </p>
          </Link>

          <Link
            href="/competitions"
            className="p-5 rounded-2xl bg-midnight-950/60 border border-white/10 hover:border-rose-400/40 transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">Enter Tournaments</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Submit original songs to active challenges like Desi Indie Voice 2026.
            </p>
          </Link>
        </div>
      </section>

      {/* ─── 4. DISCOVERY & COMMUNITY FEEDS ─── */}
      {feedData?.trending && feedData.trending.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Trending Across India</span>
            </h3>
            <Link href="/discover" className="text-xs font-semibold text-amber-400 hover:underline">
              View All Catalog →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {feedData.trending.slice(0, 6).map((song) => (
              <TrackCard key={song.id} song={song} />
            ))}
          </div>
        </section>
      )}

      {/* ─── PIN PLAYLISTS MODAL ─── */}
      <Modal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        title="Pin Playlists to Front"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            Select playlists from your library to pin right to the top row of your Talent5 home screen.
          </p>

          {libraryData.playlists.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-sm text-gray-300 font-medium">You haven't created any playlists yet.</p>
              <Link href="/library" className="text-xs font-bold text-amber-400 hover:underline">
                Go to Library to create one →
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {libraryData.playlists.map((pl) => {
                const pinned = isPinned(pl.id);
                return (
                  <div
                    key={pl.id}
                    onClick={() => togglePin(pl.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      pinned
                        ? 'bg-amber-500/15 border-amber-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Music className={`w-4 h-4 ${pinned ? 'text-amber-400' : 'text-gray-400'}`} />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{pl.name}</p>
                        <p className="text-[10px] text-gray-400">{pl.songCount || 0} songs</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        pinned
                          ? 'bg-amber-500 text-midnight-950'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {pinned ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Pinned</span>
                        </>
                      ) : (
                        <>
                          <Pin className="w-3.5 h-3.5" />
                          <span>Pin</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setIsPinModalOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
