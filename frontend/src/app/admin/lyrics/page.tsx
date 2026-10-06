'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic2,
  Search,
  Play,
  Pause,
  Save,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Music,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  Volume2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SongLyricItem {
  songId: string;
  title: string;
  durationSeconds: number;
  audioUrl: string;
  artworkUrl: string | null;
  artistName: string;
  languageName: string;
  lyricsId: string | null;
  isSynced: boolean;
  syncStatus: string;
  version: number | null;
  lineCount: string | number;
}

interface LyricLine {
  id?: string;
  sequenceOrder: number;
  startTimeMs: number;
  endTimeMs: number;
  text: string;
}

export default function AdminLyricsStudioPage() {
  const { user, token: authToken, isLoading: authLoading } = useAuth();
  const token = authToken || (typeof window !== 'undefined' ? (localStorage.getItem('talent5_token') || localStorage.getItem('token')) : null);

  const [songs, setSongs] = useState<SongLyricItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Song for editing
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [lyricsData, setLyricsData] = useState<any | null>(null);
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [fullText, setFullText] = useState('');
  const [syncStatus, setSyncStatus] = useState('SYNCED');
  const [activeTab, setActiveTab] = useState<'lines' | 'fulltext'>('lines');
  const [isSaving, setIsSaving] = useState(false);

  // Audio Playback & Timestamping
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  const fetchOverview = async () => {
    const t = token;
    if (!t) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('limit', '100');

      const res = await fetch(`/api/v1/admin/lyrics/overview?${params.toString()}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.success) {
        setSongs(data.data.songs);
        setStats(data.data.stats);
        if (!selectedSong && data.data.songs.length > 0) {
          loadSongLyrics(data.data.songs[0].songId);
        }
      }
    } catch (err) {
      console.error('Failed to load lyrics overview', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSongLyrics = async (songId: string) => {
    const t = token;
    if (!t) return;
    try {
      const res = await fetch(`/api/v1/admin/lyrics/song/${songId}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedSong(data.data.song);
        setLyricsData(data.data.lyrics);
        setFullText(data.data.lyrics?.fullText || '');
        setSyncStatus(data.data.lyrics?.syncStatus || 'SYNCED');
        setLines(
          data.data.lines.map((l: any) => ({
            id: l.id,
            sequenceOrder: l.sequenceOrder,
            startTimeMs: l.startTimeMs,
            endTimeMs: l.endTimeMs,
            text: l.text,
          }))
        );
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          setCurrentTimeMs(0);
        }
      }
    } catch (err) {
      console.error('Failed to load song lyrics details', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOverview();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [token, authLoading]);

  // Audio time update handler
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentMs = Math.floor(audioRef.current.currentTime * 1000);
      setCurrentTimeMs(currentMs);

      // Auto highlight active line
      const activeIdx = lines.findIndex(
        (l) => currentMs >= l.startTimeMs && currentMs <= l.endTimeMs
      );
      if (activeIdx !== -1) {
        setActiveLineIndex(activeIdx);
      }
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const playLineSnippet = (startTimeMs: number, endTimeMs: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = startTimeMs / 1000;
    audioRef.current.play().then(() => setIsPlaying(true));
  };

  // Stamp current audio time to active line
  const handleStampCurrentTime = (index: number, type: 'start' | 'end') => {
    const updated = [...lines];
    if (type === 'start') {
      updated[index].startTimeMs = currentTimeMs;
      if (updated[index].endTimeMs < currentTimeMs) {
        updated[index].endTimeMs = currentTimeMs + 3000;
      }
    } else {
      updated[index].endTimeMs = currentTimeMs;
    }
    setLines(updated);
  };

  // Add line
  const handleAddLine = () => {
    const nextOrder = lines.length + 1;
    const lastLine = lines[lines.length - 1];
    const newStart = lastLine ? lastLine.endTimeMs + 500 : currentTimeMs;
    setLines([
      ...lines,
      {
        sequenceOrder: nextOrder,
        startTimeMs: newStart,
        endTimeMs: newStart + 3500,
        text: 'New lyric phrase',
      },
    ]);
  };

  // Delete line
  const handleDeleteLine = (index: number) => {
    const updated = lines.filter((_, i) => i !== index).map((l, i) => ({ ...l, sequenceOrder: i + 1 }));
    setLines(updated);
  };

  // Save changes
  const handleSaveLyrics = async () => {
    if (!selectedSong) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/lyrics/song/${selectedSong.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullText: fullText || lines.map((l) => l.text).join('\n'),
          isSynced: lines.length > 0,
          syncStatus,
          lines,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Lyrics and karaoke timing lines saved successfully!');
        fetchOverview();
      } else {
        alert(data.message || 'Failed to save lyrics');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving lyrics');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-midnight-900/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Mic2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Karaoke & Synchronized Lyrics Studio
            </h1>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Multi-track Indian language lyric synchronizer, syllable-timed line alignment, and karaoke engine quality control.
          </p>
        </div>

        {stats && (
          <div className="flex items-center gap-4 bg-midnight-950/80 px-4 py-2 rounded-xl border border-white/5">
            <div className="text-center">
              <span className="text-[10px] text-gray-500 font-mono">Synced Songs</span>
              <div className="text-sm font-bold text-emerald-400">{stats.syncedLyrics}</div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] text-gray-500 font-mono">Total Lines</span>
              <div className="text-sm font-bold text-amber-400">{stats.totalLines}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Song Directory List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3 bg-midnight-900/40 rounded-xl border border-white/5 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search songs or artists..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOverview()}
                className="w-full pl-9 pr-3 py-1.5 bg-midnight-950 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-midnight-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-300 focus:outline-none"
              >
                <option value="">All Sync States</option>
                <option value="SYNCED">Fully Synced</option>
                <option value="UNSYNCED">Unsynced Text</option>
                <option value="NEEDS_REVIEW">Needs Review</option>
              </select>
              <button
                onClick={() => fetchOverview()}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-midnight-900/30 rounded-xl border border-white/5 max-h-[640px] overflow-y-auto divide-y divide-white/5">
            {songs.map((song) => {
              const isSelected = selectedSong?.id === song.songId;
              return (
                <button
                  key={song.songId}
                  onClick={() => loadSongLyrics(song.songId)}
                  className={`w-full text-left p-3 transition-colors flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-500/10 border-l-2 border-amber-500 text-white'
                      : 'hover:bg-white/[0.02] text-gray-300'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate text-white">{song.title}</div>
                    <div className="text-[11px] text-gray-400 truncate">{song.artistName} • {song.languageName}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                        song.isSynced
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : song.lyricsId
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/5 text-gray-500 border border-white/10'
                      }`}
                    >
                      {song.isSynced ? `${song.lineCount} Lines` : song.lyricsId ? 'Unsynced' : 'No Lyrics'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Timing Studio */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSong ? (
            <div className="bg-midnight-900/50 rounded-2xl border border-white/5 p-6 space-y-5">
              {/* Active Song Control Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-midnight-950 border border-white/10 flex items-center justify-center text-amber-400">
                    <Music className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">{selectedSong.title}</h2>
                    <p className="text-xs text-gray-400 font-mono">
                      {selectedSong.artistName} • {selectedSong.languageName} • {selectedSong.durationSeconds}s
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex rounded-xl bg-midnight-950 p-1 border border-white/10 text-xs">
                    <button
                      onClick={() => setActiveTab('lines')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        activeTab === 'lines' ? 'bg-amber-500 text-black font-semibold' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Karaoke Lines ({lines.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('fulltext')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        activeTab === 'fulltext' ? 'bg-amber-500 text-black font-semibold' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Raw Lyrics
                    </button>
                  </div>

                  <button
                    onClick={handleSaveLyrics}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Lyrics'}</span>
                  </button>
                </div>
              </div>

              {/* Master Audio Sync Player Bar */}
              <div className="p-4 rounded-xl bg-midnight-950 border border-white/10 space-y-3">
                <audio
                  ref={audioRef}
                  src={selectedSong.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                />
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayAudio}
                      className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-bold transition-all shadow-md shadow-amber-500/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div>
                      <div className="text-white font-bold text-sm">
                        {Math.floor(currentTimeMs / 60000)}:
                        {Math.floor((currentTimeMs % 60000) / 1000).toString().padStart(2, '0')}.
                        {(currentTimeMs % 1000).toString().padStart(3, '0').slice(0, 2)}
                      </div>
                      <span className="text-[10px] text-gray-500">Current Studio Playhead</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={syncStatus}
                      onChange={(e) => setSyncStatus(e.target.value)}
                      className="bg-midnight-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-300 focus:outline-none"
                    >
                      <option value="SYNCED">Status: SYNCED</option>
                      <option value="UNSYNCED">Status: UNSYNCED</option>
                      <option value="NEEDS_REVIEW">Status: NEEDS_REVIEW</option>
                    </select>
                    <button
                      onClick={handleAddLine}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium border border-white/10 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Line</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab 1: Line-by-Line Synchronizer */}
              {activeTab === 'lines' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider flex items-center justify-between px-2">
                    <span>Sequence & Timings</span>
                    <span>Lyric Text & Audio Actions</span>
                  </div>

                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {lines.map((line, idx) => {
                      const isActive = activeLineIndex === idx;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isActive
                              ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                              : 'bg-midnight-950/70 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 text-[10px] font-mono text-gray-500">#{line.sequenceOrder}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleStampCurrentTime(idx, 'start')}
                                className="px-2 py-1 bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 rounded font-mono text-[10px] border border-white/10"
                                title="Click to stamp current playhead as Start Time"
                              >
                                {Math.floor(line.startTimeMs / 1000)}s {(line.startTimeMs % 1000)}ms
                              </button>
                              <span className="text-gray-600 text-xs">→</span>
                              <button
                                onClick={() => handleStampCurrentTime(idx, 'end')}
                                className="px-2 py-1 bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 rounded font-mono text-[10px] border border-white/10"
                                title="Click to stamp current playhead as End Time"
                              >
                                {Math.floor(line.endTimeMs / 1000)}s {(line.endTimeMs % 1000)}ms
                              </button>
                            </div>
                          </div>

                          <div className="flex-1 min-w-[200px]">
                            <input
                              type="text"
                              value={line.text}
                              onChange={(e) => {
                                const up = [...lines];
                                up[idx].text = e.target.value;
                                setLines(up);
                              }}
                              className="w-full px-3 py-1.5 bg-midnight-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500/50"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => playLineSnippet(line.startTimeMs, line.endTimeMs)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10"
                              title="Play this line segment"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLine(idx)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20"
                              title="Delete line"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Raw Full Text */}
              {activeTab === 'fulltext' && (
                <div className="space-y-3">
                  <div className="text-xs text-gray-400 leading-relaxed">
                    Paste raw authentic lyrics in native script (Devanagari, Telugu, Tamil, Kannada, Bengali). Line breaks will automatically format karaoke phrase blocks.
                  </div>
                  <textarea
                    rows={14}
                    value={fullText}
                    onChange={(e) => setFullText(e.target.value)}
                    placeholder="Enter complete song lyrics..."
                    className="w-full p-4 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-20 rounded-2xl bg-midnight-900/30 border border-white/5 text-center text-gray-500 text-xs font-mono">
              Select a track from the catalog directory to launch the lyrics studio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
