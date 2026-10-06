'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  Activity,
  Bot,
  Ban,
  CheckCircle,
  RefreshCw,
  Search,
  MinusCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FraudEvent {
  id: string;
  userId?: string;
  eventType: string;
  riskScore: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: any;
  actionTaken: string;
  createdAt: string;
  userEmail?: string;
  userName?: string;
}

interface SuspiciousLike {
  id: string;
  userId: string;
  targetType: string;
  targetId: string;
  status: string;
  riskScore: string;
  ipHash?: string;
  deviceFingerprint?: string;
  userAgent?: string;
  createdAt: string;
  userEmail: string;
  username: string;
}

export default function AdminFraudPage() {
  const [events, setEvents] = useState<FraudEvent[]>([]);
  const [suspiciousLikes, setSuspiciousLikes] = useState<SuspiciousLike[]>([]);
  const [riskDistribution, setRiskDistribution] = useState({ HIGH: 0, MEDIUM: 0, LOW: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'EVENTS' | 'LIKES'>('EVENTS');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [voiding, setVoiding] = useState(false);

  const PAGE_SIZE = 15;
  const [eventPage, setEventPage] = useState(1);
  const [likePage, setLikePage] = useState(1);
  const totalEventPages = Math.max(1, Math.ceil(events.length / PAGE_SIZE));
  const totalLikePages = Math.max(1, Math.ceil(suspiciousLikes.length / PAGE_SIZE));
  const paginatedEvents = events.slice((eventPage - 1) * PAGE_SIZE, eventPage * PAGE_SIZE);
  const paginatedLikes = suspiciousLikes.slice((likePage - 1) * PAGE_SIZE, likePage * PAGE_SIZE);

  // Fraud deduction modal state
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [deductCreatorId, setDeductCreatorId] = useState('');
  const [deductAmount, setDeductAmount] = useState('100');
  const [deductNotes, setDeductNotes] = useState('');
  const [deducting, setDeducting] = useState(false);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('talent5_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchFraudData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/fraud', { headers: getAuthHeaders() });
      const json = await res.json();
      if (json.success && json.data) {
        if (Array.isArray(json.data)) {
          setEvents(json.data);
          const high = json.data.filter((e: any) => e.riskScore === 'HIGH' || e.risk_score === 'HIGH').length;
          const medium = json.data.filter((e: any) => e.riskScore === 'MEDIUM' || e.risk_score === 'MEDIUM').length;
          const low = json.data.filter((e: any) => e.riskScore === 'LOW' || e.risk_score === 'LOW').length;
          setRiskDistribution({ HIGH: high, MEDIUM: medium, LOW: low });
          setSuspiciousLikes([]);
        } else {
          setEvents(Array.isArray(json.data.events) ? json.data.events : []);
          setSuspiciousLikes(Array.isArray(json.data.suspiciousLikes) ? json.data.suspiciousLikes : []);
          setRiskDistribution(json.data.riskDistribution || { HIGH: 0, MEDIUM: 0, LOW: 0 });
        }
      } else {
        setEvents([]);
        setSuspiciousLikes([]);
        setRiskDistribution({ HIGH: 0, MEDIUM: 0, LOW: 0 });
      }
    } catch (err) {
      console.error('Error fetching fraud cockpit:', err);
      setRiskDistribution({ HIGH: 0, MEDIUM: 0, LOW: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudData();
  }, []);

  const handleVoidAllSuspicious = async () => {
    setVoiding(true);
    setToast(null);
    try {
      const res = await fetch('/api/v1/admin/fraud/action', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'VOID_SUSPICIOUS_LIKES' }),
      });
      const json = await res.json();

      if (json.success) {
        setToast({ type: 'success', text: json.message });
        fetchFraudData();
      } else {
        setToast({ type: 'error', text: json.error?.message || 'Action failed' });
      }
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setVoiding(false);
    }
  };

  const [resolvingAll, setResolvingAll] = useState(false);

  const handleResolveAllEvents = async () => {
    setResolvingAll(true);
    try {
      const res = await fetch('/api/v1/admin/fraud/action', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'RESOLVE_ALL_EVENTS' }),
      });
      const json = await res.json();

      if (json.success) {
        setToast({ type: 'success', text: json.message });
        fetchFraudData();
      } else {
        setToast({ type: 'error', text: json.error?.message || 'Action failed' });
      }
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setResolvingAll(false);
    }
  };

  const handleResolveEvent = async (eventId: string) => {
    try {
      const res = await fetch('/api/v1/admin/fraud/action', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'RESOLVE_EVENT', eventId }),
      });
      const json = await res.json();

      if (json.success) {
        setToast({ type: 'success', text: 'Fraud event resolved.' });
        fetchFraudData();
      }
    } catch (err: any) {
      setToast({ type: 'error', text: err.message });
    }
  };

  const handleDeductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeducting(true);
    try {
      const res = await fetch('/api/v1/admin/fraud/action', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'DEDUCT_WALLET',
          creatorId: deductCreatorId.trim(),
          deductionINR: parseFloat(deductAmount),
          notes: deductNotes || 'Engagement fraud deduction',
        }),
      });
      const json = await res.json();

      if (json.success) {
        setToast({ type: 'success', text: json.message });
        setShowDeductModal(false);
        setDeductCreatorId('');
        fetchFraudData();
      } else {
        setToast({ type: 'error', text: json.error?.message || 'Deduction failed' });
      }
    } catch (err: any) {
      setToast({ type: 'error', text: err.message });
    } finally {
      setDeducting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            Anti-Fraud Heuristic Cockpit
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Engagement Integrity & Bot Detection
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time heuristic evaluation: velocity bursts, device fingerprint collisions, bot farm signatures, and reward protection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchFraudData}
            disabled={loading}
            className="text-gray-300 hover:text-white text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Signals
          </Button>
          {events.some((ev) => ev.actionTaken !== 'RESOLVED') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResolveAllEvents}
              disabled={resolvingAll}
              className="text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs bg-emerald-500/5 hover:bg-emerald-500/10"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              {resolvingAll ? 'Resolving...' : 'Resolve All Active'}
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={handleVoidAllSuspicious}
            disabled={voiding}
            className="bg-rose-600 hover:bg-rose-500 border-rose-500 text-xs"
          >
            <Ban className="w-3.5 h-3.5 mr-1.5" />
            {voiding ? 'Voiding...' : 'Void All Suspicious Likes'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeductModal(true)}
            className="text-amber-400 hover:text-amber-300 border border-amber-500/30 text-xs"
          >
            <MinusCircle className="w-3.5 h-3.5 mr-1.5" />
            Wallet Penalty
          </Button>
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

      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-rose-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400">HIGH RISK ANOMALIES</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-display">
            {riskDistribution?.HIGH ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Bot farms, rapid burst velocity, device collisions</p>
        </div>

        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-amber-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">MEDIUM RISK EVENTS</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-display">
            {riskDistribution?.MEDIUM ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Creator self-likes, repeated browser fingerprint</p>
        </div>

        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-emerald-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">FLAGGED / SUSPICIOUS LIKES</span>
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2 font-display">
            {suspiciousLikes?.length ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Pending automatic or manual void action</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'EVENTS'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Heuristic Fraud Incidents ({events?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('LIKES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'LIKES'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Suspicious Likes Stream ({suspiciousLikes?.length ?? 0})
        </button>
      </div>

      {/* Events View */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-4">
          {(events || []).length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-midnight-900/40 border border-white/5 text-gray-400 text-xs">
              No fraud events detected on the platform. All listener engagement is healthy.
            </div>
          ) : (
            (paginatedEvents || []).map((ev) => (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-midnight-900/70 border border-white/5 hover:border-white/15 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ev.riskScore === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {ev.riskScore} RISK
                    </span>
                    <h3 className="text-sm font-mono font-bold text-white">{ev.eventType}</h3>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(ev.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-xs text-gray-300">
                    {ev.userEmail && (
                      <span>
                        Target Account: <strong className="text-amber-400">{ev.userEmail}</strong>
                      </span>
                    )}
                  </div>

                  {/* Evidence dump */}
                  <div className="p-2.5 rounded-lg bg-midnight-950 font-mono text-[11px] text-gray-400 border border-white/5 max-w-2xl overflow-x-auto">
                    Evidence: {JSON.stringify(ev.evidence)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      ev.actionTaken === 'RESOLVED'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {ev.actionTaken === 'RESOLVED' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>RESOLVED</span>
                      </>
                    ) : (
                      <span>{ev.actionTaken}</span>
                    )}
                  </span>
                  {ev.actionTaken !== 'RESOLVED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolveEvent(ev.id)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {/* 15 Rows Pagination for Events */}
          {(events || []).length > 0 && (
            <div className="p-4 rounded-2xl bg-midnight-950/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <span>
                  Showing <strong className="text-white">{(eventPage - 1) * PAGE_SIZE + 1}</strong> to{' '}
                  <strong className="text-white">{Math.min(eventPage * PAGE_SIZE, events.length)}</strong> of{' '}
                  <strong className="text-white">{events.length}</strong> events
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-rose-400 font-mono text-[11px] font-semibold">
                  15 rows per page
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEventPage(1)}
                  disabled={eventPage === 1}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEventPage((p) => Math.max(1, p - 1))}
                  disabled={eventPage === 1}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-mono text-gray-300">
                  {eventPage} / {totalEventPages}
                </span>
                <button
                  type="button"
                  onClick={() => setEventPage((p) => Math.min(totalEventPages, p + 1))}
                  disabled={eventPage === totalEventPages}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEventPage(totalEventPages)}
                  disabled={eventPage === totalEventPages}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suspicious Likes View */}
      {activeTab === 'LIKES' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-midnight-900/60 border border-white/5 overflow-hidden backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-midnight-950/80 border-b border-white/5 text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Target Type</th>
                    <th className="py-3 px-4">IP Hash & Fingerprint</th>
                    <th className="py-3 px-4">User Agent</th>
                    <th className="py-3 px-4">Risk</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(suspiciousLikes || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No suspicious likes currently queued.
                      </td>
                    </tr>
                  ) : (
                    (paginatedLikes || []).map((like) => (
                      <tr key={like.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4">
                          <div className="text-white font-medium">{like.userEmail}</div>
                          <div className="text-[10px] text-gray-400 font-mono">@{like.username}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-300">{like.targetType}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-gray-400">
                          <div>IP: {like.ipHash || 'N/A'}</div>
                          <div>FP: {like.deviceFingerprint || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-400 truncate max-w-xs text-[11px]">
                          {like.userAgent || 'Unknown'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300">
                            {like.riskScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-400">{like.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 15 Rows Pagination for Likes */}
          {(suspiciousLikes || []).length > 0 && (
            <div className="p-4 rounded-2xl bg-midnight-950/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <span>
                  Showing <strong className="text-white">{(likePage - 1) * PAGE_SIZE + 1}</strong> to{' '}
                  <strong className="text-white">{Math.min(likePage * PAGE_SIZE, suspiciousLikes.length)}</strong> of{' '}
                  <strong className="text-white">{suspiciousLikes.length}</strong> items
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-rose-400 font-mono text-[11px] font-semibold">
                  15 rows per page
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLikePage(1)}
                  disabled={likePage === 1}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLikePage((p) => Math.max(1, p - 1))}
                  disabled={likePage === 1}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-mono text-gray-300">
                  {likePage} / {totalLikePages}
                </span>
                <button
                  type="button"
                  onClick={() => setLikePage((p) => Math.min(totalLikePages, p + 1))}
                  disabled={likePage === totalLikePages}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLikePage(totalLikePages)}
                  disabled={likePage === totalLikePages}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wallet Deduction Modal */}
      {showDeductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleDeductSubmit}
            className="max-w-md w-full bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Issue Wallet Fraud Deduction</h3>
                <p className="text-xs text-gray-400">Deduct illegitimate engagement earnings from a creator wallet.</p>
              </div>
              <button type="button" onClick={() => setShowDeductModal(false)} className="text-gray-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 font-medium block mb-1">Creator Profile UUID:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10000000-0000-0000-0000-000000000001"
                  value={deductCreatorId}
                  onChange={(e) => setDeductCreatorId(e.target.value)}
                  className="w-full rounded-xl bg-midnight-950 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Deduction Amount (INR ₹):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={deductAmount}
                  onChange={(e) => setDeductAmount(e.target.value)}
                  className="w-full rounded-xl bg-midnight-950 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Reason / Adjudication Notes:</label>
                <textarea
                  rows={2}
                  value={deductNotes}
                  onChange={(e) => setDeductNotes(e.target.value)}
                  placeholder="e.g. 1,000 invalid bot likes generated on 2026-03-10"
                  className="w-full rounded-xl bg-midnight-950 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowDeductModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                disabled={deducting}
                className="bg-rose-600 hover:bg-rose-500 text-xs"
              >
                {deducting ? 'Applying...' : 'Apply Penalty Deduction'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
