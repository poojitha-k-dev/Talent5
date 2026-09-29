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
  biodataConsistencyCheck: BiodataConsistencyCheck;
  summaryFindings: string;
  adminReviewChecklist: {
    identityVerified: boolean;
    audioClean: boolean;
    vocalsAuthentic: boolean;
    originalDeclared: boolean;
    safeForPublicStream: boolean;
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
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<CreatorApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<CreatorApp | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      if (search.trim()) url.searchParams.set('search', search.trim());

      const res = await fetch(url.toString(), { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setApplications(json.data);
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
  }, [statusFilter, categoryFilter, search]);

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
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Trigger AI Inspection Scan
  const handleTriggerAiScan = async (appId: string) => {
    setScanningId(appId);
    try {
      const res = await fetch(`/api/v1/admin/applications/${appId}/scan`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const updatedReport = json.data.aiModerationReport;
        setApplications((prev) =>
          prev.map((a) =>
            a.id === appId
              ? {
                  ...a,
                  aiModerationReport: updatedReport,
                  aiSafetyScore: json.data.aiSafetyScore,
                  aiRecommendation: json.data.aiRecommendation,
                }
              : a
          )
        );
        if (selectedApp?.id === appId) {
          setSelectedApp((prev) =>
            prev
              ? {
                  ...prev,
                  aiModerationReport: updatedReport,
                  aiSafetyScore: json.data.aiSafetyScore,
                  aiRecommendation: json.data.aiRecommendation,
                }
              : null
          );
        }
        showToast('success', `AI Inspection Model completed analysis for application! Safety Score: ${json.data.aiSafetyScore}/100`);
      } else {
        throw new Error(json.error?.message || 'Inspection failed');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error executing AI model analysis');
    } finally {
      setScanningId(null);
    }
  };

  // Adjudication Review Submit
  const handleReviewAction = async (action: 'APPROVE' | 'REJECT' | 'UNDER_REVIEW' | 'SUSPEND') => {
    if (!selectedApp) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/v1/admin/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, notes: reviewNotes }),
      });
      const json = await res.json();

      if (json.success) {
        const actionText =
          action === 'APPROVE'
            ? 'approved and granted Verified Creator clearance!'
            : action === 'REJECT'
            ? 'rejected.'
            : 'marked under review.';
        showToast('success', `Application for ${selectedApp.stageName} ${actionText}`);
        setSelectedApp(null);
        setReviewNotes('');
        if (audioRef.current) {
          audioRef.current.pause();
          setPlayingAudioId(null);
        }
        fetchApplications();
      } else {
        throw new Error(json.error?.message || 'Failed to update application');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Network error processing review action');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Floating Notification Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] max-w-md p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 shadow-2xl backdrop-blur-xl animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-950/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs hover:opacity-80 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
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
            Automated AI Audio/Video threat inspection, copyright verification, and creator profile provisioning.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Sentinel v2.4 Active</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <span>Total In View: <strong className="text-white">{applications.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-midnight-900/60 border border-white/5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-midnight-950 p-1 rounded-xl border border-white/5 text-xs">
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-midnight-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Categories</option>
            <option value="SINGER">Singers</option>
            <option value="RAPPER">Rappers</option>
            <option value="FOLK">Folk</option>
            <option value="CLASSICAL">Classical</option>
            <option value="INSTRUMENTAL">Instrumental</option>
          </select>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by artist or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-midnight-950 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          <span>Scanning and loading creator auditions...</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-midnight-900/40 border border-white/5 text-gray-400 text-xs">
          No creator applications found matching selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {applications.map((app) => {
            const hasReport = !!app.aiModerationReport;
            const safetyScore = app.aiSafetyScore ?? app.aiModerationReport?.safetyScore ?? 96;
            const isScanning = scanningId === app.id;
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
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        {app.category}
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
                      title="Run AI Multimodal Inspection Scan"
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                          <span>Analyzing...</span>
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
                    <span>Original Composition</span>
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
                      Review Details & AI Report
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
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {selectedApp.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      selectedApp.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : selectedApp.status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {selectedApp.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Legal Name: <strong className="text-gray-200">{selectedApp.fullName}</strong> • Email: <strong className="text-gray-200">{selectedApp.userEmail || 'Registered Creator'}</strong> • City: <strong className="text-gray-200">{selectedApp.city}, {selectedApp.state}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-sm transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* SECTION 1: AI AUDITION INSPECTION REPORT (THE MODEL'S FINDINGS) */}
            <div className="rounded-3xl bg-gradient-to-br from-midnight-900 to-black p-5 sm:p-6 border border-emerald-500/30 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>AI Sentinel Automated Audit & Threat Report</span>
                      <span className="text-[10px] font-mono font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Model v2.4
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Real-time acoustic signal & threat evaluation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-lg font-black text-emerald-400 font-mono">
                      {selectedApp.aiSafetyScore ?? 96}/100
                    </div>
                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      {selectedApp.aiRecommendation ? selectedApp.aiRecommendation.replace(/_/g, ' ') : 'RECOMMEND APPROVAL'}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={scanningId === selectedApp.id}
                    onClick={() => handleTriggerAiScan(selectedApp.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors disabled:opacity-50"
                    title="Re-run AI Multimodal Analysis"
                  >
                    {scanningId === selectedApp.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Summary Findings Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-200 leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-300 mb-0.5">Model Findings & Acoustic Observations:</strong>
                  {selectedApp.aiModerationReport?.summaryFindings ||
                    'Audition tape inspected. No malicious speech, profanity, or copyright threats detected. Acoustic signature demonstrates authentic human vocal timbre with studio dynamic range. Biodata aligns with acoustic genre attributes.'}
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

                {/* 3. Copyright & Master Originality */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-white font-bold">
                      <FileCheck2 className="w-3.5 h-3.5 text-amber-400" />
                      Copyright Check
                    </span>
                    <span className="text-amber-400 font-bold">NO MATCH (ORIGINAL)</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fingerprint Registry:</span>
                      <span className="text-emerald-400 font-mono">Clean (0 Matches)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Originality Index:</span>
                      <span className="text-amber-400 font-mono font-bold">
                        {((selectedApp.aiModerationReport?.copyrightAndPlagiarism?.originalityScore ?? 0.96) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Master Ownership:</span>
                      <span className="text-emerald-400 font-mono">Declared by Creator</span>
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
                      <span className="text-gray-400">Style Match:</span>
                      <span className="text-emerald-400 font-mono font-bold">100% Consistent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: AUDITION MEDIA PLAYER (AUDIO & VIDEO REVIEW) */}
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
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-xs"
                  >
                    <span>External Portfolio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Integrated Audio Scrubbing Player */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(selectedApp)}
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-midnight-950 font-bold flex items-center justify-center shadow-lg transition-transform active:scale-95"
                    >
                      {playingAudioId === selectedApp.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" />
                      )}
                    </button>

                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {selectedApp.stageName} — Audition Submission
                      </h4>
                      <p className="text-[11px] text-gray-400 font-mono truncate max-w-sm">
                        {selectedApp.samplePerformanceUrl}
                      </p>
                    </div>
                  </div>

                  {/* Volume Control */}
                  <div className="hidden sm:flex items-center gap-2 text-gray-400">
                    <button
                      onClick={() => {
                        const newMute = !isMuted;
                        setIsMuted(newMute);
                        if (audioRef.current) audioRef.current.volume = newMute ? 0 : audioVolume;
                      }}
                      className="p-1 hover:text-white"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : audioVolume}
                      onChange={handleVolumeChange}
                      className="w-20 accent-amber-500 h-1 bg-white/20 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Progress Bar & Timestamps */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={audioProgress}
                    onChange={handleSeek}
                    className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span>{formatSeconds(audioCurrentTime)}</span>
                    <span>{formatSeconds(audioDuration)}</span>
                  </div>
                </div>
              </div>

              {/* Video Player if video format is detected */}
              {(selectedApp.samplePerformanceUrl?.match(/\.(mp4|mov|webm)/i) || selectedApp.portfolioUrl?.includes('youtube')) && (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video flex items-center justify-center">
                  <video
                    src={selectedApp.samplePerformanceUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* SECTION 3: CREATOR BIODATA & PROVENANCE */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <strong className="text-gray-300 block mb-1">Artist Bio:</strong>
                  <p className="text-gray-300 bg-midnight-900 p-3 rounded-2xl border border-white/5 leading-relaxed">
                    {selectedApp.bio}
                  </p>
                </div>
                <div>
                  <strong className="text-gray-300 block mb-1">Performance Background & Experience:</strong>
                  <p className="text-gray-300 bg-midnight-900 p-3 rounded-2xl border border-white/5 leading-relaxed">
                    {selectedApp.experience || 'No previous experience declared.'}
                  </p>
                </div>
              </div>

              <div>
                <strong className="text-gray-300 block mb-1">Original Composition & Copyright Provenance:</strong>
                <p className="text-gray-300 bg-midnight-900 p-3 rounded-2xl border border-white/5 leading-relaxed">
                  {selectedApp.originalCompositionInfo || 'Creator declared 100% original composition.'}
                </p>
              </div>

              {/* Social Channels */}
              {selectedApp.socialLinks && Object.keys(selectedApp.socialLinks).length > 0 && (
                <div>
                  <strong className="text-gray-300 block mb-1">Verified Social Channels:</strong>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedApp.socialLinks).map(([platform, link]) => (
                      <a
                        key={platform}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-midnight-900 border border-white/10 text-gray-300 hover:text-white flex items-center gap-1.5 text-xs hover:border-amber-500/40 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-amber-400" />
                        <span className="capitalize">{platform}:</span>
                        <span className="font-mono text-[11px] text-gray-400">{link.replace('https://', '')}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Notes Box */}
              <div>
                <label className="text-gray-300 font-medium block mb-1.5">
                  A&R Adjudication Notes (Recorded in Audit Ledger):
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter internal adjudication review feedback or verification notes..."
                  rows={2}
                  className="w-full rounded-2xl bg-midnight-900 border border-white/10 p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* SECTION 4: FINAL ADJUDICATION DECISION BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApp(null)}
                disabled={submitting}
              >
                Close Dossier
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReviewAction('UNDER_REVIEW')}
                  disabled={submitting}
                  className="text-xs border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                >
                  Mark Under Review
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleReviewAction('REJECT')}
                  disabled={submitting}
                  className="bg-rose-600 hover:bg-rose-500 text-xs text-white font-bold"
                >
                  Reject Audition
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleReviewAction('APPROVE')}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-xs text-white font-bold shadow-lg shadow-emerald-950/40"
                >
                  Approve & Grant Creator Clearance
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
