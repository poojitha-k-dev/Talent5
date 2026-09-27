'use client';

import React, { useEffect, useState } from 'react';
import {
  Scale,
  Search,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Ban,
  CheckCircle,
  ExternalLink,
  Calendar,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RightsItem {
  id: string;
  songId?: string;
  rightsHolder: string;
  ownershipType: string;
  licenseType: string;
  licenseProvider?: string;
  territory: string;
  startDate: string;
  endDate?: string;
  streamingAllowed: boolean;
  downloadAllowed: boolean;
  monetizationAllowed: boolean;
  karaokeAllowed: boolean;
  ugcAllowed: boolean;
  status: string;
  notes?: string;
  songTitle?: string;
  artistName?: string;
  songStatus?: string;
}

export default function AdminRightsPage() {
  const [records, setRecords] = useState<RightsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ownershipFilter, setOwnershipFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<RightsItem | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRights = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/v1/admin/rights', window.location.origin);
      if (statusFilter !== 'ALL') url.searchParams.set('status', statusFilter);
      if (ownershipFilter !== 'ALL') url.searchParams.set('ownershipType', ownershipFilter);
      if (search.trim()) url.searchParams.set('search', search.trim());

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setRecords(json.data);
      }
    } catch (err) {
      console.error('Error fetching rights records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRights();
  }, [statusFilter, ownershipFilter, search]);

  const handleAction = async (action: 'VERIFY' | 'RESTRICT' | 'TAKEDOWN' | 'RENEW') => {
    if (!selectedRecord) return;
    setSubmitting(true);
    setToast(null);

    try {
      const res = await fetch(`/api/v1/admin/rights/${selectedRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: actionNotes, newEndDate: newEndDate || undefined }),
      });
      const json = await res.json();

      if (json.success) {
        setToast({ type: 'success', text: `Rights record status updated to ${json.data.status}!` });
        setSelectedRecord(null);
        setActionNotes('');
        setNewEndDate('');
        fetchRights();
      } else {
        setToast({ type: 'error', text: json.error?.message || 'Failed to update rights record' });
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
          <div className="flex items-center gap-2 text-xs text-teal-400 font-mono uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            Legal & Licensing Compliance Engine
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Rights, Provenance & Copyright Control Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track statutory licenses, enforce territory restrictions, and administer DMCA/copyright takedown protocols.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <span>Catalog Records: <strong className="text-white">{records.length}</strong></span>
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

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-midnight-900/60 border border-white/5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-midnight-950 p-1 rounded-lg border border-white/5 text-xs">
            {['ALL', 'VERIFIED', 'PENDING', 'EXPIRED', 'RESTRICTED', 'TAKEDOWN'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={ownershipFilter}
            onChange={(e) => setOwnershipFilter(e.target.value)}
            className="bg-midnight-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Ownership Types</option>
            <option value="TALENT5_OWNED">Talent5 Owned</option>
            <option value="CREATOR_OWNED">Creator Owned</option>
            <option value="DIRECT_LICENSED">Direct Licensed</option>
            <option value="OPEN_LICENSE">Open License (CC)</option>
            <option value="PUBLIC_DOMAIN">Public Domain</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rights holder, song..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-midnight-950 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Rights Table */}
      <div className="rounded-2xl bg-midnight-900/60 border border-white/5 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-midnight-950/80 border-b border-white/5 text-[11px] uppercase tracking-wider text-gray-400 font-medium">
              <tr>
                <th className="py-3 px-4">Track & Rights Holder</th>
                <th className="py-3 px-4">Ownership & License</th>
                <th className="py-3 px-4">Territory</th>
                <th className="py-3 px-4">Term Validity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading rights records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No rights records found.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{rec.songTitle || 'Catalog Asset'}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Holder: <strong className="text-gray-300">{rec.rightsHolder}</strong>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-gray-300 font-mono">
                        {rec.ownershipType.replace('_', ' ')}
                      </span>
                      <div className="text-[11px] text-gray-400 mt-1 truncate max-w-xs">
                        {rec.licenseType}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-gray-300">
                        <Globe className="w-3 h-3 text-teal-400" />
                        <span>{rec.territory}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-gray-400">
                      <div>From: {rec.startDate}</div>
                      <div className={rec.endDate && new Date(rec.endDate) < new Date() ? 'text-rose-400 font-bold' : ''}>
                        To: {rec.endDate || 'Perpetual'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          rec.status === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : rec.status === 'EXPIRED'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : rec.status === 'RESTRICTED'
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(rec);
                          setActionNotes(rec.notes || '');
                          setNewEndDate(rec.endDate || '');
                        }}
                        className="text-xs text-teal-400 hover:text-teal-300"
                      >
                        Enforce
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enforcement Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Rights Enforcement: {selectedRecord.songTitle || selectedRecord.rightsHolder}
                </h3>
                <p className="text-xs text-gray-400">
                  Current Status: <strong className="text-white">{selectedRecord.status}</strong>
                </p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-midnight-950 border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rights Holder:</span>
                  <span className="text-white font-medium">{selectedRecord.rightsHolder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">License Provider:</span>
                  <span className="text-white">{selectedRecord.licenseProvider || 'Talent5 Internal Registry'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Territory Coverage:</span>
                  <span className="text-white">{selectedRecord.territory}</span>
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">
                  License Expiration Date (for Renewals):
                </label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full rounded-xl bg-midnight-950 border border-white/10 p-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">
                  Compliance Action Notes:
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Reason for restriction, takedown, or renewal..."
                  rows={3}
                  className="w-full rounded-xl bg-midnight-950 border border-white/10 p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleAction('TAKEDOWN')}
                disabled={submitting}
                className="bg-rose-700 hover:bg-rose-600 text-xs"
              >
                DMCA / Copyright Takedown
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('RESTRICT')}
                disabled={submitting}
                className="text-purple-400 hover:text-purple-300 text-xs"
              >
                Restrict Playback
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAction('RENEW')}
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-500 border-teal-500 text-xs"
              >
                Verify & Renew Term
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
