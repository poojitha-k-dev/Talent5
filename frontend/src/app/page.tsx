'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bell,
  Check,
  LogIn,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Song } from '@talent5/types';

// Curated mood cards with regional deep colors
const MOOD_BANNERS = [
  {
    id: 'mood-1',
    title: 'Rabindra Sangeet',
    subtitle: 'Classic Bengali Melodies',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    color: 'from-rose-950/80 via-rose-900/50 to-black/70',
    query: 'Bengali',
  },
  {
    id: 'mood-2',
    title: 'Sufi & Ghazal',
    subtitle: 'Soulful Mystic Vocals',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800',
    color: 'from-amber-950/80 via-orange-900/50 to-black/70',
    query: 'Sufi',
  },
  {
    id: 'mood-3',
    title: 'Carnatic Masters',
    subtitle: 'Telugu & Malayalam Ragas',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    color: 'from-blue-950/80 via-cyan-900/50 to-black/70',
    query: 'Carnatic',
  },
  {
    id: 'mood-4',
    title: 'Punjabi Folk',
    subtitle: 'Spiritual Kalams & Energy',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
    color: 'from-orange-950/80 via-amber-900/50 to-black/70',
    query: 'Punjabi',
  },
  {
    id: 'mood-5',
    title: 'Gujarati Bhakti',
    subtitle: 'Devotional Harmonies',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    color: 'from-emerald-950/80 via-teal-900/50 to-black/70',
    query: 'Gujarati',
  },
  {
    id: 'mood-6',
    title: 'Pure Acoustic',
    subtitle: 'Unplugged Human Voices',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800',
    color: 'from-indigo-950/80 via-purple-900/50 to-black/70',
    query: 'Acoustic',
  },
];

// Rich cinematic background images for distinct hero slides
const HERO_BACKDROPS = [
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1800',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1800',
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1800',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1800',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1800',
];

export default function RootHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { playSong, isPlaying, currentSong, togglePlay } = useAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [latestSongs, setLatestSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Infinite Carousel State
  const [currentIndex, setCurrentIndex] = useState(1);
  const [enableTransition, setEnableTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch real latest songs from database
  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/catalog/songs?sortBy=recent&limit=24')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setLatestSongs(json.data);
        }
      })
      .catch((e) => console.error('Error fetching latest songs:', e))
      .finally(() => setLoading(false));
  }, []);

  // Top 5 Hero Tracks from live database
  const heroTracks = latestSongs.length > 0
    ? latestSongs.slice(0, 5)
    : [
        {
          id: 'default-hero-1',
          title: 'Nuton Pran Dao He',
          artistName: 'Anusaruti Mitra',
          genreName: 'Rabindra Sangeet & Classical',
          artworkUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600',
          audioUrl: 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3',
        } as Song,
        {
          id: 'default-hero-2',
          title: 'Je Dhrubho Je Dhrubho',
          artistName: 'Gautam Mitra',
          genreName: 'Hindustani Classical',
          artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600',
          audioUrl: 'https://cdn.freesound.org/previews/415/415951_5121236-lq.mp3',
        } as Song,
      ];

  // Infinite clones array: [Last, ...Originals, First]
  const slides = heroTracks.length > 1
    ? [heroTracks[heroTracks.length - 1], ...heroTracks, heroTracks[0]]
    : heroTracks;

  // Re-enable CSS transition on next animation frame after snap reset
  useEffect(() => {
    if (!enableTransition) {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true);
        });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [enableTransition]);

  // AUTOMATIC FORWARD SLIDING (Every 4.5 seconds, pauses on hover)
  useEffect(() => {
    if (isPaused || heroTracks.length <= 1) return;

    const timer = setInterval(() => {
      setEnableTransition(true);
      setCurrentIndex((prev) => prev + 1);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, heroTracks.length]);

  // Seamless snap reset when sliding into the cloned boundary slides
  const handleTransitionEnd = () => {
    if (heroTracks.length <= 1) return;

    if (currentIndex >= heroTracks.length + 1) {
      // Reached the clone of Slide 0 at the end -> Snap silently back to Slide 0 (index 1)
      setEnableTransition(false);
      setCurrentIndex(1);
    } else if (currentIndex <= 0) {
      // Reached the clone of Slide N at the beginning -> Snap silently back to Slide N (index heroTracks.length)
      setEnableTransition(false);
      setCurrentIndex(heroTracks.length);
    }
  };

  const handleHeroNext = () => {
    setEnableTransition(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleHeroPrev = () => {
    setEnableTransition(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleJumpToDot = (dotIdx: number) => {
    setEnableTransition(true);
    setCurrentIndex(dotIdx + 1);
  };

  // Active indicator dot (always 0 to heroTracks.length - 1)
  const activeDot = heroTracks.length > 0
    ? (currentIndex - 1 + heroTracks.length) % heroTracks.length
    : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePlayHeroTrack = (track: Song) => {
    if (currentSong?.id === track.id) {
      togglePlay();
    } else {
      playSong(track, latestSongs);
    }
  };

  const toggleFollow = (artistName: string) => {
    setFollowingMap((prev) => ({
      ...prev,
      [artistName]: !prev[artistName],
    }));
  };

  // Distinct top artists from real database songs
  const distinctArtists = React.useMemo(() => {
    const map = new Map<string, { name: string; artwork: string; genre: string }>();
    latestSongs.forEach((s) => {
      if (s.artistName && !map.has(s.artistName)) {
        map.set(s.artistName, {
          name: s.artistName,
          artwork: s.artworkUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          genre: s.genreName || s.languageName || 'Artist',
        });
      }
    });
    return Array.from(map.values()).slice(0, 6);
  }, [latestSongs]);

  return (
    <div className="w-full space-y-9 select-none text-zinc-100">
      {/* ────────────────────────────────────────────────────────────
          1. TOP SEARCH & PROFILE BAR
      ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        {/* Rounded Pill Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, albums, playlists..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/[0.08] focus:border-orange-500/50 text-xs sm:text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner"
          />
        </form>

        {/* Right Corner Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/creator-studio/apply"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] hover:border-orange-500/30 text-white transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Upgrade</span>
          </Link>

          <button
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-1.5 right-1.5" />
          </button>

          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-white/[0.06] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/10">
                {(user.fullName || (user as any).name || user.username || 'D')[0]?.toUpperCase()}
              </div>
              <span className="hidden md:inline text-xs font-medium text-zinc-200">
                {user.fullName || (user as any).name || user.username || 'Desi Artist'}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#ff5722] to-[#ff7043] text-white hover:opacity-90 shadow-md shadow-orange-500/20 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          2. FULL-WIDTH CINEMATIC HERO SLIDER (INFINITE SEAMLESS LOOP)
      ──────────────────────────────────────────────────────────── */}
      <div
        className="w-full relative rounded-3xl overflow-hidden min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] border border-white/[0.08] shadow-2xl group"
        
        
      >
        {/* HORIZONTAL CONTINUOUS SLIDING TRACK */}
        <div
          onTransitionEnd={handleTransitionEnd}
          className={`flex h-full ${
            enableTransition ? 'transition-transform duration-700 ease-out' : ''
          }`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((track, idx) => {
            const isCurrentPlaying = currentSong?.id === track.id && isPlaying;
            const artistKey = track.artistName || 'Unknown Artist';
            const isArtistFollowed = !!followingMap[artistKey];
            const backdropImg = HERO_BACKDROPS[idx % HERO_BACKDROPS.length];

            return (
              <div
                key={`slide-${idx}-${track.id}`}
                className="w-full flex-shrink-0 min-w-full relative min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex flex-col justify-between p-6 sm:p-10 lg:p-12"
              >
                {/* Background Stage Backdrop */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${track.artworkUrl || backdropImg}')` }}
                />

                {/* Dark Vignette Overlays for Legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/45" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0e] via-black/25 to-transparent" />
                <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-orange-500/15 rounded-full blur-[140px] pointer-events-none" />

                {/* Top Header of Slide: Kicker + Manual Arrows */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5722] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#ff6a3d]">
                      Artist of the Week • Real Vocal Masters
                    </span>
                  </div>

                  {/* Manual Arrow Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHeroPrev();
                      }}
                      className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-all backdrop-blur-md hover:opacity-90 shadow-md"
                      title="Previous Slide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHeroNext();
                      }}
                      className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-all backdrop-blur-md hover:opacity-90 shadow-md"
                      title="Next Slide"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Center Content of Slide */}
                <div className="relative z-10 my-auto py-8 max-w-2xl space-y-4">
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-white drop-shadow-xl leading-tight">
                    {track.artistName || 'Arijit Singh'}
                  </h1>

                  <div className="flex items-center gap-3 text-sm font-semibold text-orange-400">
                    <span>🎵 {track.title}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-300 font-normal">
                      {track.genreName || track.languageName || 'Indian Classical'}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-zinc-300/90 leading-relaxed font-normal max-w-xl">
                    {track.albumTitle
                      ? `Featuring authentic vocal performances from the verified "${track.albumTitle}" master collection.`
                      : 'Feel the raw human emotion in every note. Stream pure regional vocal masters with zero AI noise.'}
                  </p>

                  {/* Buttons: Play All + Follow */}
                  <div className="pt-2 flex items-center gap-4">
                    <button
                      onClick={() => handlePlayHeroTrack(track)}
                      className="flex items-center gap-2.5 px-8 py-3 rounded-full bg-[#ff5722] hover:bg-[#ff6a3d] text-white font-bold text-sm shadow-xl shadow-orange-500/30 transition-all hover:opacity-95"
                    >
                      {isCurrentPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Play All</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => toggleFollow(track.artistName || 'Unknown Artist')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-semibold backdrop-blur-md transition-all ${
                        isArtistFollowed
                          ? 'bg-white/20 border-white text-white'
                          : 'bg-black/40 hover:bg-black/60 border-white/20 text-zinc-200 hover:text-white'
                      }`}
                    >
                      {isArtistFollowed ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Following</span>
                        </>
                      ) : (
                        <span>Follow</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom of Slide: Listeners Count + Handwritten Quote */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-6 border-t border-white/10">
                  {/* Listener avatars + counter */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2.5">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                        alt="Listener"
                        className="w-8 h-8 rounded-full border-2 border-black object-cover"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                        alt="Listener"
                        className="w-8 h-8 rounded-full border-2 border-black object-cover"
                      />
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                        alt="Listener"
                        className="w-8 h-8 rounded-full border-2 border-black object-cover"
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                      10M+ <span className="text-zinc-400 font-normal">Listeners this week</span>
                    </span>
                  </div>

                  {/* Cursive quote */}
                  <div className="text-right sm:pr-2">
                    <p
                      className="text-xl sm:text-2xl lg:text-3xl font-serif italic text-white/95 tracking-wide font-light flex items-center justify-end gap-2"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      <span>Music Heals Differently</span>
                      <Heart className="w-5 h-5 text-orange-400 fill-current inline-block animate-pulse" />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SLIDE INDICATOR PILLS (Seamless continuous dot tracking) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroTracks.map((_, i) => (
            <button
              key={i}
              onClick={() => handleJumpToDot(i)}
              className={`transition-all duration-300 rounded-full ${
                activeDot === i
                  ? 'w-7 h-1.5 bg-[#ff5722] shadow-[0_0_8px_#ff5722]'
                  : 'w-2 h-1.5 bg-white/30 hover:bg-white/60'
              }`}
              title={`Jump to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          3. LATEST & TRENDING SONGS (Loaded Directly from Database)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Latest Master Tracks
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {latestSongs.length} authentic studio releases live from database
            </p>
          </div>
          <Link
            href="/discover?sortBy=recent"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
          >
            See All ({latestSongs.length}) →
          </Link>
        </div>

        {/* Real Dynamic Track Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {latestSongs.slice(0, 12).map((song) => {
            const isCurrentPlaying = currentSong?.id === song.id && isPlaying;

            return (
              <div
                key={song.id}
                onClick={() => handlePlayHeroTrack(song)}
                className="group p-3 rounded-2xl bg-[#12141a]/60 hover:bg-[#161822] border border-white/[0.05] hover:border-white/10 transition-all cursor-pointer flex flex-col justify-between shadow-lg"
              >
                {/* Artwork with hover play button */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-800">
                  <img
                    src={
                      song.artworkUrl ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'
                    }
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Floating play overlay */}
                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
                      isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#ff5722] text-white flex items-center justify-center shadow-lg shadow-orange-500/40 ">
                      {isCurrentPlaying ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                    {song.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {song.artistName}
                  </p>
                  <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 font-medium">
                    {song.languageName || 'Regional'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          4. MOOD & GENRE BANNERS (Landscape Rectangular Cards)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Explore by Sound & Heritage</h2>
          <Link
            href="/discover"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
          >
            Explore Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {MOOD_BANNERS.map((banner) => (
            <Link
              key={banner.id}
              href={`/discover?search=${encodeURIComponent(banner.query)}`}
              className="relative aspect-[16/9] rounded-2xl overflow-hidden p-3.5 flex flex-col justify-end group border border-white/[0.06] shadow-lg hover:border-white/20"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${banner.color}`} />

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {banner.title}
                  </h4>
                  <p className="text-[10px] text-zinc-300 mt-0.5 opacity-90">{banner.subtitle}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-white/20 group-hover:bg-[#ff5722] flex items-center justify-center transition-colors">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          5. TOP ARTISTS FROM DATABASE (Circular Portraits)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Featured Artists</h2>
          <Link
            href="/discover"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
          >
            View All Artists →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-5 rounded-3xl bg-[#12141a]/50 border border-white/[0.05]">
          {distinctArtists.map((artist, idx) => (
            <Link
              key={idx}
              href={`/discover?search=${encodeURIComponent(artist.name)}`}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2.5 border-2 border-transparent group-hover:border-orange-500 transition-all shadow-xl">
                <img
                  src={artist.artwork}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] group-hover:text-orange-400 transition-colors">
                {artist.name}
              </p>
              <span className="text-[11px] text-zinc-400 truncate max-w-[110px]">
                {artist.genre}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
