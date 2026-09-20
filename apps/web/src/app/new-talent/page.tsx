'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Mic2,
  Sparkles,
  Play,
  Pause,
  Heart,
  Users,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Flame,
  Award,
  Upload,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Song, Artist, Competition } from '@talent5/types';
import { SongRow } from '@/components/ui/SongRow';
import { Button } from '@/components/ui/Button';
import { formatCompactNumber } from '@talent5/utils';

export default function NewTalentPage() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { user, token } = useAuth();

  const [data, setData] = useState<{
    risingArtists: any[];
    newOriginals: Song[];
    trendingCreators: any[];
    challenges: Competition[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'ALL', name: 'All Categories' },
    { id: 'SINGER', name: 'Singers & Songwriters' },
    { id: 'FOLK', name: 'Folk Innovation' },
    { id: 'RAPPER', name: 'Rap & Hip-Hop' },
    { id: 'CLASSICAL', name: 'Classical Indian' },
  ];

  useEffect(() => {
    const fetchNewTalent = async () => {
      setLoading(true);
      try {
        const url =
          selectedCategory === 'ALL'
            ? '/api/v1/catalog/new-talent'
            : `/api/v1/catalog/new-talent?category=${selectedCategory}`;

        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load new talent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewTalent();
  }, [selectedCategory]);

  // Fetch likes
  useEffect(() => {
    if (!token) return;
    fetch('/api/v1/library', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setLikedIds(new Set((json.data.likedSongs || []).map((s: any) => s.id)));
        }
      })
      .catch(() => {});
  }, [token]);

  const handleLikeToggle = async (songId: string) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const isLiked = likedIds.has(songId);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(songId);
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

  const isCreator = Array.isArray(user?.roles) && user.roles.includes('CREATOR');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* ────────────────────────────────────────────────────────────
          1. HEADER BANNER
      ──────────────────────────────────────────────────────────── */}
      <section className="relative rounded-3xl overflow-hidden p-6 sm:p-10 bg-gradient-to-r from-amber-500/15 via-teal-500/10 to-amber-500/5 border border-amber-500/20 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Mic2 className="w-3.5 h-3.5" />
              <span>The Next Voice Could Be Here</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight">
              New Talent Spotlight
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Discover authentic, undiscovered singers and independent composers across India. Hear original debut singles before anyone else.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <Link href={isCreator ? '/creator-studio/upload' : '/creator-studio/apply'}>
              <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 font-bold text-midnight-950 shadow-saffronGlow">
                <Upload className="w-4 h-4" />
                <span>{isCreator ? 'Submit Original Song' : 'Become a Creator'}</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          2. CATEGORY SELECTOR PILLS
      ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow'
                : 'bg-black/5 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ────────────────────────────────────────────────────────────
          3. RISING ARTISTS (CREATOR CARDS WITH METRICS)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Rising Independent Voices</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Creators gaining verified organic streams and community backing.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-3xl bg-black/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (data?.risingArtists || []).length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No creators found in this category yet. Be the first to submit!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data!.risingArtists.map((artist) => {
              const hasLatestSong = !!artist.latestSongTitle;

              return (
                <div
                  key={artist.id}
                  className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white/70 dark:bg-midnight-900/80 border border-black/5 dark:border-white/10 hover:border-amber-500/40 hover:bg-white/95 dark:hover:bg-midnight-800/90 transition-all duration-300 shadow-sm hover:shadow-card"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-midnight-800 flex-shrink-0 border border-amber-500/20 group-hover:border-amber-500 transition-colors shadow-md">
                      <img
                        src={artist.avatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/artist/${artist.id}`}
                          className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate"
                        >
                          {artist.name}
                        </Link>
                        {artist.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {artist.category || 'Singer'} • {artist.city || 'India'}
                      </p>

                      {/* Verified stats */}
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300 font-mono mt-2">
                        <span>{formatCompactNumber(artist.followersCount || 0)} followers</span>
                        <span>•</span>
                        <span>{formatCompactNumber(artist.totalPlays || 0)} plays</span>
                      </div>
                    </div>
                  </div>

                  {/* Latest Original Single */}
                  {hasLatestSong && (
                    <div className="mt-4 pt-3.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 block">
                          Latest Release
                        </span>
                        <Link
                          href={`/song/${artist.latestSongId}`}
                          className="text-xs font-semibold text-slate-800 dark:text-gray-200 hover:text-amber-500 truncate block mt-0.5"
                        >
                          {artist.latestSongTitle}
                        </Link>
                      </div>

                      <Link href={`/artist/${artist.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs font-semibold">
                          Listen
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ────────────────────────────────────────────────────────────
          4. NEW ORIGINALS (RECENT CREATOR TRACKS)
      ──────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
              New Originals
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Fresh tracks composed and performed by independent artists.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(data?.newOriginals || []).map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              isLiked={likedIds.has(song.id)}
              onLike={handleLikeToggle}
              playlistContext={data?.newOriginals}
            />
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          5. COMMUNITY CHALLENGES
      ──────────────────────────────────────────────────────────── */}
      {data?.challenges && data.challenges.length > 0 && (
        <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-teal-500/10 to-amber-500/10 border border-teal-500/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-500">
                <Trophy className="w-3.5 h-3.5" />
                <span>Auditions & Tournaments</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black font-display text-slate-900 dark:text-white mt-1">
                Creator Challenges
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Submit an original track to active competitions and win verified community funding.
              </p>
            </div>

            <Link href="/competitions">
              <Button variant="peacock" size="sm" className="gap-1.5 font-bold text-midnight-950">
                <span>View All Challenges</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.challenges.map((comp) => (
              <div
                key={comp.id}
                className="p-4 rounded-2xl bg-white/80 dark:bg-midnight-900 border border-black/5 dark:border-white/10 space-y-2 shadow-sm"
              >
                <span className="text-[10px] font-bold text-teal-500 uppercase tracking-wider">
                  Ends: {new Date(comp.endDate).toLocaleDateString()}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {comp.title}
                </h3>
                <Link
                  href={`/competitions/${comp.id}`}
                  className="text-xs font-semibold text-amber-500 hover:underline block pt-2"
                >
                  Enter Challenge →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
