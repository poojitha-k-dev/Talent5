'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Download,
  Upload,
  Radio,
  Zap,
  RotateCcw,
  FastForward,
  Rewind,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Eye,
  SlidersHorizontal,
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

const PAGE_SIZE = 10;

export default function AdminLyricsStudioPage() {
  const { token: authToken, isLoading: authLoading } = useAuth();
  const token =
    authToken ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('talent5_token') || localStorage.getItem('token')
      : null);

  // Song Directory State (Strict 10 Records Per Page)
  const [songs, setSongs] = useState<SongLyricItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Selected Song State
  const [selectedSong, setSelectedSong] = useState<any | null>(null);
  const [lyricsData, setLyricsData] = useState<any | null>(null);
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [fullText, setFullText] = useState('');
  const [syncStatus, setSyncStatus] = useState('SYNCED');
  const [activeTab, setActiveTab] = useState<'lines' | 'fulltext' | 'simulator'>('lines');
  const [isSaving, setIsSaving] = useState(false);

  // Audio Playback & Timestamping
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);

  // Innovation Feature 1: Tap-to-Sync Live Mode
  const [isTapSyncMode, setIsTapSyncMode] = useState(false);
  const [tapSyncIndex, setTapSyncIndex] = useState<number>(0);
  const [lastTapSuccess, setLastTapSuccess] = useState<boolean>(false);

  // LRC Import/Export Modal
  const [showLrcModal, setShowLrcModal] = useState<'import' | 'export' | null>(null);
  const [lrcContent, setLrcContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Karaoke Simulator Ref for auto-scroll
  const simActiveLineRef = useRef<HTMLDivElement | null>(null);

  // Fetch song overview with strict 10 pagination
  const fetchOverview = async (page = currentPage) => {
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
      params.append('page', page.toString());
      params.append('limit', PAGE_SIZE.toString());

      const res = await fetch(`/api/v1/admin/lyrics/overview?${params.toString()}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.success) {
        setSongs(data.data.songs || []);
        setStats(data.data.stats || null);
        if (data.data.pagination) {
          setCurrentPage(data.data.pagination.page);
          setTotalPages(data.data.pagination.totalPages || 1);
          setTotalRecords(data.data.pagination.total || 0);
        }
        // Auto-select first song if none selected
        if (!selectedSong && data.data.songs && data.data.songs.length > 0) {
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
          (data.data.lines || []).map((l: any, i: number) => ({
            id: l.id,
            sequenceOrder: l.sequenceOrder || i + 1,
            startTimeMs: Number(l.startTimeMs) || 0,
            endTimeMs: Number(l.endTimeMs) || 0,
            text: l.text || '',
          }))
        );
        setIsTapSyncMode(false);
        setTapSyncIndex(0);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.playbackRate = 1.0;
          setIsPlaying(false);
          setCurrentTimeMs(0);
          setPlaybackRate(1.0);
        }
      }
    } catch (err) {
      console.error('Failed to load song lyrics details', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOverview(1);
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [token, authLoading]);

  // Audio time update handler
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentMs = Math.floor(audioRef.current.currentTime * 1000);
      setCurrentTimeMs(currentMs);

      // Auto-highlight active line during playback
      const activeIdx = lines.findIndex(
        (l) => currentMs >= l.startTimeMs && (currentMs <= l.endTimeMs || l.endTimeMs === 0)
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
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const setAudioSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const seekToMs = (ms: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, ms) / 1000;
    setCurrentTimeMs(Math.max(0, ms));
  };

  const playLineSnippet = (startTimeMs: number, endTimeMs: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = startTimeMs / 1000;
    audioRef.current.play().then(() => setIsPlaying(true));
  };

  // Stamp current audio time to specific line
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

  // -------------------------------------------------------------
  // INNOVATION 1: TAP-TO-SYNC LOGIC
  // -------------------------------------------------------------
  const handleTapSyncAction = useCallback(() => {
    if (!isTapSyncMode || lines.length === 0) return;
    if (tapSyncIndex >= lines.length) {
      setIsTapSyncMode(false);
      return;
    }

    const updated = [...lines];
    const currentLine = updated[tapSyncIndex];

    // Stamp current line end time
    currentLine.endTimeMs = currentTimeMs;

    // Trigger visual tap feedback
    setLastTapSuccess(true);
    setTimeout(() => setLastTapSuccess(false), 300);

    // If there is a next line, advance and stamp its start time
    if (tapSyncIndex + 1 < lines.length) {
      const nextLine = updated[tapSyncIndex + 1];
      nextLine.startTimeMs = currentTimeMs;
      setTapSyncIndex(tapSyncIndex + 1);
      // Auto-scroll to row in editor
      const el = document.getElementById(`lyric-line-${tapSyncIndex + 1}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Completed all lines
      setIsTapSyncMode(false);
      alert('🎉 All lines synchronized! Review timestamps and click "Save Lyrics".');
    }

    setLines(updated);
  }, [isTapSyncMode, lines, tapSyncIndex, currentTimeMs]);

  // Global Spacebar listener for Tap-to-Sync Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isTapSyncMode) {
          handleTapSyncAction();
        } else {
          togglePlayAudio();
        }
      } else if (e.code === 'ArrowLeft' && e.shiftKey) {
        // Shift + Left Arrow: Seek back 3 seconds
        seekToMs(currentTimeMs - 3000);
      } else if (e.code === 'ArrowRight' && e.shiftKey) {
        // Shift + Right Arrow: Seek forward 3 seconds
        seekToMs(currentTimeMs + 3000);
      } else if (e.code === 'Escape' && isTapSyncMode) {
        setIsTapSyncMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTapSyncMode, handleTapSyncAction, currentTimeMs, isPlaying]);

  // Start or Stop Tap Sync Mode
  const startTapSyncMode = () => {
    if (lines.length === 0) {
      alert('Please add or convert raw text to lyric lines first.');
      return;
    }
    setIsTapSyncMode(true);
    setTapSyncIndex(0);
    // Rewind audio to 0 or first line
    seekToMs(0);
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const stopTapSyncMode = () => {
    setIsTapSyncMode(false);
  };

  // Convert Raw Text to Syncable Lines in 1 click
  const handleConvertRawTextToLines = () => {
    if (!fullText.trim()) {
      alert('Please enter or paste raw lyrics text first.');
      return;
    }
    const rawLines = fullText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length === 0) {
      alert('No valid lyrics lines found.');
      return;
    }

    const generated: LyricLine[] = rawLines.map((text, idx) => ({
      sequenceOrder: idx + 1,
      startTimeMs: 0,
      endTimeMs: 0,
      text,
    }));

    setLines(generated);
    setActiveTab('lines');
    alert(`⚡ Successfully created ${generated.length} syncable karaoke lines! Click "Start Tap-to-Sync" to align with audio.`);
  };

  // Batch Time Offset Shift (+/- ms across all lines)
  const handleShiftAllTimings = (offsetMs: number) => {
    if (lines.length === 0) return;
    const updated = lines.map((l) => ({
      ...l,
      startTimeMs: Math.max(0, l.startTimeMs + offsetMs),
      endTimeMs: Math.max(0, l.endTimeMs + offsetMs),
    }));
    setLines(updated);
  };

  // -------------------------------------------------------------
  // LRC IMPORT & EXPORT
  // -------------------------------------------------------------
  const handleOpenExportLrc = () => {
    let output = '';
    if (selectedSong) {
      output += `[ti:${selectedSong.title}]\n`;
      output += `[ar:${selectedSong.artistName}]\n`;
      output += `[al:Talent5 Global Records]\n`;
      output += `[by:Talent5 Admin Lyrics Studio]\n\n`;
    }
    lines.forEach((line) => {
      const minutes = Math.floor(line.startTimeMs / 60000);
      const seconds = Math.floor((line.startTimeMs % 60000) / 1000);
      const centis = Math.floor((line.startTimeMs % 1000) / 10);
      const tag = `[${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}.${centis.toString().padStart(2, '0')}]`;
      output += `${tag} ${line.text}\n`;
    });
    setLrcContent(output);
    setShowLrcModal('export');
  };

  const handleDownloadLrc = () => {
    const blob = new Blob([lrcContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(selectedSong?.title || 'lyrics').replace(/\s+/g, '_')}.lrc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLrc = () => {
    navigator.clipboard.writeText(lrcContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleImportLrc = () => {
    if (!lrcContent.trim()) {
      alert('Please paste LRC file contents.');
      return;
    }

    const linesRaw = lrcContent.split('\n');
    const parsed: { startTimeMs: number; text: string }[] = [];
    const lrcRegex = /\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\](.*)/;

    for (const raw of linesRaw) {
      const match = raw.match(lrcRegex);
      if (match) {
        const mins = parseInt(match[1], 10);
        const secs = parseFloat(match[2]);
        const text = match[3].trim();
        const startTimeMs = Math.floor((mins * 60 + secs) * 1000);
        if (text) {
          parsed.push({ startTimeMs, text });
        }
      }
    }

    if (parsed.length === 0) {
      alert('Could not parse any standard [mm:ss.xx] timestamped lines from the provided LRC input.');
      return;
    }

    parsed.sort((a, b) => a.startTimeMs - b.startTimeMs);

    const generated: LyricLine[] = parsed.map((item, idx) => {
      const next = parsed[idx + 1];
      const endTimeMs = next ? next.startTimeMs : item.startTimeMs + 3500;
      return {
        sequenceOrder: idx + 1,
        startTimeMs: item.startTimeMs,
        endTimeMs,
        text: item.text,
      };
    });

    setLines(generated);
    setShowLrcModal(null);
    setLrcContent('');
    setActiveTab('lines');
    alert(`🎉 Successfully imported ${generated.length} synchronized lines from LRC!`);
  };

  // Add line manually
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
    const updated = lines
      .filter((_, i) => i !== index)
      .map((l, i) => ({ ...l, sequenceOrder: i + 1 }));
    setLines(updated);
  };

  // Save changes to backend
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
        alert('✨ Lyrics and karaoke timing lines saved successfully!');
        fetchOverview(currentPage);
      } else {
        alert(data.message || 'Failed to save lyrics');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving lyrics');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-scroll active line in Simulator tab
  useEffect(() => {
    if (activeTab === 'simulator' && simActiveLineRef.current) {
      simActiveLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex, activeTab]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Platform Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-midnight-900/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Mic2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Interactive Tap-to-Sync Lyrics Studio
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 border border-rose-500/30 text-rose-400">
              Karaoke Pro v2
            </span>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Multi-track Indian language synchronizer, live spacebar tap-to-align, LRC import/export, and real-time karaoke engine simulation.
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
              <span className="text-[10px] text-gray-500 font-mono">Unsynced</span>
              <div className="text-sm font-bold text-amber-400">{stats.unsyncedLyrics}</div>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] text-gray-500 font-mono">Total Lines</span>
              <div className="text-sm font-bold text-purple-400">{stats.totalLines}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Track Directory with Strict 10 Pagination */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-3 bg-midnight-900/60 rounded-xl border border-white/5 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search songs or artists..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOverview(1)}
                className="w-full pl-9 pr-3 py-1.5 bg-midnight-950 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                  fetchOverview(1);
                }}
                className="w-full bg-midnight-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-300 focus:outline-none"
              >
                <option value="">All Sync States</option>
                <option value="SYNCED">Fully Synced</option>
                <option value="UNSYNCED">Unsynced Text</option>
                <option value="NEEDS_REVIEW">Needs Review</option>
                <option value="NONE">No Lyrics Entry</option>
              </select>
              <button
                onClick={() => fetchOverview(currentPage)}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 text-xs transition-colors"
                title="Refresh directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Songs List (Max 10 per page) */}
          <div className="bg-midnight-900/30 rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5 min-h-[420px]">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-500">Loading catalog songs...</div>
            ) : songs.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">No matching tracks found.</div>
            ) : (
              songs.map((song) => {
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
                      <div className="text-[11px] text-gray-400 truncate">
                        {song.artistName} • {song.languageName}
                      </div>
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
                        {song.isSynced
                          ? `${song.lineCount} Lines`
                          : song.lyricsId
                          ? 'Unsynced'
                          : 'No Lyrics'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Strict 10 Pagination Controls */}
          <div className="flex items-center justify-between px-3 py-2 bg-midnight-900/50 rounded-xl border border-white/5 text-xs text-gray-400">
            <span className="font-mono text-[11px]">
              Page {currentPage} of {totalPages} ({totalRecords} tracks)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    const prev = currentPage - 1;
                    setCurrentPage(prev);
                    fetchOverview(prev);
                  }
                }}
                disabled={currentPage <= 1 || loading}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    const next = currentPage + 1;
                    setCurrentPage(next);
                    fetchOverview(next);
                  }
                }}
                disabled={currentPage >= totalPages || loading}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Full Interactive Timing Studio */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSong ? (
            <div className="bg-midnight-900/60 rounded-2xl border border-white/5 p-6 space-y-5">
              {/* Active Song Control Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-midnight-950 border border-white/10 flex items-center justify-center text-amber-400 overflow-hidden">
                    {selectedSong.artworkUrl ? (
                      <img
                        src={selectedSong.artworkUrl}
                        alt={selectedSong.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {selectedSong.title}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">
                      {selectedSong.artistName} • {selectedSong.languageName} •{' '}
                      {selectedSong.durationSeconds}s
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Studio Navigation Tabs */}
                  <div className="flex rounded-xl bg-midnight-950 p-1 border border-white/10 text-xs">
                    <button
                      onClick={() => setActiveTab('lines')}
                      className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                        activeTab === 'lines'
                          ? 'bg-amber-500 text-black font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Karaoke Lines ({lines.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('simulator')}
                      className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                        activeTab === 'simulator'
                          ? 'bg-amber-500 text-black font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live Karaoke Preview</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('fulltext')}
                      className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                        activeTab === 'fulltext'
                          ? 'bg-amber-500 text-black font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Raw Lyrics</span>
                    </button>
                  </div>

                  {/* LRC Import / Export */}
                  <button
                    onClick={() => {
                      setLrcContent('');
                      setShowLrcModal('import');
                    }}
                    className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 text-xs flex items-center gap-1"
                    title="Import .LRC File"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Import LRC</span>
                  </button>

                  <button
                    onClick={handleOpenExportLrc}
                    disabled={lines.length === 0}
                    className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 text-xs flex items-center gap-1 disabled:opacity-30"
                    title="Export .LRC File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export LRC</span>
                  </button>

                  {/* Save Changes Button */}
                  <button
                    onClick={handleSaveLyrics}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Lyrics'}</span>
                  </button>
                </div>
              </div>

              {/* Master Audio Sync Player Bar & Playback Speed Governor */}
              <div className="p-4 rounded-xl bg-midnight-950 border border-white/10 space-y-3">
                <audio
                  ref={audioRef}
                  src={selectedSong.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => {
                    setIsPlaying(false);
                    setIsTapSyncMode(false);
                  }}
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono text-gray-400">
                  {/* Left: Playhead & Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayAudio}
                      className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-bold transition-all shadow-md shadow-amber-500/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div>
                      <div className="text-white font-bold text-base font-mono">
                        {Math.floor(currentTimeMs / 60000)}:
                        {Math.floor((currentTimeMs % 60000) / 1000)
                          .toString()
                          .padStart(2, '0')}
                        .
                        {Math.floor((currentTimeMs % 1000) / 10)
                          .toString()
                          .padStart(2, '0')}
                      </div>
                      <span className="text-[10px] text-gray-500">Master Studio Playhead</span>
                    </div>

                    {/* Speed Selector (0.5x, 0.75x, 1.0x, 1.25x) */}
                    <div className="flex items-center gap-1 bg-midnight-900 p-1 rounded-lg border border-white/10 ml-2">
                      <span className="text-[10px] text-gray-500 px-1.5 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                      </span>
                      {[0.5, 0.75, 1.0, 1.25].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setAudioSpeed(rate)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            playbackRate === rate
                              ? 'bg-amber-500 text-black font-bold'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Quick Studio Triggers */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Tap-to-Sync Launch Button */}
                    {!isTapSyncMode ? (
                      <button
                        onClick={startTapSyncMode}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black rounded-lg text-xs font-bold shadow-md shadow-rose-500/20 transition-all"
                      >
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        <span>Start Tap-to-Sync</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopTapSyncMode}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-bold transition-all"
                      >
                        <span>⏹ Stop Sync Mode</span>
                      </button>
                    )}

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
                      className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-medium border border-white/10 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Line</span>
                    </button>
                  </div>
                </div>

                {/* Scrubber Progress Bar */}
                <div
                  className="w-full bg-white/5 hover:bg-white/10 h-2 rounded-full cursor-pointer relative overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = clickX / rect.width;
                    const totalDur = (selectedSong.durationSeconds || 180) * 1000;
                    seekToMs(percent * totalDur);
                  }}
                >
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all"
                    style={{
                      width: `${
                        ((currentTimeMs /
                          ((selectedSong.durationSeconds || 180) * 1000)) *
                          100) || 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* INNOVATION 1 HUD: LIVE TAP-TO-SYNC CONTROL DOCK */}
              {isTapSyncMode && lines.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-midnight-950 to-rose-500/15 border-2 border-amber-500/40 shadow-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                        🔴 Live Tap-to-Sync Active
                      </span>
                    </div>
                    <div className="text-xs font-mono text-gray-400">
                      Line {tapSyncIndex + 1} of {lines.length} (
                      {Math.round(((tapSyncIndex + 1) / lines.length) * 100)}%)
                    </div>
                  </div>

                  {/* Active Line Focus Card */}
                  <div className="p-3.5 rounded-lg bg-midnight-950/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-amber-400/80 uppercase">
                        Current Phrase #{tapSyncIndex + 1}
                      </span>
                      <div className="text-sm font-semibold text-white tracking-wide">
                        {lines[tapSyncIndex]?.text || 'No text'}
                      </div>
                      {tapSyncIndex + 1 < lines.length && (
                        <div className="text-xs text-gray-500 italic">
                          Next: {lines[tapSyncIndex + 1]?.text}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={handleTapSyncAction}
                        className={`px-6 py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all shadow-xl flex items-center gap-2 ${
                          lastTapSuccess
                            ? 'bg-emerald-400 text-black scale-105'
                            : 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/30'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-black" />
                        <span>TAP NOW (SPACEBAR)</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Sync Navigation Controls */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => seekToMs(currentTimeMs - 3000)}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 flex items-center gap-1"
                        title="Seek backward 3 seconds"
                      >
                        <Rewind className="w-3 h-3" />
                        <span>-3s (Shift+←)</span>
                      </button>
                      <button
                        onClick={() => {
                          if (tapSyncIndex > 0) {
                            setTapSyncIndex(tapSyncIndex - 1);
                          }
                        }}
                        disabled={tapSyncIndex === 0}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 disabled:opacity-30"
                      >
                        Previous Line
                      </button>
                      <button
                        onClick={() => {
                          if (tapSyncIndex < lines.length - 1) {
                            setTapSyncIndex(tapSyncIndex + 1);
                          }
                        }}
                        disabled={tapSyncIndex >= lines.length - 1}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 disabled:opacity-30"
                      >
                        Skip Line
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setTapSyncIndex(0);
                        seekToMs(0);
                      }}
                      className="px-2.5 py-1 text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restart from Line 1</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 1: Line-by-Line Synchronizer */}
              {activeTab === 'lines' && (
                <div className="space-y-3">
                  {/* Global Timing Batch Adjuster Bar */}
                  <div className="flex items-center justify-between p-2.5 bg-midnight-950/80 rounded-xl border border-white/5 text-[11px] font-mono text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                      <span>Batch Timing Offset:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[-500, -100, 100, 500].map((delta) => (
                        <button
                          key={delta}
                          onClick={() => handleShiftAllTimings(delta)}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-gray-300 hover:text-white"
                          title={`Shift all line timestamps by ${delta > 0 ? '+' : ''}${delta}ms`}
                        >
                          {delta > 0 ? `+${delta}ms` : `${delta}ms`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider flex items-center justify-between px-2">
                    <span>Sequence & Timings</span>
                    <span>Lyric Text & Audio Actions</span>
                  </div>

                  <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1 admin-scrollbar">
                    {lines.map((line, idx) => {
                      const isActive = activeLineIndex === idx;
                      const isCurrentTap = isTapSyncMode && tapSyncIndex === idx;
                      return (
                        <div
                          key={idx}
                          id={`lyric-line-${idx}`}
                          className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isCurrentTap
                              ? 'bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/30'
                              : isActive
                              ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                              : 'bg-midnight-950/70 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 text-[10px] font-mono text-gray-500">
                              #{line.sequenceOrder}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleStampCurrentTime(idx, 'start')}
                                className="px-2 py-1 bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 rounded font-mono text-[10px] border border-white/10"
                                title="Click to stamp current playhead as Start Time"
                              >
                                {Math.floor(line.startTimeMs / 1000)}s{' '}
                                {line.startTimeMs % 1000}ms
                              </button>
                              <span className="text-gray-600 text-xs">→</span>
                              <button
                                onClick={() => handleStampCurrentTime(idx, 'end')}
                                className="px-2 py-1 bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 rounded font-mono text-[10px] border border-white/10"
                                title="Click to stamp current playhead as End Time"
                              >
                                {Math.floor(line.endTimeMs / 1000)}s{' '}
                                {line.endTimeMs % 1000}ms
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
                              onClick={() =>
                                playLineSnippet(line.startTimeMs, line.endTimeMs)
                              }
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

              {/* Tab 2: Live Karaoke Simulator Preview Dock */}
              {activeTab === 'simulator' && (
                <div className="relative rounded-2xl bg-midnight-950 border border-white/10 p-8 min-h-[460px] flex flex-col items-center justify-center overflow-hidden">
                  {/* Ambient Track Artwork Backdrop Blur */}
                  {selectedSong.artworkUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-3xl pointer-events-none"
                      style={{ backgroundImage: `url(${selectedSong.artworkUrl})` }}
                    />
                  )}

                  <div className="relative z-10 w-full max-w-xl mx-auto space-y-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Live Karaoke Teleprompter Preview</span>
                    </div>

                    <div className="max-h-[340px] overflow-y-auto space-y-5 px-4 py-6 admin-scrollbar">
                      {lines.length === 0 ? (
                        <div className="text-gray-500 text-xs font-mono">
                          No lines found. Add lines or import an LRC file.
                        </div>
                      ) : (
                        lines.map((line, idx) => {
                          const isActive = activeLineIndex === idx;
                          const isPast =
                            activeLineIndex !== null && idx < activeLineIndex;

                          return (
                            <div
                              key={idx}
                              ref={isActive ? simActiveLineRef : null}
                              onClick={() => seekToMs(line.startTimeMs)}
                              className={`cursor-pointer transition-all duration-300 ${
                                isActive
                                  ? 'text-amber-300 text-xl md:text-2xl font-bold font-display drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105'
                                  : isPast
                                  ? 'text-gray-600 text-sm md:text-base font-medium hover:text-gray-400'
                                  : 'text-gray-400 text-sm md:text-base font-medium hover:text-white'
                              }`}
                            >
                              {line.text}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Raw Full Text & 1-Click Parser */}
              {activeTab === 'fulltext' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
                    <p className="leading-relaxed">
                      Paste authentic lyrics in native script (Devanagari, Telugu, Tamil, Kannada, Bengali).
                    </p>
                    <button
                      onClick={handleConvertRawTextToLines}
                      className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs transition-colors flex-shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black" />
                      <span>⚡ Convert to Syncable Lines</span>
                    </button>
                  </div>
                  <textarea
                    rows={14}
                    value={fullText}
                    onChange={(e) => setFullText(e.target.value)}
                    placeholder="Enter complete song lyrics line by line..."
                    className="w-full p-4 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-amber-500/50 admin-scrollbar"
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

      {/* LRC Import / Export Modal */}
      {showLrcModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-900 border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {showLrcModal === 'export' ? 'Export Synchronized LRC' : 'Import LRC Timestamps'}
                </h3>
              </div>
              <button
                onClick={() => setShowLrcModal(null)}
                className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded bg-white/5"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-gray-400">
              {showLrcModal === 'export'
                ? 'Standard LRC timestamp file compatible with all media players and karaoke engines.'
                : 'Paste standard LRC text with [mm:ss.xx] timestamp tags or upload an .lrc file.'}
            </p>

            <textarea
              rows={12}
              value={lrcContent}
              onChange={(e) => setLrcContent(e.target.value)}
              placeholder={`[00:12.30] Example lyrics line\n[00:15.80] Next lyric phrase...`}
              className="w-full p-3 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-amber-500/50 admin-scrollbar"
            />

            <div className="flex items-center justify-between pt-2">
              {showLrcModal === 'export' ? (
                <>
                  <button
                    onClick={handleCopyLrc}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-mono transition-colors"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>
                  <button
                    onClick={handleDownloadLrc}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .lrc File</span>
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="file"
                    accept=".lrc,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setLrcContent((event.target?.result as string) || '');
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="text-xs text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-white/10 file:text-white"
                  />
                  <button
                    onClick={handleImportLrc}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply LRC Lines</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
