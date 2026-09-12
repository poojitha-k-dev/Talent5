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
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Song, Language, Genre, Artist, Competition } from '@talent5/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCompactNumber, formatDuration, formatINR } from '@talent5/utils';

export default function HomePage() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
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

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch('/api/v1/catalog/home');
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error('Failed to load home catalog', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Namaste, Good Morning', sub: 'Start your day with peaceful morning ragas' };
    if (hour < 17) return { text: 'Namaste, Good Afternoon', sub: 'Energize your afternoon with Desi beats' };
    return { text: 'Namaste, Good Evening', sub: 'Unwind with soulful indie melodies & originals' };
  };

  const greeting = getGreeting();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-amber-400 font-display tracking-widest uppercase">
          Tuning Desi Frequencies...
        </p>
      </div>
    );
  }

  const heroSong = data?.trending?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* 1. HERO SECTION */}
      {heroSong && (
        <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-midnight-950 via-midnight-900 to-amber-950/30 p-6 sm:p-10 shadow-2xl">
          <div className="absolute inset-0 bg-radial-gradient opacity-40 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Talent5 Spotlight • Desi Original</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white leading-tight">
                {heroSong.title}
              </h1>

              <p className="text-sm sm:text-base text-gray-300 max-w-xl">
                Experience original storytelling by{' '}
                <span className="text-amber-400 font-semibold">{heroSong.artistName}</span>. 100%
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
                  className="gap-2 text-midnight-950 font-bold"
                >
                  {currentSong?.id === heroSong.id && isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current ml-0.5" /> Play Spotlight
                    </>
                  )}
                </Button>

                <Link href="/desi">
                  <Button variant="secondary" size="lg" className="gap-2">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    Explore Desi Music
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400 pt-2">
                <span className="flex items-center gap-1 text-emerald-400">
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
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-card border border-white/10 flex-shrink-0 group">
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
            <h2 className="text-2xl font-bold font-display text-white">{greeting.text}</h2>
            <p className="text-xs text-gray-400">{greeting.sub}</p>
          </div>
          <Link
            href="/music"
            className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
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
                ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow'
                : 'bg-midnight-800 text-gray-300 hover:bg-midnight-700 border border-white/10'
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
                    ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow'
                    : 'bg-midnight-800 text-gray-300 hover:bg-midnight-700 border border-white/10'
                }`}
              >
                <span>{lang.name}</span>
                <span className="text-[10px] opacity-70">({lang.nativeName})</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. TRENDING NOW SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold font-display text-white">Trending Now in India</h2>
          </div>
          <Link
            href="/music"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            See All
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data?.trending.map((song) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                className="group glass-panel glass-panel-hover rounded-2xl p-3 flex flex-col relative overflow-hidden transition-all"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-midnight-800 mb-3">
                  <img
                    src={song.artworkUrl}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Play Button Overlay */}
                  <button
                    onClick={() => {
                      if (isCurrent) togglePlay();
                      else playSong(song, data.trending);
                    }}
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-amber-500 text-midnight-950 flex items-center justify-center shadow-saffronGlow transform hover:scale-110 active:scale-95 transition-transform">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </div>
                  </button>

                  <div className="absolute top-2 right-2">
                    <span
                      title="Rights Cleared"
                      className="p-1 rounded-full bg-black/60 text-emerald-400 flex items-center justify-center"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/music/${song.slug || song.id}`}
                    className="text-sm font-semibold text-white hover:text-amber-400 truncate block transition-colors"
                  >
                    {song.title}
                  </Link>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {song.artistName || 'Talent5 Artist'}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px] text-gray-500">
                  <span>{song.languageName}</span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <Heart className="w-3 h-3 fill-current" />
                    {formatCompactNumber(song.validLikesCount || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. DESI ORIGINAL MUSIC SPOTLIGHT */}
      <section className="space-y-4 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-teal-950/40 via-midnight-900 to-midnight-950 border border-teal-500/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h2 className="text-xl font-bold font-display text-white">Desi Music Spotlight</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                Independent Creators
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Original compositions, folk innovators, and underground street rap directly from approved Desi creators.
            </p>
          </div>
          <Link
            href="/desi"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>Enter Desi Hub</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {data?.desiContent.map((item) => (
            <div
              key={item.id}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col border border-white/10"
            >
              <div className="relative aspect-video bg-midnight-950">
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
                  <div className="w-12 h-12 rounded-full bg-teal-500 text-midnight-950 flex items-center justify-center shadow-peacockGlow transform hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 uppercase">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400">• {item.languageName}</span>
                  </div>
                  <h3 className="text-base font-bold font-display text-white truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">By {item.creatorName}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
                  <span>{formatCompactNumber(item.viewsCount)} views</span>
                  <span className="text-teal-400 font-semibold">
                    {formatCompactNumber(item.validLikesCount)} Valid Likes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. POPULAR ARTISTS & REGIONAL CREATORS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold font-display text-white">Popular Desi Artists</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {data?.artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artist/${artist.id}`}
              className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 border-2 border-amber-500/30 group-hover:border-amber-500 transition-colors shadow-card">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  {artist.name}
                </h3>
                {artist.isVerified && <Badge type="verified" />}
              </div>

              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{artist.bio}</p>
              <p className="text-[11px] text-amber-400/80 font-medium mt-2">
                {formatCompactNumber(artist.followersCount)} Followers
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. COMPETITIONS & TALENT CHALLENGES */}
      {data?.competitions && data.competitions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold font-display text-white">
                Live Competitions & Challenges
              </h2>
            </div>
            <Link
              href="/competitions"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              View All Challenges
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {data.competitions.map((comp) => (
              <div
                key={comp.id}
                className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-amber-500/20 relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                      Prize Pool: {formatINR(comp.prizeINR)}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">Ends: {comp.endDate}</span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-white">{comp.title}</h3>
                  <p className="text-xs text-gray-300 line-clamp-2">{comp.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Languages: {comp.eligibleLanguages.slice(0, 3).join(', ')}...
                  </span>
                  <Link href={`/competitions`}>
                    <Button variant="primary" size="sm">
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
