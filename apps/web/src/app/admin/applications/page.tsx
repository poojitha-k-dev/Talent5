'use client';

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Audio player state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/v1/admin/applications', window.location.origin);
      if (statusFilter !== 'ALL') url.searchParams.set('status', statusFilter);
      if (categoryFilter !== 'ALL') url.searchParams.set('category', categoryFilter);
      if (search.trim()) url.searchParams.set('search', search.trim());

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setApplications(json.data);
      }
    } catch (err) {
      console.error('Error fetching creator applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, categoryFilter, search]);

  const handlePlayAudio = (app: CreatorApp) => {
    if (playingAudioId === app.id) {
      audioEl?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (audioEl) {
      audioEl.pause();
    }

    const newAudio = new Audio(app.samplePerformanceUrl);
    newAudio.play();
    newAudio.onended = () => setPlayingAudioId(null);
    setAudioEl(newAudio);
    setPlayingAudioId(app.id);
  };

  const handleReviewAction = async (action: 'APPROVE' | 'REJECT' | 'UNDER_REVIEW' | 'SUSPEND') => {
    if (!selectedApp) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/v1/admin/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: reviewNotes }),
      });
      const json = await res.json();

      if (json.success) {
        setMessage({ type: 'success', text: `Application ${action.toLowerCase()} successfully!` });
        setSelectedApp(null);
        setReviewNotes('');
        fetchApplications();
      } else {
        setMessage({ type: 'error', text: json.error?.message || 'Failed to update application' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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
            Audit sample audition tapes, enforce original master declarations, and provision verified creator profiles.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <span>Total In View: <strong className="text-white">{applications.length}</strong></span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-midnight-900/60 border border-white/5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-midnight-950 p-1 rounded-lg border border-white/5 text-xs">
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-rose-600 text-white shadow-sm'
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
            className="bg-midnight-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-rose-500"
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
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500">Loading creator auditions...</div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-midnight-900/40 border border-white/5 text-gray-400 text-xs">
          No creator applications found matching selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-midnight-900/70 border border-white/5 hover:border-white/15 transition-all space-y-4 relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{app.stageName}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/20">
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
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
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

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {app.languages?.map((lang) => (
                  <span key={lang} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300">
                    {lang}
                  </span>
                ))}
                {app.genres?.map((genre) => (
                  <span key={genre} className="px-2 py-0.5 rounded bg-amber-500/10 text-[10px] text-amber-300/80">
                    {genre}
                  </span>
                ))}
              </div>

              {/* Declarations & Audio Preview */}
              <div className="p-3 rounded-xl bg-midnight-950/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Original Composition & Copyright Declared</span>
                  </div>
                  {app.portfolioUrl && (
                    <a
                      href={app.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
                    >
                      Portfolio
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Audition Player */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePlayAudio(app)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        playingAudioId === app.id
                          ? 'bg-amber-500 text-midnight-950 scale-105'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {playingAudioId === app.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                    <span className="text-[11px] text-gray-300 font-medium">
                      {playingAudioId === app.id ? 'Playing Audition Clip...' : 'Audition Demo Audio'}
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(app.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedApp(app);
                    setReviewNotes(app.reviewNotes || '');
                  }}
                  className="text-xs"
                >
                  Review Details
                </Button>
                {app.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-xs"
                    onClick={() => {
                      setSelectedApp(app);
                      setReviewNotes('Approved after listening to audition tape.');
                    }}
                  >
                    Quick Approve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedApp.stageName}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedApp.fullName} • {selectedApp.userEmail}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <strong className="text-gray-300 block mb-1">Artist Bio:</strong>
                <p className="text-gray-400 bg-midnight-950 p-3 rounded-xl border border-white/5">
                  {selectedApp.bio}
                </p>
              </div>

              <div>
                <strong className="text-gray-300 block mb-1">Original Composition & Provenance:</strong>
                <p className="text-gray-400 bg-midnight-950 p-3 rounded-xl border border-white/5">
                  {selectedApp.originalCompositionInfo || 'No composition details provided.'}
                </p>
              </div>

              <div>
                <strong className="text-gray-300 block mb-1">Performance Experience:</strong>
                <p className="text-gray-400 bg-midnight-950 p-3 rounded-xl border border-white/5">
                  {selectedApp.experience}
                </p>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1.5">
                  A&R Adjudication Notes:
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter internal adjudication notes or feedback to the applicant..."
                  rows={3}
                  className="w-full rounded-xl bg-midnight-950 border border-white/10 p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApp(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReviewAction('REJECT')}
                disabled={submitting}
                className="bg-rose-600 hover:bg-rose-500 text-xs"
              >
                Reject Application
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleReviewAction('APPROVE')}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-xs"
              >
                Approve & Grant Creator Badge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
