'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Sparkles,
  Play,
  Heart,
  UserCheck,
  FileMusic,
  Coins,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminStats {
  totalUsers: number;
  totalCreators: number;
  pendingApplications: number;
  pendingSubmissions: number;
  rightsVerified: number;
  rightsExpired: number;
  pendingPayoutLiabilityINR: number;
  pendingPayoutRequestsCount: number;
  highRiskFraudEvents: number;
  totalPlays: number;
  totalValidLikes: number;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entityName: string;
    entityId: string;
    createdAt: string;
    actorEmail: string;
    actorName: string;
  }>;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/stats');
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      } else {
        setError(json.error?.message || 'Failed to fetch admin stats');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Executive Operations Dashboard
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Platform Command Center
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time telemetry, creator audition queues, rights enforcement, and financial settlements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
            className="text-gray-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
          <Link href="/admin/settings">
            <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-500 border-rose-500">
              Configure Parameters
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users & Creators */}
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-white/5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total Registered Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-white">
              {loading ? '...' : (stats?.totalUsers ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-teal-400 font-medium">
              ({stats?.totalCreators ?? 0} Approved Creators)
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Active Indian listeners & creators</p>
        </div>

        {/* Plays & Valid Likes */}
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-white/5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Platform Engagement</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Play className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-white">
              {loading ? '...' : (stats?.totalPlays ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-amber-400 font-medium">
              Plays • {stats?.totalValidLikes ?? 0} Likes
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Audited & verified listener interactions</p>
        </div>

        {/* Pending Auditions & Moderation */}
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-amber-500/20 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-300">Pending Auditions & Content</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-amber-400">
              {loading ? '...' : (stats?.pendingApplications ?? 0) + (stats?.pendingSubmissions ?? 0)}
            </span>
            <span className="text-xs text-gray-400">
              ({stats?.pendingApplications ?? 0} Auditions • {stats?.pendingSubmissions ?? 0} Tracks)
            </span>
          </div>
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 mt-2 transition-colors"
          >
            <span>Review Queue</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Payout Liabilities */}
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-emerald-500/20 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300">Outstanding Payout Liability</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-emerald-400">
              ₹{loading ? '...' : (stats?.pendingPayoutLiabilityINR ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-gray-400">
              ({stats?.pendingPayoutRequestsCount ?? 0} pending)
            </span>
          </div>
          <Link
            href="/admin/payouts"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 mt-2 transition-colors"
          >
            <span>Settle Payments</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Action Banners & Operations Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/applications"
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-midnight-900 to-midnight-900 border border-amber-500/30 hover:border-amber-500/60 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full">
              {stats?.pendingApplications ?? 0} Waiting
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
            Creator Audition Review
          </h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Listen to sample auditions, verify 100% original master declarations, and grant official creator badges.
          </p>
        </Link>

        <Link
          href="/admin/fraud"
          className="p-6 rounded-2xl bg-gradient-to-br from-rose-500/10 via-midnight-900 to-midnight-900 border border-rose-500/30 hover:border-rose-500/60 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-full">
              {stats?.highRiskFraudEvents ?? 0} High Risk
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
            Anti-Fraud Cockpit
          </h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Investigate burst like velocity anomalies, device collisions, and execute immediate one-click void actions.
          </p>
        </Link>

        <Link
          href="/admin/rights"
          className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/10 via-midnight-900 to-midnight-900 border border-teal-500/30 hover:border-teal-500/60 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-teal-400 bg-teal-500/20 border border-teal-500/30 px-2.5 py-1 rounded-full">
              {stats?.rightsExpired ? `${stats.rightsExpired} Expired` : '100% Compliant'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
            Rights & Licensing Radar
          </h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Monitor catalog ownership across 5 license tiers, track expiration timelines, and enforce takedowns.
          </p>
        </Link>
      </div>

      {/* Recent Audit Ledger Section */}
      <div className="rounded-2xl bg-midnight-900/60 border border-white/5 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-base font-bold text-white">Live Administrative Audit Log</h2>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-white/5">
          {stats?.recentAuditLogs && stats.recentAuditLogs.length > 0 ? (
            stats.recentAuditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-mono text-white font-medium">{log.action}</span>
                  <span className="text-gray-400">on</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono text-[11px]">
                    {log.entityName}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <span>By: <strong className="text-gray-300">{log.actorName || log.actorEmail}</strong></span>
                  <span className="font-mono text-[11px] text-gray-400">
                    {new Date(log.createdAt).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 py-4 text-center">No recent administrative operations recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
