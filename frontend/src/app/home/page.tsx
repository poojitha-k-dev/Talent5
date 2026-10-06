'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Sparkles,
  Heart,
  TrendingUp,
  Award,
  Globe2,
  Headphones,
  ShieldCheck,
  ChevronRight,
  Flame,
  Radio,
  X,
  Music,
  FileText,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Song, Language, Genre, Artist, Competition } from '@talent5/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCompactNumber, formatDuration, formatINR } from '@talent5/utils';
import { RagaSoundscapeExplorer } from '@/components/creative/RagaSoundscapeExplorer';

export default function HomePage() {
  const { currentSong, isPlaying, playSong, togglePlay, setIsLyricsOpen } = useAudio();
  const [data, setData] = useState<{
    trending: Song[];
    newReleases: Song[];
    artists: Artist[];
    languages: Language[];
    genres: Genre[];
    desiContent: any[];
    competitions: Competition[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedGenreSlug, setSelectedGenreSlug] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const quickGenres = [
    { slug: null, label: 'All Vibrations', icon: '🔥' },
    { slug: 'desi-hip-hop', label: 'Desi Hip-Hop', icon: '🎤' },
    { slug: 'punjabi-beats', label: 'Punjabi Beats', icon: '🥁' },
    { slug: 'bollywood-pop', label: 'Bollywood Pop', icon: '✨' },
    { slug: 'folk-fusion', label: 'Folk Fusion', icon: '🪕' },
    { slug: 'sufi-ghazal', label: 'Sufi & Ghazal', icon: '🕊️' },
  ];

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsFiltering(true);
      try {
        const url = selectedLanguage
          ? `/api/v1/catalog/home?language=${encodeURIComponent(selectedLanguage)}`
          : '/api/v1/catalog/home';
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          setData((prev) => ({
            ...json.data,
            languages: prev?.languages?.length ? prev.languages : json.data.languages,
          }));
        }
      } catch (err) {
        console.error('Failed to load home catalog', err);
      } finally {
        setLoading(false);
        setIsFiltering(false);
      }
    };
    fetchHomeData();
  }, [selectedLanguage]);

  // Greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Namaste, Good Morning', sub: 'Start your day with peaceful morning ragas & indie originals' };
    if (hour < 17) return { text: 'Namaste, Good Afternoon', sub: 'Energize your afternoon with high-tempo Desi beats & fusion' };
    return { text: 'Namaste, Good Evening', sub: 'Unwind with soulful melodies, Sufi poetry & independent storytellers' };
  };

  const greeting = getGreeting();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-amber-600 dark:text-amber-400 font-display tracking-widest uppercase">
          Tuning Desi Frequencies...
        </p>
      </div>
    );
  }

  const heroSong = data?.trending?.[0];
  const activeLang = data?.languages?.find((l) => l.code === selectedLanguage);
  const displayedTrending: Song[] = selectedGenreSlug
    ? (data?.trending || []).filter((s) => s.genreSlug === selectedGenreSlug)
    : (data?.trending || []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* 1. HERO SECTION */}
      {heroSong && (
        <section className="relative rounded-3xl overflow-hidden border border-amber-500/20 dark:border-white/10 bg-gradient-to-r from-amber-500/10 via-white to-amber-100/40 dark:from-midnight-950 dark:via-midnight-900 dark:to-amber-950/30 p-6 sm:p-10 shadow-card transition-all">
          <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {activeLang ? `${activeLang.name} Spotlight` : 'Talent5 Spotlight'} • Desi Original
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white leading-tight">
                {heroSong.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 max-w-xl">
                Experience original storytelling by{' '}
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{heroSong.artistName}</span>. 100%
                verified rights-cleared music supporting grassroots Indian creators.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    if (currentSong?.id === heroSong.id) {
                      togglePlay();
                    } else {
                      playSong(heroSong, data.trending);
                    }
                  }}
                  className="gap-2 shadow-saffronGlow"
                >
                  {currentSong?.id === heroSong.id && isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      Pause Track
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                      Play Spotlight Song
                    </>
                  )}
                </Button>

                <Link href="/desi">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 bg-white dark:bg-midnight-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-midnight-700"
                  >
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Explore Desi Music
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-gray-400 pt-2">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" /> 100% Rights Cleared
                </span>
                <span>•</span>
                <span>{heroSong.languageName}</span>
                <span>•</span>
                <span>{heroSong.genreName}</span>
                <span>•</span>
                <span>{formatDuration(heroSong.durationSeconds)}</span>
              </div>
            </div>

            {/* Artwork Card */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-card border border-amber-500/20 dark:border-white/10 flex-shrink-0 group">
              <img
                src={heroSong.artworkUrl}
                alt={heroSong.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <div>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Featured Single
                  </span>
                  <p className="text-sm font-semibold text-white truncate">{heroSong.artistName}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. DYNAMIC GREETING & MULTILINGUAL INDIAN LANGUAGE FILTER */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">{greeting.text}</h2>
            <p className="text-xs text-slate-500 dark:text-gray-400">{greeting.sub}</p>
          </div>
          <Link
            href="/music"
            className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline transition-colors"
          >
            <span>View All Languages</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 13 Indian Languages Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedLanguage(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedLanguage === null
                ? 'bg-amber-500 text-slate-950 shadow-saffronGlow font-bold'
                : 'bg-white dark:bg-midnight-800 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-midnight-700 border border-slate-200 dark:border-white/10'
            }`}
          >
            All Languages
          </button>
          {data?.languages.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(isSelected ? null : lang.code)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-saffronGlow font-bold scale-105'
                    : 'bg-white dark:bg-midnight-800 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-midnight-700 border border-slate-200 dark:border-white/10'
                }`}
              >
                <span>{lang.name}</span>
                <span className="text-[10px] opacity-70">({lang.nativeName})</span>
              </button>
            );
          })}
        </div>

        {/* Active Language Filter Feedback Indicator */}
        {activeLang && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 animate-fadeIn text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                Filtered by {activeLang.name} ({activeLang.nativeName})
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 dark:text-gray-400">
                {data?.trending.length || 0} tracks featured
              </span>
            </div>
            <button
              onClick={() => setSelectedLanguage(null)}
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold transition-colors flex items-center gap-1.5 text-[11px]"
            >
              <span>Clear Filter</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* 3. TRENDING NOW SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {activeLang ? `Trending ${activeLang.name} Music` : 'Trending Now in India'}
            </h2>
            {selectedGenreSlug && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                {displayedTrending.length} Tracks
              </span>
            )}
          </div>
          <Link
            href={activeLang ? `/music?language=${activeLang.code}` : '/music'}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline transition-colors"
          >
            See All
          </Link>
        </div>

        {/* Quick Genre Mood Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickGenres.map((g) => {
            const isAct = selectedGenreSlug === g.slug;
            return (
              <button
                key={g.label}
                type="button"
                onClick={() => setSelectedGenreSlug(isAct ? null : g.slug)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isAct
                    ? 'bg-amber-500 text-midnight-950 font-bold shadow-saffronGlow scale-105'
                    : 'bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-amber-500/40 hover:text-amber-500'
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>

        {isFiltering ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/5 border border-white/5" />
            ))}
          </div>
        ) : displayedTrending.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              No tracks found matching this filter
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Try choosing another vibe or clear the filter to explore all verified Indian music.
            </p>
            <button
              onClick={() => setSelectedGenreSlug(null)}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-saffronGlow"
            >
              Reset Vibe Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {displayedTrending.map((song) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className="group rounded-2xl p-3 flex flex-col relative overflow-hidden transition-all bg-white/80 dark:bg-midnight-900/60 border border-slate-200/80 dark:border-white/5 hover:border-amber-500/40 hover:-translate-y-1 shadow-sm hover:shadow-card"
                >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-midnight-800 mb-3">
                  <img
                    src={song.artworkUrl}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Play Button Overlay */}
                  <button
                    onClick={() => {
                      if (isCurrent) togglePlay();
                      else playSong(song, displayedTrending);
                    }}
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-saffronGlow transform hover:scale-110 active:scale-95 transition-transform">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </div>
                  </button>

                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span
                      title="100% Rights Cleared Pure Vocal"
                      className="p-1 rounded-full bg-black/70 text-emerald-400 flex items-center justify-center border border-emerald-500/30"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!currentSong || currentSong.id !== song.id) {
                          playSong(song, displayedTrending);
                        }
                        setIsLyricsOpen(true);
                      }}
                      title="Open Synced Lyrics"
                      className="p-1.5 rounded-full bg-black/70 hover:bg-amber-500 text-amber-300 hover:text-midnight-950 border border-amber-500/40 transition-colors shadow-sm pointer-events-auto"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/song/${song.id}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 truncate block transition-colors drop-shadow-sm"
                    title={song.title}
                  >
                    {song.title}
                  </Link>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate mt-0.5" title={song.artistName}>
                    {song.artistName || 'Talent5 Artist'}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                    {song.languageName}
                  </span>
                  <span className="flex items-center gap-1 text-rose-500 font-bold text-xs">
                    <Heart className="w-3 h-3 fill-current" />
                    {formatCompactNumber(song.validLikesCount || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>

      {/* 4. ANCIENT & CONTEMPORARY RAGA MOOD EXPLORER */}
      <section>
        <RagaSoundscapeExplorer />
      </section>

      {/* 5. DESI ORIGINAL MUSIC SPOTLIGHT */}
      <section className="space-y-4 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-teal-500/10 via-white to-amber-50/50 dark:from-teal-950/40 dark:via-midnight-900 dark:to-midnight-950 border border-teal-500/20 shadow-card">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Desi Music Spotlight</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-full">
                Independent Creators
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-400">
              Original compositions, folk innovators, and underground street rap directly from approved Desi creators.
            </p>
          </div>
          <Link
            href="/desi"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>Enter Desi Hub</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {data?.desiContent.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-midnight-900/60 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all"
            >
              <div className="relative aspect-video bg-slate-900">
                <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                <button
                  onClick={() =>
                    playSong({
                      id: item.songId,
                      title: item.title,
                      slug: item.id,
                      artistId: item.creatorId,
                      artistName: item.creatorName,
                      durationSeconds: item.durationSeconds || 200,
                      audioUrl: item.audioUrl,
                      artworkUrl: item.coverUrl,
                      languageId: '1',
                      genreId: '1',
                      releaseDate: '2026-01-01',
                      isExplicit: false,
                      playCount: item.playCount,
                      rawLikesCount: item.validLikesCount,
                      validLikesCount: item.validLikesCount,
                      popularityScore: 90,
                      status: 'PUBLISHED',
                      featuredArtists: [],
                      createdAt: new Date().toISOString(),
                    })
                  }
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-peacockGlow transform hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300 uppercase">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-gray-400">• {item.languageName}</span>
                  </div>
                  <h3 className="text-base font-bold font-display text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">By {item.creatorName}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-gray-400">
                  <span>{formatCompactNumber(item.viewsCount)} views</span>
                  <span className="text-teal-600 dark:text-teal-400 font-semibold">
                    {formatCompactNumber(item.validLikesCount)} Valid Likes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. POPULAR ARTISTS & REGIONAL CREATORS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Popular Desi Artists</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data?.artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artist/${artist.id}`}
              className="rounded-2xl p-4 flex flex-col items-center text-center group bg-white/80 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/5 hover:border-amber-500/40 hover:-translate-y-1 shadow-sm hover:shadow-card transition-all"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 border-2 border-amber-500/30 group-hover:border-amber-500 transition-colors shadow-card">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {artist.name}
                </h3>
                {artist.isVerified && <Badge type="verified" />}
              </div>

              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 line-clamp-2">{artist.bio}</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400/80 font-medium mt-2">
                {formatCompactNumber(artist.followersCount)} Followers
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. COMPETITIONS & TALENT CHALLENGES */}
      {data?.competitions && data.competitions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                Live Competitions & Challenges
              </h2>
            </div>
            <Link
              href="/competitions"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              View All Challenges
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {data.competitions.map((comp) => (
              <div
                key={comp.id}
                className="rounded-2xl p-6 flex flex-col justify-between border border-amber-500/20 bg-white/80 dark:bg-midnight-900/60 shadow-sm hover:shadow-card relative overflow-hidden transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                      Prize Pool: {formatINR(comp.prizeINR)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">Ends: {comp.endDate}</span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">{comp.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-gray-300 line-clamp-2">{comp.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-gray-400">
                    Languages: {comp.eligibleLanguages.slice(0, 3).join(', ')}...
                  </span>
                  <Link href={`/competitions`}>
                    <Button variant="primary" size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                      Enter Challenge
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
