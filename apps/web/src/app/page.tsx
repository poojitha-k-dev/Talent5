'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
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
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Song, Artist, Competition } from '@talent5/types';
import { SongRow } from '@/components/ui/SongRow';
import { TrackCard } from '@/components/ui/TrackCard';
import { ArtistCard } from '@/components/ui/ArtistCard';
import { Button } from '@/components/ui/Button';
import { HeroSkeleton, SongRowSkeleton, TrackCardSkeleton } from '@/components/ui/SkeletonLoader';
import { formatCompactNumber, formatINR } from '@talent5/utils';

export default function HomePage() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { user, token } = useAuth();

  const [data, setData] = useState<{
    trending: Song[];
    newReleases: Song[];
    artists: Artist[];
    risingArtists: Artist[];
    newVoices: Song[];
    recentlyPlayed: Song[];
    competitions: Competition[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchHomeFeed = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/v1/catalog/home', { headers });
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load home catalog feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeFeed();
  }, [token]);

  // Fetch initial user likes and saved songs if logged in
  useEffect(() => {
    if (!token) return;
    fetch('/api/v1/library', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const likes = new Set<string>((json.data.likedSongs || []).map((s: any) => s.id));
          setLikedIds(likes);
        }
      })
      .catch(() => {});
  }, [token]);

  const handleLikeToggle = async (songId: string) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const isCurrentlyLiked = likedIds.has(songId);
    // Optimistic UI update
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyLiked) next.delete(songId);
      else next.add(songId);
      return next;
    });

    try {
      await fetch('/api/v1/social/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetType: 'SONG', targetId: songId }),
      });
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const handleSaveToggle = async (songId: string) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const isCurrentlySaved = savedIds.has(songId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(songId);
      else next.add(songId);
      return next;
    });

    try {
      await fetch('/api/v1/library/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songId }),
      });
    } catch (err) {
      console.error('Save toggle error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <HeroSkeleton />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <TrackCardSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <SongRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const heroSong = data?.trending?.[0];
  const isHeroPlaying = heroSong && currentSong?.id === heroSong.id && isPlaying;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
      {/* ────────────────────────────────────────────────────────────
          1. HERO SECTION: "Music from real voices. Discover who's next."
      ──────────────────────────────────────────────────────────── */}
      <section className="relative rounded-3xl overflow-hidden border border-amber-500/20 dark:border-white/10 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 dark:from-midnight-950 dark:via-midnight-900 dark:to-amber-950/20 p-6 sm:p-10 lg:p-12 shadow-card">
        <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pure Human Vocals • 100% Original Stories</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-slate-950 dark:text-white tracking-tight leading-[1.1]">
              Music from real voices. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-teal-400">
                Discover who’s next.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl font-normal leading-relaxed">
              Stream authentic regional Indian music, sing along with synchronized lyrics, and empower the next generation of independent vocalists.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {heroSong && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    if (isHeroPlaying) togglePlay();
                    else playSong(heroSong, data?.trending);
                  }}
                  className="gap-2.5 font-bold shadow-saffronGlow text-midnight-950"
                >
                  {isHeroPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current" />
                  )}
                  <span>{isHeroPlaying ? 'Pause Playback' : 'Start Listening'}</span>
                </Button>
              )}

              <Link href="/new-talent">
                <Button variant="secondary" size="lg" className="gap-2 font-semibold border-amber-500/30 hover:border-amber-500">
                  <Mic2 className="w-4 h-4 text-amber-500" />
                  <span>Discover New Talent</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Featured Card */}
          {heroSong && (
            <div
              onClick={() => {
                if (isHeroPlaying) togglePlay();
                else playSong(heroSong, data?.trending);
              }}
              className="group relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 cursor-pointer border border-white/10 hover:scale-105 transition-all duration-300"
            >
              <img
                src={heroSong.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600'}
                alt={heroSong.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight-950/90 via-midnight-950/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Trending Spotlight
                </span>
                <h3 className="text-base font-bold text-white truncate">{heroSong.title}</h3>
                <p className="text-xs text-gray-300 truncate">{heroSong.artistName}</p>
              </div>

              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-500 text-midnight-950 flex items-center justify-center shadow-lg">
                {isHeroPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          2. CONTINUE LISTENING (Recently Played)
      ──────────────────────────────────────────────────────────── */}
      {data?.recentlyPlayed && data.recentlyPlayed.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
                Continue Listening
              </h2>
            </div>
            <Link
              href="/library"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              View History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.recentlyPlayed.slice(0, 6).map((song) => (
              <TrackCard key={song.id} song={song} playlistContext={data.recentlyPlayed} />
            ))}
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────
          3. MADE FOR YOU (Curated Regional Highlights)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
              Made For You
            </h2>
          </div>
          <Link
            href="/discover"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            Explore Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(data?.trending || []).slice(0, 6).map((song) => (
            <TrackCard key={song.id} song={song} playlistContext={data?.trending} />
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          4. NEW RELEASES (Freshly Published Songs)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
              New Releases
            </h2>
          </div>
          <Link
            href="/discover?sort=newest"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            See All Releases <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(data?.newReleases || []).slice(0, 6).map((song) => (
            <TrackCard key={song.id} song={song} playlistContext={data?.newReleases} />
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          5. NEW VOICES (Original Independent Creator Singles)
      ──────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-teal-500/10 to-transparent border border-teal-500/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-500">
              <Mic2 className="w-3.5 h-3.5" />
              <span>Independent Creator Spotlight</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black font-display text-slate-900 dark:text-white mt-1">
              New Voices
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Fresh vocal talents breaking through with 100% authentic original compositions.
            </p>
          </div>

          <Link href="/new-talent">
            <Button variant="peacock" size="sm" className="gap-1.5 font-bold text-midnight-950">
              <span>View All New Talent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(data?.newVoices || data?.trending || []).slice(0, 6).map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              isLiked={likedIds.has(song.id)}
              onLike={handleLikeToggle}
              isSaved={savedIds.has(song.id)}
              onSave={handleSaveToggle}
              playlistContext={data?.newVoices}
            />
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          6. RISING ARTISTS (Creators Gaining Genuine Engagement)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
              Rising Artists
            </h2>
          </div>
          <Link
            href="/new-talent"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            Meet Creators <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(data?.risingArtists || data?.artists || []).slice(0, 6).map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          7. TRENDING MUSIC (Popular Tracks with Synced Lyrics)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
              Trending Music
            </h2>
          </div>
          <Link
            href="/discover"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            Browse Top Charts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(data?.trending || []).slice(0, 10).map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              isLiked={likedIds.has(song.id)}
              onLike={handleLikeToggle}
              isSaved={savedIds.has(song.id)}
              onSave={handleSaveToggle}
              playlistContext={data?.trending}
            />
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          8. COMPETITIONS & CHALLENGES (Current Prizes & Tournaments)
      ──────────────────────────────────────────────────────────── */}
      {data?.competitions && data.competitions.length > 0 && (
        <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border border-amber-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500">
                <Trophy className="w-3.5 h-3.5" />
                <span>Regional Tournaments</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
                Active Challenges
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Compete with independent vocalists across India or vote for your favorite performers.
              </p>
            </div>

            <Link href="/competitions">
              <Button variant="primary" size="md" className="gap-2 font-bold text-midnight-950">
                <Award className="w-4 h-4" /> All Challenges
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.competitions.map((comp) => (
              <div
                key={comp.id}
                className="flex flex-col justify-between p-5 rounded-2xl bg-white/80 dark:bg-midnight-900 border border-black/5 dark:border-white/10 hover:border-amber-500/40 transition-all shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                      {comp.status}
                    </span>
                    <span className="font-mono text-emerald-500 font-bold">
                      Prize: {formatINR(comp.prizeINR || 0)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {comp.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {comp.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Ends: {new Date(comp.endDate).toLocaleDateString()}
                  </span>
                  <Link href={`/competitions/${comp.id}`}>
                    <Button variant="secondary" size="sm" className="text-xs">
                      View Challenge
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
