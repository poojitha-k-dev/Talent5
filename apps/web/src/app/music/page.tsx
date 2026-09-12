'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Filter,
  SlidersHorizontal,
  Music,
  Heart,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Song, Language, Genre } from '@talent5/types';
import { formatCompactNumber, formatDuration } from '@talent5/utils';
import { Button } from '@/components/ui/Button';

export default function MusicBrowsePage() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const [songs, setSongs] = useState<Song[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
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

  // Fetch songs when filters change
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
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
              Music Streaming Catalog
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Explore All Music
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Stream verified, rights-cleared tracks across 13 Indian languages, from classical ragas to contemporary street beats.
          </p>
        </div>

        {/* Quick Search */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter title or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-midnight-900 border border-white/10 rounded-full text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-midnight-900/60 border border-white/5 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* Language Dropdown */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-midnight-800 border border-white/10 text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="">All Indian Languages ({languages.length})</option>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name} ({l.nativeName})
              </option>
            ))}
          </select>

          {/* Genre Dropdown */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-midnight-800 border border-white/10 text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
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
              className="text-xs text-amber-400 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-midnight-800 border border-white/10 text-xs text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="popularity">Most Popular</option>
            <option value="recent">Newest Releases</option>
            <option value="likes">Most Validated Likes</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Song Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">
            Loading Catalog Tracks...
          </p>
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-20 bg-midnight-900/30 rounded-3xl border border-white/5">
          <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No songs match your filters</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            Try adjusting your language or genre filter to discover more Desi music.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedLanguage('');
              setSelectedGenre('');
              setSearchQuery('');
            }}
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {songs.map((song) => {
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
                  <button
                    onClick={() => {
                      if (isCurrent) togglePlay();
                      else playSong(song, songs);
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
                      title="100% Rights Cleared"
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
                  <Link
                    href={`/artist/${song.artistId}`}
                    className="text-xs text-gray-400 hover:text-gray-200 truncate block mt-0.5"
                  >
                    {song.artistName}
                  </Link>
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
      )}
    </div>
  );
}
