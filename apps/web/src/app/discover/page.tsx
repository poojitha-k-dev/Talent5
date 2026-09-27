'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Compass,
  Filter,
  Search,
  Grid,
  List,
  Sparkles,
  Music,
  Globe2,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Song, Language, Genre } from '@talent5/types';
import { SongRow } from '@/components/ui/SongRow';
import { TrackCard } from '@/components/ui/TrackCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SongRowSkeleton, TrackCardSkeleton } from '@/components/ui/SkeletonLoader';
import { RagaSoundscapeExplorer } from '@/components/creative/RagaSoundscapeExplorer';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialLang = searchParams.get('language') || '';
  const initialSort = searchParams.get('sort') || 'popularity';

  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { token } = useAuth();

  const [songs, setSongs] = useState<Song[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLang);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showRagaExplorer, setShowRagaExplorer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Load language and genre metadata
  useEffect(() => {
    fetch('/api/v1/catalog/home')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setLanguages(json.data.languages || []);
          setGenres(json.data.genres || []);
        }
      })
      .catch((err) => console.error('Error loading metadata:', err));
  }, []);

  // Fetch songs based on active filters
  useEffect(() => {
    const fetchCatalog = async () => {
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
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchCatalog, 200);
    return () => clearTimeout(timer);
  }, [selectedLanguage, selectedGenre, sortBy, searchQuery]);

  // Fetch user likes and saved items
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
    } catch (e) {
      console.error('Like toggle error', e);
    }
  };

  const handleSaveToggle = async (songId: string) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const isSaved = savedIds.has(songId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(songId);
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
    } catch (e) {
      console.error('Save toggle error', e);
    }
  };

  const activeLanguageObj = languages.find((l) => l.code === selectedLanguage);

  return (
    <div className="w-full space-y-8">
      {/* ────────────────────────────────────────────────────────────
          1. HEADER BANNER & DISCOVERY CONTROLS
      ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20">
              <Compass className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Explore Catalog
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display text-slate-900 dark:text-white">
            Discover Music
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {songs.length} pure vocal recordings across 9 Indian languages. 100% synchronized lyrics.
          </p>
        </div>

        {/* View Mode & Cultural Explorer Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRagaExplorer(!showRagaExplorer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              showRagaExplorer
                ? 'bg-amber-500 text-midnight-950 border-amber-500 shadow-saffronGlow'
                : 'bg-white/80 dark:bg-midnight-900 border-black/10 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-amber-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Raga Explorer</span>
          </button>

          <div className="flex items-center rounded-full bg-slate-100 dark:bg-midnight-900 border border-slate-200 dark:border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-midnight-800 text-amber-500 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-midnight-800 text-amber-500 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          2. CULTURAL RAGA EXPLORER DRAWER (EXPANDABLE)
      ──────────────────────────────────────────────────────────── */}
      {showRagaExplorer && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border border-amber-500/20 shadow-card animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Indian Classical Ragas & Rasas</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowRagaExplorer(false)}
              className="p-1 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <RagaSoundscapeExplorer />
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          3. FILTER BAR: SEARCH, LANGUAGES & GENRES
      ──────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tracks, lyrics, artists in this view..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-slate-100 dark:bg-midnight-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs rounded-full bg-slate-100 dark:bg-midnight-900 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="popularity">Most Popular</option>
              <option value="newest">Recently Added</option>
              <option value="title">Alphabetical (A-Z)</option>
              <option value="duration">Longest Track</option>
            </select>
          </div>
        </div>

        {/* Language Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedLanguage('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedLanguage === ''
                ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow'
                : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            All Languages ({languages.reduce((acc, l: any) => acc + parseInt(l.songCount || 0), 0)})
          </button>
          {languages.map((lang: any) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setSelectedLanguage(selectedLanguage === lang.code ? '' : lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLanguage === lang.code
                  ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow'
                  : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              <span>{lang.name}</span>
              {lang.songCount > 0 && (
                <span className="text-[10px] opacity-75 font-mono">({lang.songCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* Genre Filter Pills */}
        {genres.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedGenre('')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedGenre === ''
                  ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30'
                  : 'bg-transparent text-gray-500 hover:text-white'
              }`}
            >
              All Genres
            </button>
            {genres.slice(0, 10).map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => setSelectedGenre(selectedGenre === genre.slug ? '' : genre.slug)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedGenre === genre.slug
                    ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30'
                    : 'bg-transparent text-gray-500 hover:text-white'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────
          4. CATALOG SONGS DISPLAY (GRID OR LIST)
      ──────────────────────────────────────────────────────────── */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <TrackCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <SongRowSkeleton key={i} />
            ))}
          </div>
        )
      ) : songs.length === 0 ? (
        <EmptyState
          icon={Music}
          title="No Songs Found"
          description={
            searchQuery || selectedLanguage || selectedGenre
              ? 'No vocal recordings matched your selected filters. Try resetting your search query or language.'
              : 'Our music library is currently updating with authentic vocal masters.'
          }
          actionLabel="Reset Filters"
          onAction={() => {
            setSelectedLanguage('');
            setSelectedGenre('');
            setSearchQuery('');
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {songs.map((song) => (
            <TrackCard key={song.id} song={song} playlistContext={songs} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {songs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              isLiked={likedIds.has(song.id)}
              onLike={handleLikeToggle}
              isSaved={savedIds.has(song.id)}
              onSave={handleSaveToggle}
              playlistContext={songs}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-gray-400">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          Loading discovery catalog...
        </div>
      }
    >
      <DiscoverContent />
    </React.Suspense>
  );
}
