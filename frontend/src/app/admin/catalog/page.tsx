'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Music,
  Search,
  Filter,
  Plus,
  Play,
  Pause,
  Edit3,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  X,
  Languages,
  Mic2,
  Disc,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SongItem {
  id: string;
  title: string;
  slug: string;
  durationSeconds: number;
  audioUrl: string;
  artworkUrl: string | null;
  status: string;
  mood: string | null;
  isExplicit: boolean;
  playCount: string | number;
  validLikesCount: string | number;
  releaseDate: string;
  createdAt: string;
  artistId: string;
  artistName: string;
  artistVerified: boolean;
  languageId: number;
  languageName: string;
  genreId: number;
  genreName: string;
  hasSyncedLyrics: boolean;
  hasLyrics: boolean;
}

interface CatalogStats {
  totalSongs: string | number;
  publishedSongs: string | number;
  takedownSongs: string | number;
  draftSongs: string | number;
  totalPlays: string | number;
  totalLikes: string | number;
}

export default function AdminCatalogPage() {
  const { user } = useAuth();
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Metadata dropdowns
  const [languages, setLanguages] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);

  // Audio Preview Player
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Modal states
  const [editingSong, setEditingSong] = useState<SongItem | null>(null);
  const [isNewSongModalOpen, setIsNewSongModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Song Form State
  const [newSongForm, setNewSongForm] = useState({
    title: '',
    artistId: '',
    languageId: '',
    genreId: '',
    mood: 'Energetic',
    durationSeconds: 180,
    audioUrl: '',
    artworkUrl: '',
    isExplicit: false,
    status: 'PUBLISHED',
  });

  const { token: authToken, isLoading: authLoading } = useAuth();
  const token = authToken || (typeof window !== 'undefined' ? (localStorage.getItem('talent5_token') || localStorage.getItem('token')) : null);

  // Load Metadata (languages, genres, artists)
  const fetchMetadata = async () => {
    const t = token;
    if (!t) return;
    try {
      const res = await fetch('/api/v1/admin/catalog/metadata', {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.success) {
        setLanguages(data.data.languages || []);
        setGenres(data.data.genres || []);
        setArtists(data.data.artists || []);
        if (data.data.artists.length > 0 && !newSongForm.artistId) {
          setNewSongForm((prev) => ({
            ...prev,
            artistId: data.data.artists[0].id,
            languageId: data.data.languages[0]?.id?.toString() || '',
            genreId: data.data.genres[0]?.id?.toString() || '',
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching catalog metadata', err);
    }
  };

  // Pagination states (allow strictly 10 records per page)
  const PAGE_SIZE = 10;
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Load Songs
  const fetchSongs = async (targetPage = page) => {
    const t = token;
    if (!t) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedLanguage) params.append('languageId', selectedLanguage);
      if (selectedGenre) params.append('genreId', selectedGenre);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('page', targetPage.toString());
      params.append('limit', PAGE_SIZE.toString());

      const res = await fetch(`/api/v1/admin/catalog/songs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.success) {
        setSongs(data.data.songs);
        setStats(data.data.stats);
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.totalPages || 1);
          setTotalCount(data.data.pagination.total ?? data.data.songs.length);
        } else {
          setTotalCount(data.data.songs.length);
          setTotalPages(Math.max(1, Math.ceil(data.data.songs.length / PAGE_SIZE)));
        }
      } else {
        setError(data.message || 'Failed to fetch catalog songs');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with catalog server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMetadata();
      fetchSongs(1);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [token, authLoading]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setPage(1);
    if (token) {
      fetchSongs(1);
    }
  }, [search, selectedLanguage, selectedGenre, selectedStatus]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    fetchSongs(newPage);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Audio preview handler
  const handleTogglePlay = (song: SongItem) => {
    if (playingAudioId === song.id) {
      audioElement?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(song.audioUrl);
      audio.play().catch((e) => console.error('Audio play error', e));
      audio.onended = () => setPlayingAudioId(null);
      setAudioElement(audio);
      setPlayingAudioId(song.id);
    }
  };

  // Quick Takedown / Re-publish toggle
  const handleToggleStatus = async (song: SongItem) => {
    const newStatus = song.status === 'PUBLISHED' ? 'TAKEDOWN' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/v1/admin/catalog/songs/${song.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSongs((prev) =>
          prev.map((s) => (s.id === song.id ? { ...s, status: newStatus } : s))
        );
        fetchSongs();
      }
    } catch (err) {
      console.error('Failed to update song status', err);
    }
  };

  // Update Song Submit
  const handleUpdateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/admin/catalog/songs/${editingSong.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingSong.title,
          mood: editingSong.mood,
          durationSeconds: editingSong.durationSeconds,
          audioUrl: editingSong.audioUrl,
          artworkUrl: editingSong.artworkUrl,
          isExplicit: editingSong.isExplicit,
          status: editingSong.status,
          languageId: editingSong.languageId,
          genreId: editingSong.genreId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingSong(null);
        fetchSongs();
      } else {
        alert(data.message || 'Failed to update song');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating song');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create New Song Submit
  const handleCreateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/catalog/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newSongForm.title,
          artistId: newSongForm.artistId,
          languageId: parseInt(newSongForm.languageId, 10),
          genreId: parseInt(newSongForm.genreId, 10),
          mood: newSongForm.mood,
          durationSeconds: parseInt(newSongForm.durationSeconds.toString(), 10),
          audioUrl: newSongForm.audioUrl,
          artworkUrl: newSongForm.artworkUrl || null,
          isExplicit: newSongForm.isExplicit,
          status: newSongForm.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewSongModalOpen(false);
        setNewSongForm({
          title: '',
          artistId: artists[0]?.id || '',
          languageId: languages[0]?.id?.toString() || '',
          genreId: genres[0]?.id?.toString() || '',
          mood: 'Energetic',
          durationSeconds: 180,
          audioUrl: '',
          artworkUrl: '',
          isExplicit: false,
          status: 'PUBLISHED',
        });
        fetchSongs();
      } else {
        alert(data.message || 'Failed to create song');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating song');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Song
  const handleDeleteSong = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove "${title}" from the music catalog? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/catalog/songs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSongs((prev) => prev.filter((s) => s.id !== id));
        fetchSongs();
      } else {
        alert(data.message || 'Failed to delete song');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting song');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-midnight-900/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Music className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Master Music Catalog & Audio Manager
            </h1>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Direct sovereign governance over 350+ master tracks, audio stream routing, artwork, metadata, lyrics sync verification, and emergency takedowns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSongs()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsNewSongModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 rounded-xl shadow-lg shadow-rose-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Catalog Track</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">Total Songs</span>
            <div className="text-xl font-bold font-display text-white">{stats.totalSongs}</div>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">Published Active</span>
            <div className="text-xl font-bold font-display text-emerald-300">{stats.publishedSongs}</div>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400">Takedowns</span>
            <div className="text-xl font-bold font-display text-rose-300">{stats.takedownSongs}</div>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">Drafts / In Review</span>
            <div className="text-xl font-bold font-display text-amber-300">{stats.draftSongs}</div>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400">Total Stream Plays</span>
            <div className="text-xl font-bold font-display text-teal-300">
              {Number(stats.totalPlays).toLocaleString()}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5 space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">Verified Likes</span>
            <div className="text-xl font-bold font-display text-indigo-300">
              {Number(stats.totalLikes).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-midnight-900/40 border border-white/5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog by title, artist, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchSongs()}
            className="w-full pl-10 pr-4 py-2 bg-midnight-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>

        {/* Language Filter */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="bg-midnight-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-rose-500/50"
        >
          <option value="">All Languages ({languages.length})</option>
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.code})
            </option>
          ))}
        </select>

        {/* Genre Filter */}
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-midnight-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-rose-500/50"
        >
          <option value="">All Genres ({genres.length})</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-midnight-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-rose-500/50"
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="TAKEDOWN">Takedown</option>
          <option value="DRAFT">Draft</option>
          <option value="UNPUBLISHED">Unpublished</option>
        </select>

        <button
          onClick={() => fetchSongs()}
          className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 rounded-xl text-xs font-semibold transition-all"
        >
          Filter
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-midnight-900/40 rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
            <span className="text-xs font-mono text-gray-400">Loading catalog songs...</span>
          </div>
        ) : songs.length === 0 ? (
          <div className="p-16 text-center text-gray-400 text-xs font-mono">
            No catalog tracks matching current filter query.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto admin-scrollbar">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-midnight-950/50">
                  <th className="py-3 px-4">Track</th>
                  <th className="py-3 px-4">Artist</th>
                  <th className="py-3 px-4">Language / Genre</th>
                  <th className="py-3 px-4">Engagement</th>
                  <th className="py-3 px-4">Lyrics Status</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                {songs.map((song) => {
                  const isPlaying = playingAudioId === song.id;
                  return (
                    <tr key={song.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleTogglePlay(song)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                              isPlaying
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                            }`}
                            title={isPlaying ? 'Pause preview' : 'Play audio preview'}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                          <div>
                            <div className="font-medium text-white flex items-center gap-2">
                              <span>{song.title}</span>
                              {song.isExplicit && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  EXPLICIT
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-2">
                              <span>{Math.floor(song.durationSeconds / 60)}:{(song.durationSeconds % 60).toString().padStart(2, '0')}</span>
                              <span>•</span>
                              <span>{song.mood || 'Standard'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-200">{song.artistName}</span>
                          {song.artistVerified && (
                            <span title="Verified Desi Artist">
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div>{song.languageName}</div>
                        <div className="text-gray-400 text-[10px]">{song.genreName}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div>{Number(song.playCount).toLocaleString()} plays</div>
                        <div className="text-emerald-400 text-[10px]">{Number(song.validLikesCount).toLocaleString()} likes</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {song.hasSyncedLyrics ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Mic2 className="w-3 h-3" /> Synced
                          </span>
                        ) : song.hasLyrics ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Unsynced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-gray-500 bg-white/5 border border-white/10">
                            No Lyrics
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase border ${
                            song.status === 'PUBLISHED'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : song.status === 'TAKEDOWN'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {song.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(song)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                              song.status === 'PUBLISHED'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                            title={song.status === 'PUBLISHED' ? 'Takedown track from public platform' : 'Re-publish track to platform'}
                          >
                            {song.status === 'PUBLISHED' ? 'Takedown' : 'Publish'}
                          </button>
                          <button
                            onClick={() => setEditingSong(song)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                            title="Edit metadata"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSong(song.id, song.title)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                            title="Delete song"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Toolbar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-midnight-950/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 shadow-xl backdrop-blur-sm text-xs">
            {/* Left: Summary and Page Size */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-400">
              <span className="font-medium">
                Showing{' '}
                <strong className="text-white">
                  {totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                </strong>{' '}
                to{' '}
                <strong className="text-white">
                  {Math.min(page * PAGE_SIZE, totalCount || songs.length)}
                </strong>{' '}
                of{' '}
                <strong className="text-white">
                  {totalCount || stats?.totalSongs || songs.length}
                </strong>{' '}
                tracks
              </span>

              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/10">
                <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-rose-400 font-mono font-semibold text-[11px]">
                  10 records per page
                </span>
              </div>
            </div>

            {/* Right: Navigation Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* First Page */}
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Pills */}
              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - page) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 font-mono">
                          ...
                        </span>
                      );
                    }
                    const p = item as number;
                    const isActive = p === page;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`w-8 h-8 rounded-xl font-bold font-mono text-xs transition-all ${
                          isActive
                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-500'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300 hover:text-white transition-all"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Edit Song Modal Drawer */}
      {editingSong && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-950 border border-rose-500/20 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-rose-400" />
                <h3 className="font-display font-bold text-white text-base">Edit Catalog Metadata</h3>
              </div>
              <button
                onClick={() => setEditingSong(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSong} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-mono">Track Title</label>
                <input
                  type="text"
                  required
                  value={editingSong.title}
                  onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-mono">Language</label>
                  <select
                    value={editingSong.languageId}
                    onChange={(e) => setEditingSong({ ...editingSong, languageId: parseInt(e.target.value, 10) })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-mono">Genre</label>
                  <select
                    value={editingSong.genreId}
                    onChange={(e) => setEditingSong({ ...editingSong, genreId: parseInt(e.target.value, 10) })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-mono">Duration (sec)</label>
                  <input
                    type="number"
                    value={editingSong.durationSeconds}
                    onChange={(e) => setEditingSong({ ...editingSong, durationSeconds: parseInt(e.target.value, 10) || 0 })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-mono">Mood</label>
                  <input
                    type="text"
                    value={editingSong.mood || ''}
                    onChange={(e) => setEditingSong({ ...editingSong, mood: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-mono">Status</label>
                  <select
                    value={editingSong.status}
                    onChange={(e) => setEditingSong({ ...editingSong, status: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="TAKEDOWN">TAKEDOWN</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="UNPUBLISHED">UNPUBLISHED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Audio Stream URL</label>
                <input
                  type="text"
                  required
                  value={editingSong.audioUrl}
                  onChange={(e) => setEditingSong({ ...editingSong, audioUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Artwork Cover Image URL</label>
                <input
                  type="text"
                  value={editingSong.artworkUrl || ''}
                  onChange={(e) => setEditingSong({ ...editingSong, artworkUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="explicitCheckbox"
                  checked={editingSong.isExplicit}
                  onChange={(e) => setEditingSong({ ...editingSong, isExplicit: e.target.checked })}
                  className="rounded border-white/20 bg-midnight-900 text-rose-500 focus:ring-0"
                />
                <label htmlFor="explicitCheckbox" className="text-xs text-gray-300 font-medium">
                  Flag as Explicit Lyrics / Content
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSong(null)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-500/20"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Track Metadata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Song Modal */}
      {isNewSongModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-950 border border-rose-500/20 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-400" />
                <h3 className="font-display font-bold text-white text-base">Add New Catalog Track</h3>
              </div>
              <button
                onClick={() => setIsNewSongModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSong} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-mono">Track Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samaja Varagamana (Acoustic Master)"
                  value={newSongForm.title}
                  onChange={(e) => setNewSongForm({ ...newSongForm, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Primary Artist *</label>
                <select
                  required
                  value={newSongForm.artistId}
                  onChange={(e) => setNewSongForm({ ...newSongForm, artistId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="">Select artist...</option>
                  {artists.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.isVerified ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-mono">Language *</label>
                  <select
                    required
                    value={newSongForm.languageId}
                    onChange={(e) => setNewSongForm({ ...newSongForm, languageId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-mono">Genre *</label>
                  <select
                    required
                    value={newSongForm.genreId}
                    onChange={(e) => setNewSongForm({ ...newSongForm, genreId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-mono">Mood</label>
                  <input
                    type="text"
                    placeholder="e.g. Soulful, Romantic, Energetic"
                    value={newSongForm.mood}
                    onChange={(e) => setNewSongForm({ ...newSongForm, mood: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-mono">Duration (seconds)</label>
                  <input
                    type="number"
                    value={newSongForm.durationSeconds}
                    onChange={(e) => setNewSongForm({ ...newSongForm, durationSeconds: parseInt(e.target.value, 10) || 0 })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Audio Stream URL (HTTPS/Supabase) *</label>
                <input
                  type="text"
                  required
                  placeholder="https://...mp3"
                  value={newSongForm.audioUrl}
                  onChange={(e) => setNewSongForm({ ...newSongForm, audioUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Artwork Cover URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newSongForm.artworkUrl}
                  onChange={(e) => setNewSongForm({ ...newSongForm, artworkUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newExplicit"
                  checked={newSongForm.isExplicit}
                  onChange={(e) => setNewSongForm({ ...newSongForm, isExplicit: e.target.checked })}
                  className="rounded border-white/20 bg-midnight-900 text-rose-500 focus:ring-0"
                />
                <label htmlFor="newExplicit" className="text-xs text-gray-300 font-medium">
                  Flag as Explicit Lyrics
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewSongModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-500/20"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
