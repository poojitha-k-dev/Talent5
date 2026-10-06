'use client';

import React, { useEffect, useState } from 'react';
import {
  FileMusic,
  Play,
  Pause,
  Video,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ShieldCheck,
  Music,
  User,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ContentItem {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  category: string;
  languageId: number;
  genreId: number;
  audioUrl?: string;
  videoUrl?: string;
  coverUrl?: string;
  composer?: string;
  lyricist?: string;
  producer?: string;
  featuredArtists: string[];
  ownershipDeclaration: boolean;
  durationSeconds?: number;
  mood?: string;
  lyricsText?: string;
  lyricsTimedData?: any;
  rightsDeclaration?: any;
  status: string;
  reviewNotes?: string;
  createdAt: string;
  creatorStageName: string;
  creatorCity: string;
  languageName: string;
  genreName: string;
}

export default function AdminContentReviewPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('talent5_token') || localStorage.getItem('token')) : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/v1/admin/content-review', window.location.origin);
      if (statusFilter !== 'ALL') url.searchParams.set('status', statusFilter);
      if (search.trim()) url.searchParams.set('search', search.trim());

      const res = await fetch(url.toString(), { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      }
    } catch (err) {
      console.error('Error fetching content submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [statusFilter, search]);

  const handleToggleAudio = (item: ContentItem) => {
    if (!item.audioUrl) return;

    if (playingAudioId === item.id) {
      audioEl?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (audioEl) audioEl.pause();
    const newAudio = new Audio(item.audioUrl);
    newAudio.play();
    newAudio.onended = () => setPlayingAudioId(null);
    setAudioEl(newAudio);
    setPlayingAudioId(item.id);
  };

  const handleModerateAction = async (action: 'APPROVE' | 'REJECT' | 'TAKEDOWN') => {
    if (!selectedItem) return;
    setSubmitting(true);
    setToast(null);

    try {
      const res = await fetch(`/api/v1/admin/content-review/${selectedItem.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, notes: reviewNotes }),
      });
      const json = await res.json();

      if (json.success) {
        setToast({ type: 'success', text: `Content submission ${action.toLowerCase()} successfully!` });
        setSelectedItem(null);
        setReviewNotes('');
        fetchContent();
      } else {
        setToast({ type: 'error', text: json.error?.message || 'Failed to update submission' });
      }
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono uppercase tracking-wider mb-1">
            <FileMusic className="w-4 h-4" />
            Catalog Moderation Cockpit
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Submitted Media & Original Music Review
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Review original master audio, video performances, copyright declarations, and publish to the live Desi catalog.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <span>Submissions: <strong className="text-white">{items.length}</strong></span>
        </div>
      </div>

      {toast && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{toast.text}</span>
          <button onClick={() => setToast(null)} className="text-xs underline hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-midnight-900/60 border border-white/5">
        <div className="flex items-center gap-1 bg-midnight-950 p-1 rounded-lg border border-white/5 text-xs">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'TAKEDOWN'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                statusFilter === st
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {st === 'ALL' ? 'All Submissions' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or artist..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500">Loading catalog submissions...</div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-midnight-900/40 border border-white/5 text-gray-400 text-xs">
          No content submissions found in queue.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-midnight-900/70 border border-white/5 hover:border-white/15 transition-all space-y-4"
            >
              <div className="flex gap-4">
                {/* Artwork / Preview */}
                <div className="w-20 h-20 rounded-xl bg-midnight-950 border border-white/10 overflow-hidden flex-shrink-0 relative">
                  <img
                    src={item.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.videoUrl && (
                    <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[9px] text-teal-400 flex items-center gap-0.5">
                      <Video className="w-2.5 h-2.5" />
                      Video
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white truncate">{item.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex-shrink-0 ${
                        item.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : item.status === 'TAKEDOWN' || item.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-xs text-amber-400 font-medium mt-0.5">
                    {item.creatorStageName} <span className="text-gray-500">({item.creatorCity})</span>
                  </p>

                  <div className="flex items-center flex-wrap gap-2 text-[11px] text-gray-400 mt-2">
                    <span className="px-2 py-0.5 rounded bg-white/5">{item.languageName}</span>
                    <span className="px-2 py-0.5 rounded bg-white/5">{item.genreName}</span>
                    <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300">{item.category}</span>
                    {item.durationSeconds ? (
                      <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-gray-300">
                        {Math.floor(item.durationSeconds / 60)}:{(item.durationSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    ) : null}
                    {item.mood && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">{item.mood}</span>
                    )}
                    {(item.lyricsTimedData || item.lyricsText) && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px]">
                        {item.lyricsTimedData ? 'Synced Lyrics' : 'Plain Lyrics'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Credits Box */}
              <div className="p-3 rounded-xl bg-midnight-950/80 border border-white/5 text-[11px] space-y-1">
                <div className="grid grid-cols-2 gap-2 text-gray-400">
                  <div>
                    <span className="text-gray-500">Composer: </span>
                    <span className="text-gray-300">{item.composer || item.creatorStageName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Lyricist: </span>
                    <span className="text-gray-300">{item.lyricist || 'Original'}</span>
                  </div>
                </div>
                {item.producer && (
                  <div className="text-gray-400">
                    <span className="text-gray-500">Producer: </span>
                    <span className="text-gray-300">{item.producer}</span>
                  </div>
                )}
              </div>

              {/* Player & Action Bar */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {item.audioUrl && (
                    <button
                      onClick={() => handleToggleAudio(item)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        playingAudioId === item.id
                          ? 'bg-amber-500 text-midnight-950 scale-105'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {playingAudioId === item.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  )}
                  {item.videoUrl && (
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 text-xs flex items-center gap-1.5"
                    >
                      <Video className="w-3 h-3" />
                      Preview Video
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item);
                      setReviewNotes(item.reviewNotes || '');
                    }}
                    className="text-xs"
                  >
                    Moderate
                  </Button>
                  {item.status === 'SUBMITTED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-xs"
                      onClick={() => {
                        setSelectedItem(item);
                        setReviewNotes('Approved & published to Desi Originals Hub.');
                      }}
                    >
                      Quick Publish
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Moderation Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedItem.coverUrl || '/media/placeholder-cover.jpg'}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-white/10"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">Moderate: {selectedItem.title}</h3>
                  <p className="text-xs text-gray-400">By {selectedItem.creatorStageName} • {selectedItem.creatorCity}</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            {/* Audio Preview */}
            <div className="p-4 rounded-xl bg-midnight-950 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">Master Audio Track</span>
                {selectedItem.durationSeconds ? (
                  <span className="text-xs text-amber-400 font-mono">
                    {Math.floor(selectedItem.durationSeconds / 60)}:{(selectedItem.durationSeconds % 60).toString().padStart(2, '0')}
                  </span>
                ) : null}
              </div>
              {selectedItem.audioUrl ? (
                <audio controls src={selectedItem.audioUrl} className="w-full h-10 accent-rose-500 rounded" />
              ) : (
                <p className="text-xs text-rose-400">No master audio file attached.</p>
              )}
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-gray-400">Language</div>
                <div className="font-semibold text-white mt-0.5">{selectedItem.languageName}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-gray-400">Genre</div>
                <div className="font-semibold text-white mt-0.5">{selectedItem.genreName}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-gray-400">Mood</div>
                <div className="font-semibold text-amber-400 mt-0.5">{selectedItem.mood || 'Not specified'}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <div className="text-[10px] text-gray-400">Category</div>
                <div className="font-semibold text-teal-400 mt-0.5">{selectedItem.category}</div>
              </div>
            </div>

            {/* Story / Description */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400">Creator's Story</span>
              <p className="text-gray-300 text-xs leading-relaxed bg-midnight-950 p-3 rounded-xl border border-white/5">
                {selectedItem.description || 'No description provided by creator.'}
              </p>
            </div>

            {/* Lyrics Preview */}
            {(selectedItem.lyricsText || selectedItem.lyricsTimedData) && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Lyrics / Timed Data</span>
                  {selectedItem.lyricsTimedData && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Synchronized Line Timings Included
                    </span>
                  )}
                </div>
                <div className="max-h-36 overflow-y-auto p-3 rounded-xl bg-midnight-950 border border-white/5 font-mono text-[11px] text-gray-300 whitespace-pre-wrap">
                  {selectedItem.lyricsText || (Array.isArray(selectedItem.lyricsTimedData) ? selectedItem.lyricsTimedData.map((l: any) => `[${l.startTimeMs || l.timeMs}ms] ${l.text}`).join('\n') : JSON.stringify(selectedItem.lyricsTimedData, null, 2))}
                </div>
              </div>
            )}

            {/* Rights Declaration */}
            <div className="p-3 rounded-xl bg-midnight-950 border border-white/5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                Copyright & Rights Declaration
              </div>
              <div className="text-[11px] text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Creator certified 100% original master ownership and composition rights.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Certified NO unauthorized copyrighted samples or synthetic AI voice clones without license.</span>
                </div>
              </div>
            </div>

            {/* Moderator Notes */}
            <div>
              <label className="text-gray-300 text-xs font-medium block mb-1.5">
                Moderator Notes:
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter moderation decision notes..."
                rows={2}
                className="w-full rounded-xl bg-midnight-950 border border-white/10 p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleModerateAction('TAKEDOWN')}
                disabled={submitting}
                className="bg-rose-700 hover:bg-rose-600 text-xs"
              >
                Takedown
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleModerateAction('APPROVE')}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-xs"
              >
                Approve & Publish Live
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
