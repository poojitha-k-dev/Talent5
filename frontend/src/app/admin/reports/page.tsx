'use client';

import React, { useState, useEffect } from 'react';
import {
  Flag,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ReportItem {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporterEmail: string;
  reporterName: string;
  resolverEmail: string | null;
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targetFilter, setTargetFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (targetFilter) params.append('targetType', targetFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/v1/admin/reports?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.data.reports);
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [token]);

  const handleResolve = async (id: string, status: string, action: 'NONE' | 'TAKEDOWN_SONG' | 'SUSPEND_USER' = 'NONE') => {
    try {
      const res = await fetch(`/api/v1/admin/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReports();
      }
    } catch (err) {
      console.error('Failed to resolve report', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-midnight-900/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Flag className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Community Reports, Takedowns & DMCA Queue
            </h1>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Investigate flagged content, copyright disputes, inappropriate creator conduct, and enforce platform takedowns.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5">
            <span className="text-[11px] font-mono text-gray-400 uppercase">Total Reports</span>
            <div className="text-xl font-bold font-display text-white">{stats.total}</div>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5">
            <span className="text-[11px] font-mono text-amber-400 uppercase">Pending Review</span>
            <div className="text-xl font-bold font-display text-amber-300">{stats.pending}</div>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5">
            <span className="text-[11px] font-mono text-emerald-400 uppercase">Resolved</span>
            <div className="text-xl font-bold font-display text-emerald-300">{stats.resolved}</div>
          </div>
          <div className="p-4 rounded-xl bg-midnight-900/50 border border-white/5">
            <span className="text-[11px] font-mono text-gray-500 uppercase">Dismissed</span>
            <div className="text-xl font-bold font-display text-gray-400">{stats.dismissed}</div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-3 bg-midnight-900/40 rounded-xl border border-white/5 flex items-center gap-3">
        <select
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
          className="bg-midnight-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none"
        >
          <option value="">All Targets</option>
          <option value="SONG">Songs / Masters</option>
          <option value="VIDEO">Videos / Desi Content</option>
          <option value="CREATOR">Creator Profiles</option>
          <option value="COMMENT">Comments</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-midnight-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>

        <button
          onClick={fetchReports}
          className="px-4 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold"
        >
          Apply Filter
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-midnight-900/40 rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-400 text-xs font-mono">
            Loading community reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-xs font-mono">
            No incident reports matching current query.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {reports.map((report) => (
              <div key={report.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.01]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {report.target_type}
                    </span>
                    <span className="font-semibold text-white text-xs">{report.reason}</span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      • {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {report.details || 'No additional details provided by reporter.'}
                  </p>

                  <div className="text-[11px] text-gray-400 font-mono">
                    Reported by: <span className="text-gray-300">{report.reporterEmail}</span> ({report.reporterName}) • Target ID: <span className="text-gray-300">{report.target_id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {report.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleResolve(report.id, 'RESOLVED', report.target_type === 'SONG' ? 'TAKEDOWN_SONG' : 'NONE')}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition-all"
                        title="Resolve & Take Down Content"
                      >
                        Takedown Content
                      </button>
                      <button
                        onClick={() => handleResolve(report.id, 'RESOLVED', 'NONE')}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleResolve(report.id, 'DISMISSED', 'NONE')}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 rounded-xl text-xs font-semibold transition-all"
                      >
                        Dismiss
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1 rounded-xl text-[11px] font-mono uppercase bg-white/5 text-gray-400 border border-white/10">
                      {report.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
