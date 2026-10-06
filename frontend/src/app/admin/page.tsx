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
  Search,
  Mail,
  Shield,
  Check,
  Copy,
  User,
  ShieldCheck,
  Calendar,
  Music,
  Mic2,
  Trophy,
  Wallet,
  Flag,
  Radio,
  UserCog,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminUserItem {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
  phone?: string | null;
  authProvider: string;
  isVerified: boolean;
  status: string;
  createdAt: string;
  roles: string[];
  isCreator: boolean;
}

interface UserBreakdown {
  totalUsers: number;
  totalCreators: number;
  totalListeners: number;
  verifiedUsers: number;
  newThisWeek: number;
  newThisMonth: number;
}

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
  userBreakdown?: UserBreakdown;
  recentSignups?: AdminUserItem[];
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

  // User Section Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'LISTENER' | 'CREATOR' | 'ADMIN'>('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

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

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Filtered users for the Registered Users section
  const filteredUsers = (stats?.recentSignups || []).filter((u) => {
    const matchesSearch =
      userSearch === '' ||
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase());

    const isCreator = u.isCreator || u.roles.includes('CREATOR');
    const isAdmin = u.roles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'FINANCE', 'MODERATOR'].includes(r));
    const isListener = !isCreator && !isAdmin;

    const matchesRole =
      userRoleFilter === 'ALL' ||
      (userRoleFilter === 'CREATOR' && isCreator) ||
      (userRoleFilter === 'ADMIN' && isAdmin) ||
      (userRoleFilter === 'LISTENER' && isListener);

    const matchesVerified =
      verifiedFilter === 'ALL' ||
      (verifiedFilter === 'VERIFIED' && u.isVerified) ||
      (verifiedFilter === 'UNVERIFIED' && !u.isVerified);

    return matchesSearch && matchesRole && matchesVerified;
  });

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
        <div className="p-5 rounded-2xl bg-midnight-900/70 border border-white/5 relative overflow-hidden backdrop-blur-md hover:border-blue-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total Registered Users</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
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
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">Active Indian listeners & creators</p>
            <Link
              href="/admin/users"
              className="text-[11px] font-medium text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>View Roster</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
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

      {/* Sovereign Operations & Media Studios Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <h2 className="text-sm font-bold font-display uppercase tracking-wider text-gray-300">
              Sovereign Operations & Media Cockpits
            </h2>
          </div>
          <span className="text-[11px] font-mono text-gray-500">8 Active Command Portals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/catalog"
            className="p-5 rounded-2xl bg-midnight-900/60 border border-white/5 hover:border-rose-500/40 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <Music className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm group-hover:text-rose-300 transition-colors">
                Song Catalog & Streams
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Direct audio streaming, metadata CRUD, and emergency takedowns.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/lyrics"
            className="p-5 rounded-2xl bg-midnight-900/60 border border-white/5 hover:border-amber-500/40 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Mic2 className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                Karaoke & Synced Lyrics
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Live playhead timing studio, native Indian language script alignments.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/competitions"
            className="p-5 rounded-2xl bg-midnight-900/60 border border-white/5 hover:border-amber-500/40 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Trophy className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                Grand Challenges
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Music hunts, participant audition audit, bot voting penalty, and prize awards.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="p-5 rounded-2xl bg-midnight-900/60 border border-white/5 hover:border-rose-500/40 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <Flag className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm group-hover:text-rose-300 transition-colors">
                Community Reports & DMCA
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Flagged song takedowns, creator misconduct, and DMCA disputes.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/wallets"
            className="p-5 rounded-2xl bg-midnight-900/60 border border-white/5 hover:border-emerald-500/40 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                Creator Wallets & Economy
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Ledger overrides, promotional credits, fraud recovery, and dynamic rate tuning.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/curation"
            className="p-5 rounded-2xl bg-midnight-900/60 border border-white/5 hover:border-teal-500/40 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm group-hover:text-teal-300 transition-colors">
                Homepage CMS & Playlists
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Official editorial playlists, spotlight releases, and hero featured songs.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/broadcasts"
            className="p-5 rounded-2xl bg-midnight-900/60 border border-white/5 hover:border-indigo-500/40 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Radio className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                Broadcast Announcements
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Dispatch platform-wide alerts, competition announcements, and notices.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/team"
            className="p-5 rounded-2xl bg-midnight-900/60 border border-white/5 hover:border-rose-500/40 transition-all group flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <UserCog className="w-4 h-4" />
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm group-hover:text-rose-300 transition-colors">
                Staff RBAC & Delegation
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                Grant or revoke Super Admin, Moderator, Finance, and Content clearances.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Platform Registered Users & Signups Section */}
      <div id="registered-users-section" className="rounded-2xl bg-midnight-900/60 border border-white/5 p-6 backdrop-blur-md space-y-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Registered Platform Users & Signups</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {stats?.userBreakdown?.totalUsers ?? stats?.totalUsers ?? 0} Users
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time roster of audience listeners, creators, and administrators registered on the platform.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-xs font-medium border border-white/10 transition-colors"
            >
              <span>User Management Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
            </Link>
          </div>
        </div>

        {/* Telemetry Micro-Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-midnight-950/60 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Listeners / Fans</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {stats?.userBreakdown?.totalListeners ?? 0}
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-midnight-950/60 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Approved Creators</p>
              <p className="text-lg font-bold text-amber-400 mt-0.5">
                {stats?.userBreakdown?.totalCreators ?? stats?.totalCreators ?? 0}
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-midnight-950/60 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Verified Accounts</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                {stats?.userBreakdown?.verifiedUsers ?? 0}
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-midnight-950/60 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Signups (Last 7d)</p>
              <p className="text-lg font-bold text-rose-400 mt-0.5">
                +{stats?.userBreakdown?.newThisWeek ?? 0}
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name, @username, or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-midnight-950/80 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all font-sans"
            />
            {userSearch && (
              <button
                type="button"
                onClick={() => setUserSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Role Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-midnight-950/80 border border-white/5 text-xs">
            {(
              [
                { id: 'ALL', label: 'All Users' },
                { id: 'LISTENER', label: 'Listeners' },
                { id: 'CREATOR', label: 'Creators' },
                { id: 'ADMIN', label: 'Admins' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setUserRoleFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  userRoleFilter === tab.id
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs">
            <thead className="bg-midnight-950/80 border-b border-white/5 text-[11px] font-mono uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Roles</th>
                <th className="py-3 px-4">Auth Method</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Signed Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-midnight-900/30">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((item) => {
                  const isCreator = item.isCreator || item.roles.includes('CREATOR');
                  const isAdmin = item.roles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'FINANCE', 'MODERATOR'].includes(r));
                  const initials = item.fullName
                    ? item.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : item.username.slice(0, 2).toUpperCase();

                  const signupDate = new Date(item.createdAt);
                  const daysAgo = Math.floor((Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border ${
                              isAdmin
                                ? 'bg-gradient-to-br from-rose-500/40 to-rose-700/60 border-rose-500/50'
                                : isCreator
                                ? 'bg-gradient-to-br from-amber-500/40 to-amber-700/60 border-amber-500/50'
                                : 'bg-gradient-to-br from-teal-500/40 to-blue-700/60 border-teal-500/50'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-white flex items-center gap-1.5">
                              <span>{item.fullName || item.username}</span>
                              {isAdmin && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  STAFF
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-gray-500 font-mono">@{item.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 group/email">
                          <span className="font-mono text-gray-300 text-[11px]">{item.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(item.email)}
                            className="opacity-0 group-hover/email:opacity-100 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-opacity"
                            title="Copy email"
                          >
                            {copiedEmail === item.email ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <Shield className="w-2.5 h-2.5" />
                              {item.roles.find((r) => ['SUPER_ADMIN', 'ADMIN'].includes(r)) || 'ADMIN'}
                            </span>
                          ) : isCreator ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Sparkles className="w-2.5 h-2.5" />
                              CREATOR
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              <User className="w-2.5 h-2.5" />
                              LISTENER
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Auth Provider */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400">
                        <span className="capitalize">{item.authProvider || 'password'}</span>
                      </td>

                      {/* Verification */}
                      <td className="py-3.5 px-4">
                        {item.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/90 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            item.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                            }`}
                          />
                          {item.status}
                        </span>
                      </td>

                      {/* Signed Up */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px]">
                          <span className="text-gray-300 font-mono">
                            {signupDate.toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    <p className="text-sm font-medium">No registered users matching the selected filters.</p>
                    {userSearch && (
                      <button
                        onClick={() => {
                          setUserSearch('');
                          setUserRoleFilter('ALL');
                        }}
                        className="text-xs text-rose-400 hover:underline mt-2 inline-block"
                      >
                        Reset search filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-gray-400">
          <p className="text-[11px]">
            Showing <strong className="text-white">{filteredUsers.length}</strong> of{' '}
            <strong className="text-white">{stats?.userBreakdown?.totalUsers ?? stats?.totalUsers ?? 0}</strong> registered accounts
          </p>
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 group"
          >
            <span>Launch Complete User Management Cockpit</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
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
