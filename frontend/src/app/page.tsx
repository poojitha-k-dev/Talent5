'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Shield,
  LogIn,
  Disc3,
  Flame,
  Globe2,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Song } from '@talent5/types';

interface DynamicHeroTrack extends Song {
  artistBio?: string;
  artistAvatarUrl?: string;
  artistFollowersCount?: number;
  isArtistVerified?: boolean;
}

interface DynamicGenre {
  id: number;
  name: string;
  slug: string;
  description: string;
  songCount: number;
  artworkUrl: string;
}

interface DynamicLanguage {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  songCount: number;
  artworkUrl: string;
}

interface DynamicArtist {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  followersCount?: number;
  songCount: number;
  totalPlays: string | number;
  genreName?: string;
}

interface HomeCatalogPayload {
  heroTracks: DynamicHeroTrack[];
  trending: Song[];
  featured: Song[];
  newReleases: Song[];
  languages: DynamicLanguage[];
  genres: DynamicGenre[];
  topArtists: DynamicArtist[];
  stats: {
    totalSongs: number;
    totalPlays: string | number;
    totalArtists: number;
    totalLanguages: number;
  };
}

export default function RootHomePage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { playSong, isPlaying, currentSong, togglePlay } = useAudio();

  const [searchQuery, setSearchQuery] = useState('');
  const [catalog, setCatalog] = useState<HomeCatalogPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  // Manual Carousel State (Clicks only - No auto-scrolling)
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. Fetch live comprehensive catalog from backend database
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('/api/v1/catalog/home')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (isMounted && json.success && json.data) {
          setCatalog(json.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching dynamic home catalog:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch authenticated user followed artists from database
  useEffect(() => {
    if (!token) {
      setFollowingMap({});
      return;
    }

    fetch('/api/v1/library', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.followedArtists) {
          const map: Record<string, boolean> = {};
          json.data.followedArtists.forEach((a: any) => {
            if (a.id) map[a.id] = true;
            if (a.name) map[a.name] = true;
          });
          setFollowingMap(map);
        }
      })
      .catch((err) => console.error('Failed to load user followed artists:', err));
  }, [token]);

  const heroTracks = useMemo(() => {
    return catalog?.heroTracks || [];
  }, [catalog?.heroTracks]);

  // Combined pool of all available loaded songs for seamless continuous playback queue
  const allSongsPool = useMemo(() => {
    if (!catalog) return [];
    const pool = new Map<string, Song>();
    (catalog.heroTracks || []).forEach((s) => pool.set(s.id, s));
    (catalog.trending || []).forEach((s) => pool.set(s.id, s));
    (catalog.featured || []).forEach((s) => pool.set(s.id, s));
    (catalog.newReleases || []).forEach((s) => pool.set(s.id, s));
    return Array.from(pool.values());
  }, [catalog]);

  const handleHeroNext = () => {
    if (heroTracks.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % heroTracks.length);
  };

  const handleHeroPrev = () => {
    if (heroTracks.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + heroTracks.length) % heroTracks.length);
  };

  const handleJumpToDot = (dotIdx: number) => {
    setCurrentIndex(dotIdx);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePlaySong = (track: Song) => {
    if (currentSong?.id === track.id) {
      togglePlay();
    } else {
      playSong(track, allSongsPool.length > 0 ? allSongsPool : [track]);
    }
  };

  // Live database toggle follow artist with optimistic UI & auth validation
  const toggleFollow = async (artistId?: string, artistName?: string) => {
    if (!artistId) return;

    if (!user || !token) {
      router.push('/login');
      return;
    }

    const currentStatus = !!followingMap[artistId];
    // Optimistic state update
    setFollowingMap((prev) => ({
      ...prev,
      [artistId]: !currentStatus,
      ...(artistName ? { [artistName]: !currentStatus } : {}),
    }));
    setFollowLoading((prev) => ({ ...prev, [artistId]: true }));

    try {
      const res = await fetch('/api/v1/social/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ artistId }),
      });

      if (!res.ok) {
        // Revert on API error
        setFollowingMap((prev) => ({
          ...prev,
          [artistId]: currentStatus,
          ...(artistName ? { [artistName]: currentStatus } : {}),
        }));
      }
    } catch (err) {
      console.error('Follow request error:', err);
      setFollowingMap((prev) => ({
        ...prev,
        [artistId]: currentStatus,
        ...(artistName ? { [artistName]: currentStatus } : {}),
      }));
    } finally {
      setFollowLoading((prev) => ({ ...prev, [artistId]: false }));
    }
  };

  return (
    <div className="w-full space-y-10 select-none text-zinc-900 dark:text-zinc-100 pb-16">
      {/* ────────────────────────────────────────────────────────────
          1. TOP SEARCH & PROFILE BAR (Live Auth State)
      ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        {/* Rounded Pill Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, albums, classical ragas, languages..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white dark:bg-white/[0.08] hover:bg-zinc-50 dark:hover:bg-white/[0.12] focus:bg-white dark:focus:bg-white/[0.15] border border-black/10 dark:border-white/[0.12] focus:border-orange-500 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/25 transition-all shadow-xs"
          />
        </form>

        {/* Right Corner Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/creator-studio/apply"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-white/[0.08] hover:bg-zinc-100 dark:hover:bg-white/[0.12] border border-black/10 dark:border-white/[0.12] text-zinc-800 dark:text-white transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Upgrade</span>
          </Link>

          <button
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-1.5 right-1.5" />
          </button>

          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/[0.06] transition-colors border border-transparent hover:border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/20">
                {(user.fullName || (user as any).name || user.username || 'U')[0]?.toUpperCase()}
              </div>
              <span className="hidden md:inline text-xs font-medium text-zinc-800 dark:text-zinc-200">
                {user.fullName || (user as any).name || user.username || 'My Profile'}
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
          2. FULL-WIDTH CINEMATIC HERO SLIDER (Database-Driven Tracks)
      ──────────────────────────────────────────────────────────── */}
      {loading && heroTracks.length === 0 ? (
        <div className="w-full min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] rounded-3xl bg-zinc-200 dark:bg-zinc-800/50 animate-pulse border border-black/10 dark:border-white/10 flex items-center justify-center">
          <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <Disc3 className="w-6 h-6 animate-spin text-orange-500" />
            <span className="text-sm font-medium">Curating your music experience...</span>
          </div>
        </div>
      ) : heroTracks.length > 0 ? (
        <div
          className="w-full relative rounded-3xl overflow-hidden min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] border border-black/10 dark:border-white/[0.12] shadow-2xl ring-1 ring-white/10"
        >
          {/* HORIZONTAL SLIDING TRACK - ONLY MOVES ON EXPLICIT BUTTON/DOT CLICK */}
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {heroTracks.map((track, idx) => {
              const isCurrentPlaying = currentSong?.id === track.id && isPlaying;
              const artistId = track.artistId;
              const isArtistFollowed = !!(artistId && followingMap[artistId]) || !!(track.artistName && followingMap[track.artistName]);
              const isFollowingThis = !!(artistId && followLoading[artistId]);

              return (
                <div
                  key={`hero-slide-${track.id}`}
                  className="w-full flex-shrink-0 min-w-full relative min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex flex-col justify-between p-6 sm:p-10 lg:p-12"
                >
                  {/* Background Stage Backdrop */}
                  <div
                    className="absolute inset-0 bg-cover bg-center filter brightness-110 contrast-105"
                    style={{ backgroundImage: `url('${track.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600'}')` }}
                  />

                  {/* Gradient overlays for readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.2)_0%,transparent_70%)] rounded-full pointer-events-none" />

                  {/* Top Header of Slide: Kicker + Manual Arrows */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5722] animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-widest text-[#ff7043] flex items-center gap-2">
                        <span>Featured Spotlight</span>
                        <span>•</span>
                        <span>{track.languageName || 'Regional'} Vocal Heritage</span>
                      </span>
                    </div>

                    {/* Manual Arrow Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHeroPrev();
                        }}
                        className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-all backdrop-blur-md shadow-md"
                        title="Previous Master Track"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHeroNext();
                        }}
                        className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-all backdrop-blur-md shadow-md"
                        title="Next Master Track"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Center Content of Slide */}
                  <div className="relative z-10 my-auto py-6 max-w-2xl space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-medium">
                        {track.genreName || 'Classical'}
                      </span>
                      {track.albumTitle && (
                        <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-zinc-300 text-xs truncate max-w-xs">
                          {track.albumTitle}
                        </span>
                      )}
                      {track.isArtistVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          <Check className="w-3 h-3 stroke-[3]" /> Verified Legend
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white drop-shadow-xl leading-tight">
                      {track.title}
                    </h1>

                    <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-orange-400">
                      <span>🎤 {track.artistName}</span>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-300 font-normal">
                        {track.languageName || 'Regional'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed font-normal max-w-xl line-clamp-3">
                      {track.artistBio ||
                        (track.albumTitle
                          ? `Authentic acoustic recording from the verified "${track.albumTitle}" archival release. Mastered directly from regional vocal masters.`
                          : 'Stream authentic studio recordings preserved with high-fidelity acoustics and real acoustic instrumentation.')}
                    </p>

                    {/* Buttons: Play All + Follow */}
                    <div className="pt-2 flex items-center gap-4">
                      <button
                        onClick={() => handlePlaySong(track)}
                        className="flex items-center gap-2.5 px-8 py-3 rounded-full bg-[#ff5722] hover:bg-[#ff6a3d] text-white font-bold text-sm shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isCurrentPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>Listen Now</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => toggleFollow(track.artistId, track.artistName)}
                        disabled={isFollowingThis}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-semibold backdrop-blur-md transition-all ${
                          isArtistFollowed
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                            : 'bg-black/50 hover:bg-black/70 border-white/20 text-zinc-200 hover:text-white'
                        }`}
                      >
                        {isArtistFollowed ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4 text-zinc-400 group-hover:text-red-400" />
                            <span>Follow Artist</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Bottom of Slide: Real Listen Count + Verified Quality */}
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-5 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">
                          {Number(track.playCount || 0).toLocaleString()} Verified Streams
                        </p>
                        <p className="text-[11px] text-zinc-400">Direct studio sync from Postgres</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p
                        className="text-lg sm:text-xl font-serif italic text-white/90 tracking-wide font-light flex items-center sm:justify-end gap-2"
                        style={{ fontFamily: 'Georgia, serif' }}
                      >
                        <span>Pure Regional Acoustics</span>
                        <Sparkles className="w-4 h-4 text-orange-400 inline-block" />
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
                  currentIndex === i
                    ? 'w-7 h-1.5 bg-[#ff5722] shadow-[0_0_8px_#ff5722]'
                    : 'w-2 h-1.5 bg-white/30 hover:bg-white/60'
                }`}
                title={`Jump to track ${i + 1}`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* ────────────────────────────────────────────────────────────
          4. TOP TRENDING MASTER TRACKS (Live from Database)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Trending Master Tracks
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Ranked dynamically by verified listener popularity and total streams
            </p>
          </div>
          <Link
            href="/discover?sort=popularity"
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors"
          >
            Explore All ({catalog?.trending?.length || 0}) →
          </Link>
        </div>

        {/* Dynamic Track Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(catalog?.trending || []).slice(0, 12).map((song) => {
            const isCurrentPlaying = currentSong?.id === song.id && isPlaying;

            return (
              <div
                key={`trending-${song.id}`}
                onClick={() => handlePlaySong(song)}
                className="group p-3 rounded-2xl bg-white dark:bg-[#141622] hover:bg-zinc-50 dark:hover:bg-[#1b1e2e] border border-black/[0.08] dark:border-white/[0.08] hover:border-orange-500/40 transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-0.5"
              >
                {/* Artwork with hover play button */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-100 dark:bg-zinc-800 shadow-xs">
                  <img
                    src={
                      song.artworkUrl ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=75'
                    }
                    alt={song.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover filter brightness-105 contrast-105 group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Floating play overlay */}
                  <div
                    className={`absolute inset-0 bg-black/35 flex items-center justify-center transition-opacity duration-200 ${
                      isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#ff5722] text-white flex items-center justify-center shadow-lg shadow-orange-500/40">
                      {isCurrentPlaying ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                    {song.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {song.artistName}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300 font-medium">
                      {song.languageName || 'Regional'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {Number(song.playCount || 0) > 1000
                        ? `${(Number(song.playCount) / 1000).toFixed(0)}k plays`
                        : `${song.playCount || 0} plays`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          5. EXPLORE BY REGIONAL HERITAGE & LANGUAGE (Database Synced)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Regional Linguistic Heritage
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Original native scripts and curated music collections across India
            </p>
          </div>
          <Link
            href="/discover"
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors"
          >
            All Languages →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {(catalog?.languages || []).map((lang) => (
            <Link
              key={`lang-${lang.id}`}
              href={`/discover?language=${encodeURIComponent(lang.code)}`}
              className="group p-4 rounded-2xl bg-white dark:bg-[#141622] hover:bg-zinc-50 dark:hover:bg-[#1b1e2e] border border-black/[0.08] dark:border-white/[0.08] hover:border-orange-500/40 transition-all flex items-center justify-between shadow-xs hover:shadow-lg"
            >
              <div className="min-w-0 pr-2">
                <p className="text-lg font-black text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors leading-tight">
                  {lang.nativeName || lang.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                  {lang.name}
                </p>
                <p className="text-[10px] text-orange-500 dark:text-orange-400 mt-1 font-semibold">
                  {lang.songCount} {lang.songCount === 1 ? 'Master' : 'Masters'}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/[0.06] group-hover:bg-[#ff5722] flex items-center justify-center transition-colors flex-shrink-0">
                <Play className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-200 group-hover:text-white fill-current ml-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          6. EXPLORE BY SOUND & GENRE (Database Synced)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Explore Soundscapes & Genres
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Classical ragas, Sufi mysticism, and folk compositions direct from Postgres
            </p>
          </div>
          <Link
            href="/discover"
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors"
          >
            All Genres ({catalog?.genres?.length || 0}) →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {(catalog?.genres || []).map((genre) => (
            <Link
              key={`genre-${genre.id}`}
              href={`/discover?genre=${encodeURIComponent(genre.slug)}`}
              className="relative aspect-[16/10] rounded-2xl overflow-hidden p-4 flex flex-col justify-end group border border-black/[0.08] dark:border-white/[0.08] shadow-md hover:border-orange-500/50 hover:shadow-xl transition-all"
            >
              <img
                src={genre.artworkUrl}
                alt={genre.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover filter brightness-105 contrast-105 group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                    {genre.name}
                  </h4>
                  <p className="text-[10px] text-zinc-300 mt-0.5 font-medium">
                    {genre.songCount} {genre.songCount === 1 ? 'Track' : 'Tracks'}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-[#ff5722] flex items-center justify-center transition-colors">
                  <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          7. NEW RELEASES & STUDIO DROPS (Live from Database)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Recent Studio Releases
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Latest acoustic master releases added to the catalog
            </p>
          </div>
          <Link
            href="/discover?sort=recent"
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors"
          >
            See All New Releases →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(catalog?.newReleases || []).slice(0, 6).map((song) => {
            const isCurrentPlaying = currentSong?.id === song.id && isPlaying;

            return (
              <div
                key={`new-${song.id}`}
                onClick={() => handlePlaySong(song)}
                className="group p-3 rounded-2xl bg-white dark:bg-[#141622] hover:bg-zinc-50 dark:hover:bg-[#1b1e2e] border border-black/[0.08] dark:border-white/[0.08] hover:border-orange-500/40 transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-100 dark:bg-zinc-800 shadow-xs">
                  <img
                    src={
                      song.artworkUrl ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=75'
                    }
                    alt={song.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover filter brightness-105 contrast-105 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className={`absolute inset-0 bg-black/35 flex items-center justify-center transition-opacity duration-200 ${
                      isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#ff5722] text-white flex items-center justify-center shadow-lg shadow-orange-500/40">
                      {isCurrentPlaying ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-orange-500 transition-colors">
                    {song.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {song.artistName}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-300 font-medium">
                      {song.languageName || 'Regional'}
                    </span>
                    <span className="text-[10px] text-orange-500 font-semibold">New</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          8. VERIFIED LEGENDS & TOP ARTISTS (Directly from Postgres)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Featured Vocal Legends & Artists
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Masters of Indian classical, devotional, and indigenous folk traditions
            </p>
          </div>
          <Link
            href="/discover"
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors"
          >
            All Vocal Masters →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-5 rounded-3xl bg-white dark:bg-[#12141e] border border-black/[0.08] dark:border-white/[0.08] shadow-xs">
          {(catalog?.topArtists || []).map((artist) => {
            const isFollowed = !!followingMap[artist.id] || !!followingMap[artist.name];

            return (
              <div
                key={`artist-${artist.id}`}
                className="flex flex-col items-center text-center group cursor-pointer"
                onClick={() => router.push(`/discover?search=${encodeURIComponent(artist.name)}`)}
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2.5 border-2 border-transparent group-hover:border-orange-500 transition-all shadow-md">
                  <img
                    src={artist.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                    alt={artist.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover filter brightness-105 contrast-105 group-hover:scale-105 transition-transform duration-300"
                  />
                  {artist.isVerified && (
                    <div
                      className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white dark:border-[#12141e] shadow-md"
                      title="Verified Maestro"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[125px] group-hover:text-orange-500 transition-colors">
                  {artist.name}
                </p>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[120px] mt-0.5">
                  {artist.genreName || `${artist.songCount} Tracks`}
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollow(artist.id, artist.name);
                  }}
                  className={`mt-2 text-[10px] font-semibold px-3 py-1 rounded-full transition-all border ${
                    isFollowed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : 'bg-zinc-100 dark:bg-white/[0.08] hover:bg-orange-500 hover:text-white border-transparent text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {isFollowed ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
