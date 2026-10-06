'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Send,
  Bell,
  Users,
  AlertCircle,
  ExternalLink,
  History,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface BroadcastRecord {
  type: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
  recipientsCount: string | number;
}

export default function AdminBroadcastsPage() {
  const { user, token: authToken, isLoading: authLoading } = useAuth();
  const token = authToken || (typeof window !== 'undefined' ? (localStorage.getItem('talent5_token') || localStorage.getItem('token')) : null);

  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [form, setForm] = useState({
    audience: 'ALL_USERS',
    targetUserId: '',
    type: 'SYSTEM_ANNOUNCEMENT',
    title: '',
    message: '',
    link: '',
  });

  const fetchBroadcasts = async () => {
    const t = token;
    if (!t) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/broadcasts', {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (data.success) {
        setBroadcasts(data.data);
      }
    } catch (err) {
      console.error('Failed to load broadcasts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBroadcasts();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [token, authLoading]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) return;
    if (!window.confirm(`Dispatch broadcast announcement to "${form.audience}"?`)) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/v1/admin/broadcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Broadcast dispatched successfully!');
        setForm({
          audience: 'ALL_USERS',
          targetUserId: '',
          type: 'SYSTEM_ANNOUNCEMENT',
          title: '',
          message: '',
          link: '',
        });
        fetchBroadcasts();
      } else {
        alert(data.message || 'Failed to dispatch broadcast');
      }
    } catch (err: any) {
      alert(err.message || 'Error sending broadcast');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-midnight-900/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Radio className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Broadcast & Platform Notifications Center
            </h1>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Dispatch high-priority inbox notifications, competition alerts, and policy changes directly to all users or specific creators.
          </p>
        </div>

        <button
          onClick={fetchBroadcasts}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Log</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Compose Broadcast */}
        <div className="lg:col-span-5 bg-midnight-900/50 rounded-2xl border border-white/5 p-6 space-y-4">
          <h2 className="text-sm font-bold font-display text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-400" />
            <span>Compose Global Broadcast</span>
          </h2>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-mono">Target Audience</label>
              <select
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="ALL_USERS">All Platform Users (Broadcast)</option>
                <option value="ALL_CREATORS">Approved Creators Only</option>
                <option value="SPECIFIC_USER">Specific User ID</option>
              </select>
            </div>

            {form.audience === 'SPECIFIC_USER' && (
              <div>
                <label className="text-xs text-gray-400 font-mono">User UUID *</label>
                <input
                  type="text"
                  required
                  placeholder="Paste User ID..."
                  value={form.targetUserId}
                  onChange={(e) => setForm({ ...form, targetUserId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 font-mono">Notification Category</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="SYSTEM_ANNOUNCEMENT">System Announcement</option>
                <option value="COMPETITION_ALERT">Competition Alert</option>
                <option value="SECURITY_NOTICE">Security & Verification</option>
                <option value="PAYOUT_UPDATE">Finance & Payout Alert</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-mono">Headline Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Desi Classical Season 2 is Live!"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-mono">Notification Body *</label>
              <textarea
                rows={4}
                required
                placeholder="Message displayed in user notification tray..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-mono">Call-To-Action Link (Optional)</label>
              <input
                type="text"
                placeholder="e.g. /competitions or /karaoke"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-midnight-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition-all"
            >
              {isSending ? 'Dispatching Broadcast...' : 'Dispatch Broadcast Now'}
            </button>
          </form>
        </div>

        {/* Right Column: Broadcast History */}
        <div className="lg:col-span-7 bg-midnight-900/40 rounded-2xl border border-white/5 p-6 space-y-4">
          <h2 className="text-sm font-bold font-display text-white flex items-center gap-2">
            <History className="w-4 h-4 text-gray-400" />
            <span>Recent Broadcast Dispatches ({broadcasts.length})</span>
          </h2>

          {loading ? (
            <div className="p-16 text-center text-gray-400 text-xs font-mono">
              Loading broadcast history...
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="p-16 text-center text-gray-500 text-xs font-mono">
              No previous broadcasts dispatched.
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto">
              {broadcasts.map((b, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-midnight-950/70 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {b.type}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(b.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white text-xs">{b.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{b.message}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 pt-2 border-t border-white/5">
                    <span>Recipients: <span className="text-teal-400 font-bold">{b.recipientsCount}</span></span>
                    {b.link && <span className="text-gray-400">{b.link}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
