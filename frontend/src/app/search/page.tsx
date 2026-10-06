'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Play,
  Pause,
  Music,
  User,
  Disc,
  Sparkles,
  Heart,
  TrendingUp,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Song, Artist, Album } from '@talent5/types';
import { formatCompactNumber, formatDuration } from '@talent5/utils';
import { Badge } from '@/components/ui/Badge';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const [query, setQuery] = useState<string>(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'artists' | 'albums' | 'desi'>('all');
  const [results, setResults] = useState<{
    popularSearches?: string[];
    songs: Song[];
    artists: Artist[];
    albums: Album[];
    desiContent: any[];
  }>({
    songs: [],
    artists: [],
    albums: [],
    desiContent: [],
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const runSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data);
        }
      } catch (e) {
        console.error('Search error', e);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(runSearch, 250);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearchChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      router.replace(`/search?q=${encodeURIComponent(val.trim())}`);
    } else {
      router.replace('/search');
    }
  };

  const totalMatches =
    (results.songs?.length || 0) +
    (results.artists?.length || 0) +
    (results.albums?.length || 0) +
    (results.desiContent?.length || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto relative">
        <Search className="w-5 h-5 text-amber-500 absolute left-4 top-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search songs, artists, Desi creators, lyrics, albums..."
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-midnight-900/90 border border-white/15 rounded-full text-sm text-white placeholder-gray-500 shadow-card focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 transition-all"
          autoFocus
        />
      </div>

      {/* Mood & Vibe Quick Chips */}
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
        {[
          { label: 'Desi Street Hip-Hop', query: 'Gully To Gagan', icon: '🎤' },
          { label: 'Punjabi Dhol Hype', query: 'Pind Di Beat', icon: '🥁' },
          { label: 'Urban Punjabi', query: 'Aa Mahiya', icon: '🔥' },
          { label: 'Bollywood Melody', query: 'Dil Me Chupi', icon: '✨' },
          { label: 'Monsoon Soul', query: 'Baarish', icon: '🌧️' },
          { label: 'Late Night Ghazal', query: 'Tum Bin', icon: '🌙' },
        ].map((m) => (
          <button
            key={m.label}
            type="button"
            onClick={() => handleSearchChange(m.query)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-xs text-gray-300 hover:text-amber-400 font-medium transition-all shadow-sm"
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Popular Suggestions (When query is empty) */}
      {!query.trim() && results.popularSearches && (
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Trending Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {results.popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleSearchChange(term)}
                className="px-3 py-1.5 rounded-full bg-midnight-800 hover:bg-midnight-700 border border-white/10 text-xs text-gray-300 hover:text-white transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Filter (When search results exist) */}
      {query.trim() && (
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          {[
            { id: 'all', label: `All (${totalMatches})` },
            { id: 'songs', label: `Songs (${results.songs?.length || 0})` },
            { id: 'artists', label: `Artists (${results.artists?.length || 0})` },
            { id: 'albums', label: `Albums (${results.albums?.length || 0})` },
            { id: 'desi', label: `Desi Music (${results.desiContent?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow'
                  : 'bg-midnight-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Results Feed */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-gray-400">Searching Talent5 Catalog...</p>
        </div>
      ) : query.trim() && totalMatches === 0 ? (
        <div className="text-center py-16 bg-midnight-900/40 rounded-3xl border border-white/5">
          <Search className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">No matches found for "{query}"</h3>
          <p className="text-xs text-gray-400">
            Check the spelling or try searching for another artist, language, or lyric snippet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Songs Results */}
          {(activeTab === 'all' || activeTab === 'songs') && results.songs?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-amber-500" /> Songs
              </h3>
              <div className="divide-y divide-white/5 bg-midnight-900/50 rounded-2xl p-2 border border-white/5">
                {results.songs.map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-midnight-800 flex-shrink-0">
                          <img
                            src={song.artworkUrl}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => {
                              if (isCurrent) togglePlay();
                              else playSong(song, results.songs);
                            }}
                            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                              isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-midnight-950 flex items-center justify-center">
                              {isCurrent && isPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </div>
                          </button>
                        </div>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/song/${song.id}`}
                            className="text-sm font-semibold text-white hover:text-amber-400 truncate block transition-colors"
                          >
                            {song.title}
                          </Link>
                          <Link
                            href={`/artist/${song.artistId}`}
                            className="text-xs text-gray-400 hover:text-gray-200 truncate block"
                          >
                            {song.artistName}
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="hidden sm:inline">{song.languageName}</span>
                        <span>{formatDuration(song.durationSeconds)}</span>
                        <span className="flex items-center gap-1 text-rose-400">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          {formatCompactNumber(song.validLikesCount || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Artists Results */}
          {(activeTab === 'all' || activeTab === 'artists') && results.artists?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" /> Artists
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {results.artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/artist/${artist.id}`}
                    className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col items-center text-center group"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border border-white/10 group-hover:border-amber-500 transition-colors">
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold text-white group-hover:text-amber-400">
                        {artist.name}
                      </p>
                      {artist.isVerified && <Badge type="verified" />}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatCompactNumber(artist.followersCount)} Followers
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Albums Results */}
          {(activeTab === 'all' || activeTab === 'albums') && results.albums?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Disc className="w-4 h-4 text-purple-400" /> Albums & EPs
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {results.albums.map((album) => (
                  <Link
                    key={album.id}
                    href={`/album/${album.id}`}
                    className="glass-panel glass-panel-hover rounded-2xl p-3 flex flex-col group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-midnight-800 mb-2">
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm font-bold text-white group-hover:text-amber-400 truncate">
                      {album.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{album.artistName}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Desi Original Content */}
          {(activeTab === 'all' || activeTab === 'desi') && results.desiContent?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" /> Desi Originals
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.desiContent.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel rounded-2xl p-3 flex items-center gap-3 border border-white/10"
                  >
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold uppercase">
                        {item.category}
                      </span>
                      <p className="text-sm font-bold text-white truncate mt-1">{item.title}</p>
                      <p className="text-xs text-gray-400">By {item.creatorName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-sm text-gray-400">Loading search...</div>}>
      <SearchContent />
    </React.Suspense>
  );
}
