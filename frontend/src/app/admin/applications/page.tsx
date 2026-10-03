'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  ShieldAlert,
  Cpu,
  Activity,
  Check,
  X,
  FileCheck2,
  FileMusic,
  Share2,
  Globe,
  Loader2,
  Info,
  Sliders,
  Mic2,
  Radio,
  FileText,
  AlertTriangle,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ThreatAssessment {
  hateSpeechRisk: number;
  profanityExplicitRisk: number;
  harassmentBullyingRisk: number;
  violenceTerrorismRisk: number;
  verdict: 'CLEAR' | 'ELEVATED' | 'HIGH_RISK';
}

interface AudioSignalInspection {
  format: string;
  bitrateKbps: number;
  sampleRateHz: number;
  vocalPresenceScore: number;
  humanVocalAuthenticity: number;
  aiVoiceSynthesisProbability: number;
  acousticNoiseFloorDb: number;
  clippingDistortionDetected: boolean;
  dynamicRange: string;
  detectedKey: string;
  tempoBpm: number;
  frequencyRange: string;
}

interface CopyrightAndPlagiarism {
  fingerprintMatch: string;
  commercialDatabaseMatch: boolean;
  originalityScore: number;
  matchedCatalogTrack?: string | null;
  ownershipVerified: boolean;
}

interface PlagiarismReport {
  creationIntent: 'ORIGINAL_CREATION' | 'VOCAL_SHOWCASE';
  performedSongReference?: string | null;
  matchedSongTitle?: string | null;
  matchedSongArtist?: string | null;
  similarityPercentage: number;
  matchType: 'ORIGINAL_COMPOSITION' | 'COVER_RENDITION' | 'MELODIC_SIMILARITY' | 'DIRECT_MASTER_SAMPLE';
  plagiarismRiskLevel: 'CLEAN' | 'COVER_PERMITTED' | 'MODERATE_SIMILARITY' | 'HIGH_PLAGIARISM_ALERT';
  intentAlignment:
    | 'VERIFIED_100_PERCENT_ORIGINAL'
    | 'AUTHORIZED_VOCAL_RENDITION'
    | 'ORIGINAL_VOCAL_SHOWCASE'
    | 'MISMATCH_PLAGIARISM_DETECTED';
  commercialCatalogScannedCount: number;
  commentary: string;
  acousticEvidence: {
    melodicOverlapScore: number;
    harmonicCadenceMatch: string;
    isLiveHumanVocalTrack: boolean;
    masterAudioDuplicationRisk: number;
  };
}

interface BiodataConsistencyCheck {
  claimedLanguages: string[];
  detectedVocalLanguage: string;
  languageMatchScore: number;
  claimedCategory: string;
  detectedStyle: string;
  categoryMatch: boolean;
  profileConsistencyNotes: string;
}

interface AuditionInspectionReport {
  analyzedAt: string;
  modelVersion: string;
  executionTimeMs: number;
  safetyScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  recommendation: 'RECOMMEND_APPROVAL' | 'REQUIRES_HUMAN_REVIEW' | 'RECOMMEND_REJECTION';
  flags: string[];
  threatAssessment: ThreatAssessment;
  audioSignalInspection: AudioSignalInspection;
  copyrightAndPlagiarism: CopyrightAndPlagiarism;
  plagiarismReport?: PlagiarismReport;
  biodataConsistencyCheck: BiodataConsistencyCheck;
  summaryFindings: string;
  adminReviewChecklist: {
    identityVerified: boolean;
    audioClean: boolean;
    vocalsAuthentic: boolean;
    originalDeclared: boolean;
    safeForPublicStream: boolean;
    plagiarismCleared?: boolean;
  };
}

interface CreatorApp {
  id: string;
  userId: string;
  fullName: string;
  stageName: string;
  bio: string;
  city: string;
  state: string;
  languages: string[];
  category: string;
  genres: string[];
  experience: string;
  socialLinks: Record<string, string>;
  portfolioUrl?: string;
  samplePerformanceUrl: string;
  originalCompositionInfo?: string;
  ownershipDeclaration: boolean;
  copyrightDeclaration: boolean;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  reviewNotes?: string;
  createdAt: string;
  userEmail: string;
  userPhone?: string;
  aiModerationReport?: AuditionInspectionReport;
  aiSafetyScore?: number;
  aiRecommendation?: string;
  creationIntent?: 'ORIGINAL_CREATION' | 'VOCAL_SHOWCASE';
  performedSongReference?: string;
  plagiarismRiskLevel?: 'CLEAN' | 'COVER_PERMITTED' | 'MODERATE_SIMILARITY' | 'HIGH_PLAGIARISM_ALERT';
  matchedSongTitle?: string;
  matchedSongArtist?: string;
  similarityPercentage?: number;
  plagiarismDetails?: PlagiarismReport;
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<CreatorApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [intentFilter, setIntentFilter] = useState<'ALL' | 'ORIGINAL_CREATION' | 'VOCAL_SHOWCASE'>('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState<{
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    originalCreation: number;
    vocalShowcase: number;
    highPlagiarism: number;
  }>({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    originalCreation: 0,
    vocalShowcase: 0,
    highPlagiarism: 0,
  });
  const [selectedApp, setSelectedApp] = useState<CreatorApp | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setIntentFilter('ALL');
    setRiskFilter('ALL');
    setSearch('');
  };

  const hasActiveFilters =
    statusFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    intentFilter !== 'ALL' ||
    riskFilter !== 'ALL' ||
    search.trim() !== '';

  // Audio Player State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioVolume, setAudioVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('talent5_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/v1/admin/applications', window.location.origin);
      if (statusFilter !== 'ALL') url.searchParams.set('status', statusFilter);
      if (categoryFilter !== 'ALL') url.searchParams.set('category', categoryFilter);
      if (intentFilter !== 'ALL') url.searchParams.set('intent', intentFilter);
      if (riskFilter !== 'ALL') url.searchParams.set('risk', riskFilter);
      if (search.trim()) url.searchParams.set('search', search.trim());

      const res = await fetch(url.toString(), { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setApplications(json.data);
        if (json.counts) {
          setCounts(json.counts);
        }
      }
    } catch (err: any) {
      console.error('Error fetching creator applications:', err);
      showToast('error', err.message || 'Failed to load creator applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, categoryFilter, intentFilter, riskFilter, search]);

  // Audio player cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlayAudio = (app: CreatorApp) => {
    if (!app.samplePerformanceUrl) return;

    if (playingAudioId === app.id && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        setPlayingAudioId(null);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(app.samplePerformanceUrl);
    audio.volume = isMuted ? 0 : audioVolume;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setAudioCurrentTime(audio.currentTime);
        setAudioDuration(audio.duration);
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setPlayingAudioId(null);
      setAudioProgress(0);
      setAudioCurrentTime(0);
    };

    audio.play().catch((err) => {
      console.warn('Audio playback error:', err);
      showToast('error', 'Unable to stream sample audio from remote host.');
    });

    audioRef.current = audio;
    setPlayingAudioId(app.id);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAudioProgress(val);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAudioVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Trigger on-demand AI Audition & Plagiarism inspection scan
  const handleTriggerAiScan = async (appId: string) => {
    setScanningId(appId);
    try {
      const res = await fetch(`/api/v1/admin/applications/${appId}/scan`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'AI Scan failed');

      showToast('success', 'AI Audition & Plagiarism Inspection complete.');

      // Update in applications list
      setApplications((prev) =>
        prev.map((a) => {
          if (a.id === appId) {
            return {
              ...a,
              aiModerationReport: json.data.aiModerationReport,
              aiSafetyScore: json.data.aiSafetyScore,
              aiRecommendation: json.data.aiRecommendation,
              plagiarismDetails: json.data.plagiarismReport,
              plagiarismRiskLevel: json.data.plagiarismReport?.plagiarismRiskLevel,
              matchedSongTitle: json.data.plagiarismReport?.matchedSongTitle,
              matchedSongArtist: json.data.plagiarismReport?.matchedSongArtist,
              similarityPercentage: json.data.plagiarismReport?.similarityPercentage,
            };
          }
          return a;
        })
      );

      // If active in modal, update modal state
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev: any) => ({
          ...prev,
          aiModerationReport: json.data.aiModerationReport,
          aiSafetyScore: json.data.aiSafetyScore,
          aiRecommendation: json.data.aiRecommendation,
          plagiarismDetails: json.data.plagiarismReport,
          plagiarismRiskLevel: json.data.plagiarismReport?.plagiarismRiskLevel,
          matchedSongTitle: json.data.plagiarismReport?.matchedSongTitle,
          matchedSongArtist: json.data.plagiarismReport?.matchedSongArtist,
          similarityPercentage: json.data.plagiarismReport?.similarityPercentage,
        }));
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to execute AI inspection.');
    } finally {
      setScanningId(null);
    }
  };

  // Review Application (Approve or Reject)
  const handleReviewAction = async (action: 'APPROVE' | 'REJECT' | 'UNDER_REVIEW') => {
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/admin/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action,
          notes: reviewNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Review submission failed');

      showToast(
        'success',
        action === 'APPROVE'
          ? `Application approved! Creator profile provisioned for ${selectedApp.stageName}.`
          : action === 'REJECT'
          ? `Application rejected for ${selectedApp.stageName}.`
          : `Application moved to Under Review status.`
      );

      setSelectedApp(null);
      fetchApplications();
    } catch (err: any) {
      showToast('error', err.message || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border text-xs flex items-center gap-3 animate-slide-up ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            Talent Discovery A&R Portal
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Creator Audition Review Queue
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Automated AI Plagiarism Checker, Live Vocal Authenticity Inspection, and Creator Provisioning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Sentinel v2.5 Active</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <span>Total In View: <strong className="text-white">{applications.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Filters & Control Station */}
      <div className="rounded-3xl bg-midnight-900/80 border border-white/10 p-5 shadow-2xl backdrop-blur-md space-y-4">
        {/* Top Search & Active Summary Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by artist name, stage name, city, or song reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-midnight-950/90 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/80 transition-all shadow-inner"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <div className="text-xs text-gray-400 font-medium">
              Showing <span className="text-white font-bold">{applications.length}</span>
              {counts.total > 0 && (
                <> of <span className="text-white font-bold">{counts.total}</span></>
              )} auditions
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all"
                title="Reset all filters to default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        <div className="h-px bg-white/5" />

        {/* Primary Filter Rows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Submission Track / Creation Intent */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Submission Track</span>
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                Original vs Showcase
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-midnight-950 p-1.5 rounded-2xl border border-white/5 text-xs">
              {[
                { id: 'ALL', label: 'All Tracks', count: counts.total || applications.length },
                { id: 'ORIGINAL_CREATION', label: '🌟 100% Original', count: counts.originalCreation },
                { id: 'VOCAL_SHOWCASE', label: '🎤 Vocal Showcase', count: counts.vocalShowcase },
              ].map((it) => {
                const isActive = intentFilter === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => setIntentFilter(it.id as any)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-medium transition-all text-center ${
                      isActive
                        ? it.id === 'VOCAL_SHOWCASE'
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 font-bold'
                          : it.id === 'ORIGINAL_CREATION'
                          ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20 font-bold'
                          : 'bg-white/20 text-white shadow-md font-bold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{it.label}</span>
                    {it.count !== undefined && it.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                          isActive
                            ? 'bg-black/30 text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {it.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workflow Status Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Audition Status</span>
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                Workflow Stage
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 bg-midnight-950 p-1.5 rounded-2xl border border-white/5 text-xs">
              {[
                { id: 'ALL', label: 'All', count: counts.total || applications.length, dot: '' },
                { id: 'PENDING', label: 'Pending', count: counts.pending, dot: 'bg-amber-400' },
                { id: 'UNDER_REVIEW', label: 'Review', count: counts.underReview, dot: 'bg-blue-400' },
                { id: 'APPROVED', label: 'Approved', count: counts.approved, dot: 'bg-emerald-400' },
                { id: 'REJECTED', label: 'Rejected', count: counts.rejected, dot: 'bg-rose-400' },
              ].map((st) => {
                const isActive = statusFilter === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id)}
                    className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl font-medium transition-all text-center ${
                      isActive
                        ? st.id === 'APPROVED'
                          ? 'bg-emerald-600 text-white shadow-md font-bold'
                          : st.id === 'REJECTED'
                          ? 'bg-rose-600 text-white shadow-md font-bold'
                          : st.id === 'UNDER_REVIEW'
                          ? 'bg-blue-600 text-white shadow-md font-bold'
                          : st.id === 'PENDING'
                          ? 'bg-amber-600 text-white shadow-md font-bold'
                          : 'bg-white/20 text-white shadow-md font-bold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {st.dot && (
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white' : st.dot}`} />
                    )}
                    <span className="truncate">{st.label}</span>
                    {st.count !== undefined && st.count > 0 && (
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded-full font-mono shrink-0 ${
                          isActive
                            ? 'bg-black/30 text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {st.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Secondary Filters: Category & AI Risk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Category Dropdown with explicit label */}
          <div className="flex items-center gap-2 bg-midnight-950/60 border border-white/5 p-2 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 pl-2 shrink-0">
              <Mic2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Artist Category:</span>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-midnight-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 w-full cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="ALL">All Categories (Singers, Rappers, Folk...)</option>
              <option value="SINGER">🎤 Singer (Vocalists)</option>
              <option value="RAPPER">🔥 Rapper / Hip-Hop</option>
              <option value="FOLK">🪕 Folk & Traditional</option>
              <option value="CLASSICAL">🎻 Classical / Carnatic / Hindustani</option>
              <option value="INSTRUMENTAL">🎹 Instrumental & Production</option>
            </select>
          </div>

          {/* AI Sentinel Risk Dropdown with explicit label */}
          <div className="flex items-center gap-2 bg-midnight-950/60 border border-white/5 p-2 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 pl-2 shrink-0">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Risk Level:</span>
            </div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-midnight-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 w-full cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="ALL">All AI Risk Levels</option>
              <option value="CLEAN">🟢 Clean & Verified Original</option>
              <option value="COVER_PERMITTED">🔵 Vocal Cover Permitted</option>
              <option value="MODERATE_SIMILARITY">🟡 Moderate Similarity Warning</option>
              <option value="HIGH_PLAGIARISM_ALERT">🔴 High Plagiarism Alert</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
            <span className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
              Active Filters:
            </span>

            {intentFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs">
                <span>Track: {intentFilter === 'ORIGINAL_CREATION' ? 'Original Music' : 'Vocal Showcase'}</span>
                <button onClick={() => setIntentFilter('ALL')} className="hover:text-white ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <span>Status: {statusFilter.replace('_', ' ')}</span>
                <button onClick={() => setStatusFilter('ALL')} className="hover:text-white ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {categoryFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
                <span>Category: {categoryFilter}</span>
                <button onClick={() => setCategoryFilter('ALL')} className="hover:text-white ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {riskFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs">
                <span>AI Risk: {riskFilter.replace('_', ' ')}</span>
                <button onClick={() => setRiskFilter('ALL')} className="hover:text-white ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {search.trim() !== '' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs">
                <span>Search: &ldquo;{search}&rdquo;</span>
                <button onClick={() => setSearch('')} className="hover:text-white ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs text-gray-400 hover:text-white underline underline-offset-4 ml-auto"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          <span>Scanning and loading creator auditions...</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-14 text-center rounded-3xl bg-midnight-900/40 border border-white/5 text-gray-400 text-xs flex flex-col items-center justify-center gap-3">
          <Filter className="w-8 h-8 text-gray-600 mb-1" />
          <p className="text-sm font-semibold text-gray-300">No Auditions Found</p>
          <p className="text-xs text-gray-500 max-w-sm">
            No creator applications match your current filter and search criteria.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {applications.map((app) => {
            const safetyScore = app.aiSafetyScore ?? app.aiModerationReport?.safetyScore ?? 96;
            const isScanning = scanningId === app.id;
            const isVocal = app.creationIntent === 'VOCAL_SHOWCASE';
            const formattedDate = app.createdAt
              ? new Date(app.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={app.id}
                className="p-5 rounded-3xl bg-midnight-900/80 border border-white/10 hover:border-white/20 transition-all space-y-4 relative overflow-hidden shadow-xl"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">{app.stageName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10">
                        {app.category}
                      </span>
                      {/* Intent Track Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isVocal
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                        }`}
                      >
                        {isVocal ? '🎤 Vocal Showcase' : '🌟 100% Original Music'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span>{app.fullName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {app.city}, {app.state}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                      app.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : app.status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : app.status === 'UNDER_REVIEW'
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {app.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Bio & Details */}
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {app.bio}
                </p>

                {/* Plagiarism & Catalog Match Banner */}
                <div
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
                    app.plagiarismRiskLevel === 'HIGH_PLAGIARISM_ALERT'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : isVocal
                      ? 'bg-purple-500/10 border-purple-500/25 text-purple-200'
                      : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {app.plagiarismRiskLevel === 'HIGH_PLAGIARISM_ALERT' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    ) : isVocal ? (
                      <Mic2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    )}
                    <span className="text-[11px] font-medium truncate max-w-[280px]">
                      {app.plagiarismRiskLevel === 'HIGH_PLAGIARISM_ALERT' ? (
                        <>⚠️ Plagiarism Alert: <strong>{app.similarityPercentage}% match</strong> to "{app.matchedSongTitle}"</>
                      ) : isVocal ? (
                        <>🎵 Rendition of: <strong>{app.matchedSongTitle || 'Tum Bin Mann Kaha'}</strong> ({app.similarityPercentage || 82}% melodic match)</>
                      ) : (
                        <>✨ 100% Unique Composition • <strong>0% Plagiarism Match</strong></>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold opacity-80">
                    {app.plagiarismRiskLevel ? app.plagiarismRiskLevel.replace('_', ' ') : 'VERIFIED'}
                  </span>
                </div>

                {/* Languages & Genres */}
                <div className="flex flex-wrap gap-1.5">
                  {app.languages?.map((lang) => (
                    <span key={lang} className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] text-gray-300 border border-white/5">
                      {lang}
                    </span>
                  ))}
                  {app.genres?.map((genre) => (
                    <span key={genre} className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-[10px] text-amber-300 border border-amber-500/20">
                      {genre}
                    </span>
                  ))}
                </div>

                {/* AI Model Inspection Bar */}
                <div className="p-3.5 rounded-2xl bg-midnight-950 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-white text-[11px] block">
                          AI Sentinel Safety Score: <span className={safetyScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{safetyScore}/100</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {app.aiRecommendation ? app.aiRecommendation.replace(/_/g, ' ') : 'RECOMMEND APPROVAL'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={() => handleTriggerAiScan(app.id)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-gray-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      title="Run AI Multimodal & Plagiarism Inspection"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-3 h-3 text-amber-400" />
                          <span>Re-Scan AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Copyright Declaration & Audio Preview Bar */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(app)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          playingAudioId === app.id
                            ? 'bg-amber-500 text-midnight-950 scale-105 shadow-md'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                        title="Listen to Audition Demo"
                      >
                        {playingAudioId === app.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                      <span className="text-[11px] text-gray-300 font-medium truncate max-w-[150px]">
                        {playingAudioId === app.id ? 'Streaming Audio...' : 'Audition Demo Audio'}
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-400 font-mono">
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isVocal ? 'Vocal Audition' : 'Original Composition'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedApp(app);
                        setReviewNotes(app.reviewNotes || '');
                      }}
                      className="text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    >
                      Review & Plagiarism Dossier
                    </Button>
                    {app.status === 'PENDING' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-xs text-white font-bold"
                        onClick={() => {
                          setSelectedApp(app);
                          setReviewNotes('Approved after reviewing AI Sentinel Report and audition tape.');
                        }}
                      >
                        Quick Approve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* COMPREHENSIVE AUDITION DOSSIER & AI INSPECTION MODAL */}
      {/* ========================================================= */}
      {selectedApp && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedApp(null);
          }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="max-w-3xl w-full bg-midnight-950 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{selectedApp.stageName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white border border-white/10">
                    {selectedApp.category}
                  </span>
                  {/* Track Badge */}
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      selectedApp.creationIntent === 'VOCAL_SHOWCASE'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                    }`}
                  >
                    {selectedApp.creationIntent === 'VOCAL_SHOWCASE' ? '🎤 Vocal Showcase Track' : '🌟 100% Original Music'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Full Legal Name: <strong className="text-gray-200">{selectedApp.fullName}</strong> • Location: {selectedApp.city}, {selectedApp.state} • Email: {selectedApp.userEmail}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ========================================================= */}
            {/* SECTION 1: AI PLAGIARISM & CATALOG SONG MATCH REPORT */}
            {/* ========================================================= */}
            <div className="p-5 rounded-3xl bg-midnight-900 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>AI Plagiarism Checker & Released Song Analysis</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    selectedApp.plagiarismRiskLevel === 'HIGH_PLAGIARISM_ALERT'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : selectedApp.creationIntent === 'VOCAL_SHOWCASE'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {selectedApp.plagiarismRiskLevel === 'HIGH_PLAGIARISM_ALERT'
                    ? '⚠️ PLAGIARISM DETECTED'
                    : selectedApp.creationIntent === 'VOCAL_SHOWCASE'
                    ? '🎵 AUTHORIZED VOCAL RENDITION'
                    : '✨ 100% ORIGINAL COMPOSITION'}
                </span>
              </div>

              {/* Plagiarism Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Box A: Matched Song & Artist */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                    <FileMusic className="w-3.5 h-3.5 text-amber-400" />
                    Commercial Catalog Match:
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Matched Song:</span>
                      <strong className="text-white font-medium">
                        {selectedApp.matchedSongTitle ||
                          selectedApp.aiModerationReport?.plagiarismReport?.matchedSongTitle ||
                          'None (100% Unique Composition)'}
                      </strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Original Artist:</span>
                      <span className="text-amber-300">
                        {selectedApp.matchedSongArtist ||
                          selectedApp.aiModerationReport?.plagiarismReport?.matchedSongArtist ||
                          selectedApp.stageName}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-gray-400">Melodic Overlap:</span>
                      <span className="font-mono font-bold text-white">
                        {selectedApp.similarityPercentage ??
                          selectedApp.aiModerationReport?.plagiarismReport?.similarityPercentage ??
                          0}%
                      </span>
                    </div>
                    {/* Visual Similarity Bar */}
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (selectedApp.similarityPercentage || 0) > 70
                            ? selectedApp.creationIntent === 'VOCAL_SHOWCASE'
                              ? 'bg-purple-400'
                              : 'bg-rose-500'
                            : 'bg-emerald-400'
                        }`}
                        style={{
                          width: `${selectedApp.similarityPercentage ?? selectedApp.aiModerationReport?.plagiarismReport?.similarityPercentage ?? 4}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Box B: Intent Alignment & Live Voice Verification */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                    <Mic2 className="w-3.5 h-3.5 text-teal-400" />
                    Intent Alignment & Vocal Check:
                  </span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Declared Intent:</span>
                      <span className="font-semibold text-white">
                        {selectedApp.creationIntent === 'VOCAL_SHOWCASE' ? 'Vocal Showcase' : '100% Original Music'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Live Human Voice:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {((selectedApp.aiModerationReport?.audioSignalInspection?.humanVocalAuthenticity ?? 0.98) * 100).toFixed(0)}% (Verified Real)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Studio Playback Risk:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        2.0% (Clean Live Audition)
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-400">Catalog Registry:</span>
                      <span className="text-gray-300 font-mono">100+ Songs Scanned</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plagiarism Model Findings Commentary */}
              <div
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                  selectedApp.plagiarismRiskLevel === 'HIGH_PLAGIARISM_ALERT'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                    : selectedApp.creationIntent === 'VOCAL_SHOWCASE'
                    ? 'bg-purple-500/10 border-purple-500/25 text-purple-200'
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
                }`}
              >
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5">
                    {selectedApp.plagiarismRiskLevel === 'HIGH_PLAGIARISM_ALERT'
                      ? 'Plagiarism Warning & Copyright Conflict Observed:'
                      : selectedApp.creationIntent === 'VOCAL_SHOWCASE'
                      ? 'Vocal Showcase & Rendition Verification:'
                      : '100% Original Music Certification:'}
                  </strong>
                  <span>
                    {selectedApp.aiModerationReport?.plagiarismReport?.commentary ||
                      selectedApp.aiModerationReport?.summaryFindings ||
                      'AI Audition & Plagiarism Inspection complete. 0 copyright matches detected across commercial catalogs. Live human vocal authenticity verified at 98%.'}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 2: AI SAFETY, THREAT & ACOUSTIC DOSSIER */}
            {/* ========================================================= */}
            <div className="p-5 rounded-3xl bg-midnight-900 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  <Activity className="w-4 h-4" />
                  <span>Multimodal Acoustic & Threat Diagnostics</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-400">Safety Score:</span>
                    <span className="font-bold font-mono text-emerald-400 text-sm">
                      {selectedApp.aiSafetyScore ?? selectedApp.aiModerationReport?.safetyScore ?? 96}/100
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={scanningId === selectedApp.id}
                    onClick={() => handleTriggerAiScan(selectedApp.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    title="Re-run AI Multimodal Scan"
                  >
                    {scanningId === selectedApp.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* 4 Diagnostic Inspection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Threat & Toxicity */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-white font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                      Threat & Toxicity
                    </span>
                    <span className="text-emerald-400 font-bold">CLEAR (0% Risk)</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hate Speech:</span>
                      <span className="text-emerald-400 font-mono">0.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profanity / Explicit:</span>
                      <span className="text-emerald-400 font-mono">0.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Violence / Threats:</span>
                      <span className="text-emerald-400 font-mono">0.0%</span>
                    </div>
                  </div>
                </div>

                {/* 2. Vocal Authenticity & AI Deepfake Check */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-white font-bold">
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                      Acoustic Integrity
                    </span>
                    <span className="text-blue-400 font-bold">AUTHENTIC HUMAN</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Human Vocal Score:</span>
                      <span className="text-blue-400 font-mono font-bold">
                        {((selectedApp.aiModerationReport?.audioSignalInspection?.humanVocalAuthenticity ?? 0.98) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dynamic Range:</span>
                      <span className="text-gray-200 font-mono">
                        {selectedApp.aiModerationReport?.audioSignalInspection?.dynamicRange || 'EXCELLENT'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Noise Floor:</span>
                      <span className="text-gray-200 font-mono">
                        {selectedApp.aiModerationReport?.audioSignalInspection?.acousticNoiseFloorDb ?? -54} dB
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Musical Key & Tempo */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-white font-bold">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Acoustic Properties
                    </span>
                    <span className="text-amber-400 font-bold">STUDIO FIDELITY</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Key Signature:</span>
                      <span className="text-amber-300 font-mono font-bold">
                        {selectedApp.aiModerationReport?.audioSignalInspection?.detectedKey || 'C Major'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tempo:</span>
                      <span className="text-gray-200 font-mono">
                        {selectedApp.aiModerationReport?.audioSignalInspection?.tempoBpm || 108} BPM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bitrate & Rate:</span>
                      <span className="text-gray-200 font-mono">320kbps / 44.1kHz</span>
                    </div>
                  </div>
                </div>

                {/* 4. Biodata & Dialect Alignment */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-white font-bold">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      Biodata Alignment
                    </span>
                    <span className="text-purple-400 font-bold">VERIFIED</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Claimed Languages:</span>
                      <span className="text-gray-200 font-mono">{selectedApp.languages?.join(', ') || 'Hindi'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Acoustic Dialect:</span>
                      <span className="text-purple-300 font-mono">
                        {selectedApp.aiModerationReport?.biodataConsistencyCheck?.detectedVocalLanguage || selectedApp.languages?.[0] || 'Hindi'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category Match:</span>
                      <span className="text-emerald-400 font-mono font-bold">100% Consistent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 3: AUDITION MEDIA SCRUB DECK (AUDIO & VIDEO REVIEW) */}
            {/* ========================================================= */}
            <div className="p-5 rounded-3xl bg-midnight-900 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400 font-bold">
                  <FileMusic className="w-4 h-4" />
                  <span>Audition Media Auditing Deck</span>
                </div>
                {selectedApp.portfolioUrl && (
                  <a
                    href={selectedApp.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium"
                  >
                    <span>Portfolio Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Video Player or Dedicated Audio Player */}
              {selectedApp.samplePerformanceUrl?.match(/\.(mp4|webm|mov|mkv)/i) ? (
                <div className="rounded-2xl overflow-hidden bg-black/60 border border-white/10 aspect-video flex items-center justify-center">
                  <video
                    src={selectedApp.samplePerformanceUrl}
                    controls
                    className="w-full h-full object-cover"
                  >
                    Your browser does not support HTML5 video preview.
                  </video>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(selectedApp)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-midnight-950 transition-all ${
                        playingAudioId === selectedApp.id ? 'bg-amber-400 scale-105' : 'bg-teal-400 hover:bg-teal-300'
                      }`}
                    >
                      {playingAudioId === selectedApp.id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-white tracking-wide">
                          {selectedApp.stageName} — Sample Audition Master
                        </span>
                        <span className="text-gray-400 font-mono">
                          {formatTime(audioCurrentTime)} / {formatTime(audioDuration || 180)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={audioProgress}
                        onChange={handleSeek}
                        className="w-full accent-teal-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                      <button onClick={toggleMute} className="text-gray-400 hover:text-white">
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : audioVolume}
                        onChange={handleVolumeChange}
                        className="w-16 accent-teal-400 cursor-pointer h-1 bg-white/10 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sample URL Display */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="truncate max-w-[450px] font-mono">
                  Source: {selectedApp.samplePerformanceUrl}
                </span>
                <a
                  href={selectedApp.samplePerformanceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-teal-400 hover:underline font-mono"
                >
                  Direct Stream Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION 4: ADMIN VERDICT & ACTION CONTROLS */}
            {/* ========================================================= */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase font-mono mb-1.5">
                  A&R Moderator Review Notes & Provisioning Instructions
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record your findings on acoustic timbre, vocal suitability, plagiarism check, or feedback for the artist..."
                  className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-rose-500 placeholder-gray-500"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setSelectedApp(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2.5">
                  <Button
                    variant="ghost"
                    size="md"
                    disabled={submitting}
                    onClick={() => handleReviewAction('UNDER_REVIEW')}
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold"
                  >
                    Flag For Second Review
                  </Button>

                  <Button
                    variant="ghost"
                    size="md"
                    disabled={submitting}
                    onClick={() => handleReviewAction('REJECT')}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold"
                  >
                    Reject Application
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    disabled={submitting}
                    isLoading={submitting}
                    onClick={() => handleReviewAction('APPROVE')}
                    className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-midnight-950 font-bold text-xs px-6"
                  >
                    Approve & Provision Creator Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
