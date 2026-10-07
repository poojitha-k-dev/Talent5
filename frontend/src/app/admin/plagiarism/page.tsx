'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  ExternalLink,
  Sliders,
  Radio,
  FileCheck2,
  Trash2,
  Info,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  Music,
  Scale,
  Sparkles,
  ShieldCheck,
  X,
  Volume2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AudioWaveformInspector } from '@/components/audio/AudioWaveformInspector';

interface TrackItem {
  id: string;
  type: 'CATALOG_SONG' | 'CREATOR_APPLICATION' | 'COMMERCIAL_REGISTRY';
  title: string;
  artist: string;
  durationSeconds: number;
  audioUrl?: string;
  artworkUrl?: string | null;
  status: string;
  isrc?: string;
}

interface PlagiarismConflict {
  id: string;
  conflictType: 'DIRECT_AUDIO_CLONE' | 'PLAGIARISM_MISMATCH' | 'METADATA_COLLISION';
  severity: 'CRITICAL' | 'HIGH' | 'WARNING';
  similarityPercentage: number;
  title: string;
  description: string;
  sourceItem: TrackItem;
  conflictingItem: TrackItem;
  evidence: {
    fingerprintMatch: string;
    isrcConflict: boolean;
    audioMasterMatch: boolean;
  };
  status: string;
  createdAt: string;
}

interface PlagiarismStats {
  totalAudited: number;
  totalConflicts: number;
  directAudioClones: number;
  isrcCollisions: number;
  plagiarismAlerts: number;
  cleanCertifiedTracks: number;
}

const PAGE_SIZE = 10;

export default function AdminPlagiarismSentinelPage() {
  const { token: authToken } = useAuth();
  const token =
    authToken ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('talent5_token') || localStorage.getItem('token')
      : null);

  const [conflicts, setConflicts] = useState<PlagiarismConflict[]>([]);
  const [stats, setStats] = useState<PlagiarismStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'AUDIO_CLONE' | 'PLAGIARISM' | 'METADATA'>('ALL');
  const [search, setSearch] = useState<string>('');

  // Pagination (Strict 10 Records Per Page)
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Audio Previews
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Deep Waveform Modal
  const [waveformTrack, setWaveformTrack] = useState<TrackItem | null>(null);

  // Resolution Action State
  const [isResolving, setIsResolving] = useState<string | null>(null);

  const fetchOverview = async (targetPage = page) => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== 'ALL') params.append('type', activeFilter);
      params.append('page', targetPage.toString());
      params.append('limit', PAGE_SIZE.toString());

      const res = await fetch(`/api/v1/admin/plagiarism/overview?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConflicts(data.data.conflicts || []);
        setStats(data.data.stats || null);
        if (data.data.pagination) {
          setPage(data.data.pagination.page);
          setTotalPages(data.data.pagination.totalPages || 1);
          setTotalCount(data.data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load plagiarism overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(1);
  }, [token, activeFilter]);

  // Audio Playback
  const togglePlayAudio = (url?: string) => {
    if (!url) return;
    if (playingAudioUrl === url) {
      audioElement?.pause();
      setPlayingAudioUrl(null);
    } else {
      if (audioElement) audioElement.pause();
      const a = new Audio(url);
      a.play().catch(console.error);
      a.onended = () => setPlayingAudioUrl(null);
      setAudioElement(a);
      setPlayingAudioUrl(url);
    }
  };

  // Conflict Resolution
  const handleResolveConflict = async (
    conflictId: string,
    resolution: 'CERTIFY_CLEAN' | 'TAKEDOWN_INFRINGING',
    targetItem: TrackItem
  ) => {
    setIsResolving(conflictId);
    try {
      const res = await fetch('/api/v1/admin/plagiarism/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conflictId,
          resolution,
          targetId: targetItem.id,
          targetType: targetItem.type,
          notes:
            resolution === 'TAKEDOWN_INFRINGING'
              ? 'Takedown issued by administrator due to acoustic audio clone or copyright infringement.'
              : 'Certified clean by admin acoustic review.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✨ ${data.message}`);
        fetchOverview(page);
      } else {
        alert(data.message || 'Action failed');
      }
    } catch (err: any) {
      alert(err.message || 'Error resolving conflict');
    } finally {
      setIsResolving(null);
    }
  };

  const filteredConflicts = conflicts.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.sourceItem.title.toLowerCase().includes(q) ||
      c.sourceItem.artist.toLowerCase().includes(q) ||
      c.conflictingItem.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-midnight-900/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Audio Plagiarism & Duplicate Sentinel
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-400">
              Chromaprint AI v3
            </span>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Real-time cross-database audio fingerprint matching, ISRC collision detection, and copyright infringement mitigation across auditions and the master catalog.
          </p>
        </div>

        <button
          onClick={() => fetchOverview(page)}
          className="px-3.5 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs text-gray-300 flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Rescan Database</span>
        </button>
      </div>

      {/* Metrics Dossier */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
              Total Audited
            </span>
            <div className="text-xl font-bold font-display text-white">{stats.totalAudited}</div>
            <span className="text-[10px] text-gray-500 font-mono">Songs & Auditions</span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/50 border border-rose-500/20 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400">
              Direct Audio Clones
            </span>
            <div className="text-xl font-bold font-display text-rose-300">
              {stats.directAudioClones}
            </div>
            <span className="text-[10px] text-rose-400/70 font-mono">100% Bitstream Match</span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/50 border border-amber-500/20 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
              ISRC Collisions
            </span>
            <div className="text-xl font-bold font-display text-amber-300">
              {stats.isrcCollisions}
            </div>
            <span className="text-[10px] text-amber-400/70 font-mono">Duplicate Registry Codes</span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/50 border border-purple-500/20 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">
              Plagiarism Alerts
            </span>
            <div className="text-xl font-bold font-display text-purple-300">
              {stats.plagiarismAlerts}
            </div>
            <span className="text-[10px] text-purple-400/70 font-mono">Commercial Overlaps</span>
          </div>

          <div className="p-4 rounded-xl bg-midnight-900/50 border border-emerald-500/20 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              Clean Certified
            </span>
            <div className="text-xl font-bold font-display text-emerald-300">
              {stats.cleanCertifiedTracks}
            </div>
            <span className="text-[10px] text-emerald-400/70 font-mono">Original Rights Intact</span>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="p-3 bg-midnight-900/40 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-midnight-950 p-1 rounded-xl border border-white/10 text-xs">
          {[
            { id: 'ALL', label: 'All Conflicts' },
            { id: 'AUDIO_CLONE', label: 'Audio Clones' },
            { id: 'PLAGIARISM', label: 'Plagiarism Alerts' },
            { id: 'METADATA', label: 'Metadata Clashes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as any);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                activeFilter === tab.id
                  ? 'bg-rose-500 text-white font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search conflicts by title, artist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-midnight-950 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>
      </div>

      {/* Conflict Cards Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 bg-midnight-900/30 rounded-2xl border border-white/5">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
            <span className="text-xs font-mono text-gray-400">
              Running deep acoustic cross-database scan...
            </span>
          </div>
        ) : filteredConflicts.length === 0 ? (
          <div className="p-16 rounded-2xl bg-midnight-900/30 border border-white/5 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">0 Unresolved Infringement Conflicts</h3>
            <p className="text-xs text-gray-400 font-mono">
              All scanned catalog audio masters and audition submissions are certified clean.
            </p>
          </div>
        ) : (
          filteredConflicts.map((conflict) => {
            const isPlayingSource = playingAudioUrl === conflict.sourceItem.audioUrl;
            const isPlayingConflict = playingAudioUrl === conflict.conflictingItem.audioUrl;

            return (
              <div
                key={conflict.id}
                className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 space-y-4 shadow-xl hover:border-white/20 transition-all"
              >
                {/* Conflict Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl border ${
                        conflict.severity === 'CRITICAL'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-tight">
                          {conflict.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                            conflict.severity === 'CRITICAL'
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          }`}
                        >
                          {conflict.conflictType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{conflict.description}</p>
                    </div>
                  </div>

                  {/* Similarity Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-gray-500 uppercase block">Overlap Score</span>
                      <span className="text-sm font-bold text-rose-400">
                        {conflict.similarityPercentage}% Match
                      </span>
                    </div>
                    <div className="w-12 bg-white/10 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${conflict.similarityPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Comparison Deck */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Source Upload */}
                  <div className="p-4 rounded-xl bg-midnight-950/80 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                        Source Asset (Submitted)
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {conflict.sourceItem.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {conflict.sourceItem.title}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {conflict.sourceItem.artist} • {conflict.sourceItem.durationSeconds}s
                        </div>
                      </div>

                      {conflict.sourceItem.audioUrl && (
                        <button
                          onClick={() => togglePlayAudio(conflict.sourceItem.audioUrl)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            isPlayingSource
                              ? 'bg-sky-400 text-black'
                              : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                          }`}
                          title="Preview source audio"
                        >
                          {isPlayingSource ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 text-[11px] font-mono flex items-center justify-between text-gray-400">
                      <span>ISRC: {conflict.sourceItem.isrc}</span>
                      <button
                        onClick={() => setWaveformTrack(conflict.sourceItem)}
                        className="text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Inspect Waveform</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Conflicting Track */}
                  <div className="p-4 rounded-xl bg-midnight-950/80 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                        Conflicting Existing Master
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {conflict.conflictingItem.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {conflict.conflictingItem.title}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {conflict.conflictingItem.artist} • {conflict.conflictingItem.durationSeconds}s
                        </div>
                      </div>

                      {conflict.conflictingItem.audioUrl && (
                        <button
                          onClick={() => togglePlayAudio(conflict.conflictingItem.audioUrl)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            isPlayingConflict
                              ? 'bg-rose-500 text-white'
                              : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                          }`}
                          title="Preview conflicting audio"
                        >
                          {isPlayingConflict ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 text-[11px] font-mono flex items-center justify-between text-gray-400">
                      <span>ISRC: {conflict.conflictingItem.isrc}</span>
                      <span className="text-rose-400 font-semibold">
                        {conflict.evidence.fingerprintMatch}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2 text-gray-400 font-mono">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span>Resolution Options:</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        handleResolveConflict(conflict.id, 'CERTIFY_CLEAN', conflict.sourceItem)
                      }
                      disabled={isResolving === conflict.id}
                      className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl font-mono transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Certify Clean & Original</span>
                    </button>

                    <button
                      onClick={() =>
                        handleResolveConflict(conflict.id, 'TAKEDOWN_INFRINGING', conflict.sourceItem)
                      }
                      disabled={isResolving === conflict.id}
                      className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl font-mono font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Immediate Takedown</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Strict 10 Pagination Footer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-midnight-950/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 shadow-xl text-xs text-gray-400">
        <span className="font-mono">
          Page {page} of {totalPages} ({totalCount} total conflicts audited)
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (page > 1) fetchOverview(page - 1);
            }}
            disabled={page <= 1 || loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (page < totalPages) fetchOverview(page + 1);
            }}
            disabled={page >= totalPages || loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deep Audio Waveform Modal */}
      {waveformTrack && waveformTrack.audioUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-midnight-900 border border-white/10 rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Acoustic Forensic Inspection: {waveformTrack.title}
                </h3>
              </div>
              <button
                onClick={() => setWaveformTrack(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AudioWaveformInspector
              audioUrl={waveformTrack.audioUrl}
              title={waveformTrack.title}
              artistOrCreator={waveformTrack.artist}
              durationSeconds={waveformTrack.durationSeconds}
              accentColor="rose"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setWaveformTrack(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-mono"
              >
                Close Forensic Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
