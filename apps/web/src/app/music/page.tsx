'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Play,
  Pause,
  Filter,
  SlidersHorizontal,
  Music,
  Heart,
  ShieldCheck,
  Search,
  FileText,
  X,
  Globe2,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Song, Language, Genre } from '@talent5/types';
import { formatCompactNumber, formatDuration } from '@talent5/utils';
import { Button } from '@/components/ui/Button';

function MusicBrowseContent() {
  const searchParams = useSearchParams();
  const initialLang = searchParams.get('language') || '';

  const { currentSong, isPlaying, playSong, togglePlay, setIsLyricsOpen } = useAudio();
  const [songs, setSongs] = useState<Song[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLang);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Load language and genre metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const homeRes = await fetch('/api/v1/catalog/home');
        if (homeRes.ok) {
          const json = await homeRes.json();
          setLanguages(json.data.languages || []);
          setGenres(json.data.genres || []);
        }
      } catch (e) {
        console.error('Metadata load error', e);
      }
    };
    fetchMetadata();
  }, []);

  // Update selected language if URL search param changes
  useEffect(() => {
    const queryLang = searchParams.get('language');
    if (queryLang !== null) {
      setSelectedLanguage(queryLang);
    }
  }, [searchParams]);

  // Fetch songs when filters change (limit=300 for full multilingual catalog)
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('limit', '300');
        if (selectedLanguage) params.set('language', selectedLanguage);
        if (selectedGenre) params.set('genre', selectedGenre);
        if (sortBy) params.set('sortBy', sortBy);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());

        const res = await fetch(`/api/v1/catalog/songs?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setSongs(json.data || []);
        }
      } catch (err) {
        console.error('Failed to load songs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [selectedLanguage, selectedGenre, sortBy, searchQuery]);

  const activeLangObj = languages.find((l) => l.code === selectedLanguage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Music className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              All-India Vocal Music Collection
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Explore All 281 Songs
          </h1>
          <p className="text-sm font-medium text-slate-200 mt-1 max-w-2xl">
            Stream authentic, 100% human vocal performances across all Indian languages with full synchronized lyrics.
          </p>
        </div>

        {/* Quick Search */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search title, artist, or raga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-midnight-900 border border-white/15 rounded-full text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-inner"
          />
        </div>
      </div>

      {/* Prominent Multi-Language Pills Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Globe2 className="w-4 h-4" /> Filter by Language
          </span>
          {selectedLanguage && (
            <button
              onClick={() => setSelectedLanguage('')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Show All Languages</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedLanguage('')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedLanguage === ''
                ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow scale-105'
                : 'bg-midnight-800 text-slate-200 hover:bg-midnight-700 hover:text-white border border-white/10'
              }`}
          >
            All Languages ({languages.reduce((acc, l) => acc + ((l as any).songCount || 0), 0) || 281})
          </button>
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            const count = (lang as any).songCount;
            return (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(isSelected ? '' : lang.code)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${isSelected
                    ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow font-bold scale-105'
                    : 'bg-midnight-800 text-slate-200 hover:bg-midnight-700 hover:text-white border border-white/10'
                  }`}
              >
                <span>{lang.name}</span>
                <span className="text-[10px] opacity-80">({lang.nativeName})</span>
                {count ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-midnight-950/30 text-midnight-950' : 'bg-white/10 text-amber-300'
                    }`}>
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-midnight-900/80 border border-white/10 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Genre:
          </span>

          {/* Genre Dropdown */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-midnight-800 border border-white/15 text-xs font-semibold text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="">All Genres ({genres.length})</option>
            {genres.map((g) => (
              <option key={g.slug} value={g.slug}>
                {g.name}
              </option>
            ))}
          </select>

          {(selectedLanguage || selectedGenre || searchQuery) && (
            <button
              onClick={() => {
                setSelectedLanguage('');
                setSelectedGenre('');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Results Count & Sort Dropdown */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-300">
            Showing <strong className="text-white font-bold">{songs.length}</strong> songs
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-midnight-800 border border-white/15 text-xs font-semibold text-slate-100 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="popularity">Most Popular</option>
              <option value="recent">Newest Releases</option>
              <option value="likes">Most Validated Likes</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Song Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs text-amber-400 uppercase tracking-widest font-mono font-bold">
            Loading {activeLangObj ? `${activeLangObj.name} Tracks...` : 'All Multilingual Songs...'}
          </p>
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-20 bg-midnight-900/50 rounded-3xl border border-white/10 p-8">
          <Music className="w-14 h-14 text-amber-400 mx-auto mb-4 opacity-70" />
          <h3 className="text-xl font-bold text-white mb-2">No songs match your filters</h3>
          <p className="text-sm font-medium text-slate-300 max-w-sm mx-auto mb-6">
            Try choosing a different language or clearing search filters.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setSelectedLanguage('');
              setSelectedGenre('');
              setSearchQuery('');
            }}
            className="font-bold text-midnight-950"
          >
            Show All Songs (281)
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {songs.map((song) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <div
                key={song.id}
                className="group glass-panel glass-panel-hover rounded-2xl p-3 flex flex-col relative overflow-hidden transition-all border border-white/10 hover:border-amber-500/40"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-midnight-800 mb-3 shadow-md">
                  <img
                    src={song.artworkUrl}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Play Button Overlay */}
                  <button
                    onClick={() => {
                      if (isCurrent) togglePlay();
                      else playSong(song, songs);
                    }}
                    title={isCurrent && isPlaying ? 'Pause' : 'Play Song'}
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-midnight-950 flex items-center justify-center shadow-saffronGlow transform hover:scale-110 active:scale-95 transition-transform">
                      {isCurrent && isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      )}
                    </div>
                  </button>

                  {/* Top Badges: Rights Check & Quick Lyrics */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span
                      title="100% Verified Pure Vocal Master"
                      className="p-1 rounded-full bg-black/70 text-emerald-400 flex items-center justify-center border border-emerald-500/30"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>

                    {/* Quick Lyrics Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!currentSong || currentSong.id !== song.id) {
                          playSong(song, songs);
                        }
                        setIsLyricsOpen(true);
                      }}
                      title="Open Synced Lyrics for this song"
                      className="pointer-events-auto p-1.5 rounded-full bg-black/70 hover:bg-amber-500 text-amber-300 hover:text-midnight-950 border border-amber-500/40 transition-colors shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/song/${song.id}`}
                    className="text-sm font-bold text-white hover:text-amber-400 truncate block transition-colors drop-shadow-sm"
                    title={song.title}
                  >
                    {song.title}
                  </Link>
                  <Link
                    href={`/artist/${song.artistId}`}
                    className="text-xs font-semibold text-slate-300 hover:text-white truncate block mt-0.5"
                    title={song.artistName}
                  >
                    {song.artistName}
                  </Link>
                </div>

                {/* Card Footer: Language Badge & Valid Likes */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                    {song.languageName}
                  </span>
                  <span className="flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                    <Heart className="w-3 h-3 fill-current" />
                    {formatCompactNumber(song.validLikesCount || 0)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MusicBrowsePage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-gray-400">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          Loading music catalog...
        </div>
      }
    >
      <MusicBrowseContent />
    </React.Suspense>
  );
}
