'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Shield,
  User,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  ArrowUpDown,
  Download,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  MoreVertical,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
  phone?: string | null;
  authProvider: string;
  isVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
  roles: string[];
  isCreator: boolean;
}

interface SummaryStats {
  totalUsers: number;
  totalCreators: number;
  totalListeners: number;
  totalAdmins: number;
  verifiedUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newThisWeek: number;
  newThisMonth: number;
  googleUsers: number;
  passwordUsers: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'LISTENER' | 'CREATOR' | 'ADMIN'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');

  // UI state
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users);
        setSummary(json.data.summary);
      } else {
        setError(json.error?.message || 'Failed to fetch user directory');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  // Handle live search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(id);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleToggleVerification = async (targetUser: UserRecord) => {
    setActionLoadingId(targetUser.id);
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUser.id,
          isVerified: !targetUser.isVerified,
          notes: `Admin toggled verification to ${!targetUser.isVerified}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, isVerified: !u.isVerified } : u))
        );
        if (selectedUser?.id === targetUser.id) {
          setSelectedUser({ ...selectedUser, isVerified: !targetUser.isVerified });
        }
        setNotification({
          type: 'success',
          message: `Verification updated for ${targetUser.fullName || targetUser.username}`,
        });
      } else {
        throw new Error(json.error?.message || 'Update failed');
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleToggleStatus = async (targetUser: UserRecord) => {
    setActionLoadingId(targetUser.id);
    const newStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUser.id,
          status: newStatus,
          notes: `Admin updated account status to ${newStatus}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
        );
        if (selectedUser?.id === targetUser.id) {
          setSelectedUser({ ...selectedUser, status: newStatus });
        }
        setNotification({
          type: 'success',
          message: `Account status updated to ${newStatus} for ${targetUser.fullName || targetUser.username}`,
        });
      } else {
        throw new Error(json.error?.message || 'Update failed');
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const exportCSV = () => {
    if (users.length === 0) return;
    const headers = ['ID', 'Full Name', 'Username', 'Email', 'Roles', 'Status', 'Verified', 'Auth Provider', 'Joined'];
    const rows = users.map((u) => [
      u.id,
      `"${u.fullName.replace(/"/g, '""')}"`,
      `"${u.username}"`,
      `"${u.email}"`,
      `"${u.roles.join(', ')}"`,
      u.status,
      u.isVerified ? 'Yes' : 'No',
      u.authProvider,
      u.createdAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `talent5-users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client-side verification filter on top of server results
  const filteredUsers = users.filter((u) => {
    if (verifiedFilter === 'VERIFIED') return u.isVerified;
    if (verifiedFilter === 'UNVERIFIED') return !u.isVerified;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-rose-400 font-mono uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Identity & Access Governance
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Registered Users & Directory
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse all authenticated accounts, monitor registration velocity, manage security verification, and enforce access controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="text-gray-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportCSV}
            className="text-gray-300 hover:text-white border border-white/10"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="p-4 rounded-2xl bg-midnight-900/70 border border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Total Users</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-white mt-2">
            {summary ? summary.totalUsers.toLocaleString() : '...'}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Platform members</p>
        </div>

        {/* Listeners */}
        <div className="p-4 rounded-2xl bg-midnight-900/70 border border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">Listeners</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-teal-400 mt-2">
            {summary ? summary.totalListeners.toLocaleString() : '...'}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Music audience</p>
        </div>

        {/* Creators */}
        <div className="p-4 rounded-2xl bg-midnight-900/70 border border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400/90">Creators</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-amber-400 mt-2">
            {summary ? summary.totalCreators.toLocaleString() : '...'}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Approved vocalists</p>
        </div>

        {/* Verified Accounts */}
        <div className="p-4 rounded-2xl bg-midnight-900/70 border border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400/90">Verified</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-emerald-400 mt-2">
            {summary ? summary.verifiedUsers.toLocaleString() : '...'}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            {summary ? `${Math.round((summary.verifiedUsers / (summary.totalUsers || 1)) * 100)}% identity rate` : '...'}
          </p>
        </div>

        {/* New Signups */}
        <div className="p-4 rounded-2xl bg-midnight-900/70 border border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-400">Signups (7d)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-rose-400 mt-2">
            +{summary ? summary.newThisWeek.toLocaleString() : '...'}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">
            +{summary ? summary.newThisMonth.toLocaleString() : '...'} this month
          </p>
        </div>
      </div>

      {/* Search and Filter Cockpit */}
      <div className="p-5 rounded-2xl bg-midnight-900/70 border border-white/5 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by full name, @username, or email address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-midnight-950/80 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all font-sans"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-midnight-950/80 border border-white/5 text-xs">
              {(
                [
                  { id: 'ALL', label: 'All Roles' },
                  { id: 'LISTENER', label: 'Listeners' },
                  { id: 'CREATOR', label: 'Creators' },
                  { id: 'ADMIN', label: 'Admins' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    roleFilter === tab.id
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Verification Filter */}
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-midnight-950/80 border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">Verification: All</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="UNVERIFIED">Pending Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-midnight-950/80 border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Active Only</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl bg-midnight-900/60 border border-white/5 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-midnight-950/80 border-b border-white/5 text-[11px] font-mono uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Email & Contact</th>
                <th className="py-3.5 px-4">Roles & Clearance</th>
                <th className="py-3.5 px-4">Auth Method</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Signed Up</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-midnight-900/20">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-rose-500" />
                      <span>Loading registered users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
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
                  const isActionLoading = actionLoadingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Name & Avatar */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white border shadow-sm ${
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
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 group/email">
                          <span className="font-mono text-gray-300 text-[11px]">{item.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.email, item.id)}
                            className="opacity-0 group-hover/email:opacity-100 p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-opacity"
                            title="Copy email"
                          >
                            {copiedEmail === item.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {item.phone && <p className="text-[10px] text-gray-500 font-mono mt-0.5">{item.phone}</p>}
                      </td>

                      {/* Roles */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <Shield className="w-2.5 h-2.5" />
                              {item.roles.find((r) => ['SUPER_ADMIN', 'ADMIN'].includes(r)) || 'ADMIN'}
                            </span>
                          ) : isCreator ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Sparkles className="w-2.5 h-2.5" />
                              CREATOR
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              <User className="w-2.5 h-2.5" />
                              LISTENER
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Auth Provider */}
                      <td className="py-4 px-4 font-mono text-[11px] text-gray-400">
                        <span className="capitalize">{item.authProvider || 'password'}</span>
                      </td>

                      {/* Verification Toggle */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleToggleVerification(item)}
                          className="group/toggle inline-flex items-center gap-1.5 transition-all text-[11px]"
                          title="Click to toggle verification"
                        >
                          {item.isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 group-hover/toggle:border-emerald-500/40">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 group-hover/toggle:border-amber-500/40">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Pending</span>
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
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
                      <td className="py-4 px-4">
                        <div className="text-[11px]">
                          <span className="text-gray-300 font-mono">
                            {signupDate.toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {signupDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(item)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[11px] font-medium transition-colors border border-white/5"
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleToggleStatus(item)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                              item.status === 'ACTIVE'
                                ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border-rose-500/30'
                                : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30'
                            }`}
                          >
                            {item.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <p className="text-base font-semibold text-white">No registered users found</p>
                    <p className="text-xs text-gray-500 mt-1">Try altering your search query or role/status filters.</p>
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="text-xs text-rose-400 hover:underline mt-3 inline-block"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
          <p className="text-[11px]">
            Showing <strong className="text-white">{filteredUsers.length}</strong> of{' '}
            <strong className="text-white">{summary?.totalUsers ?? users.length}</strong> registered platform users
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Overview
            </Link>
          </div>
        </div>
      </div>

      {/* User Details Modal / Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-midnight-950 border border-rose-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/30 to-rose-900/40 border border-rose-500/40 flex items-center justify-center text-rose-300 font-bold text-base">
                  {selectedUser.fullName
                    ? selectedUser.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                    : selectedUser.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUser.fullName || selectedUser.username}</h3>
                  <p className="text-xs font-mono text-gray-400">@{selectedUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 divide-y divide-white/5 text-xs">
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Account ID:</span>
                <span className="font-mono text-gray-200 select-all">{selectedUser.id}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Email Address:</span>
                <span className="font-mono text-gray-200">{selectedUser.email}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Assigned Roles:</span>
                <div className="flex gap-1">
                  {selectedUser.roles.map((r) => (
                    <span key={r} className="px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono text-[10px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Verification Status:</span>
                <span className={selectedUser.isVerified ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {selectedUser.isVerified ? 'Verified Account' : 'Pending Verification'}
                </span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Account Status:</span>
                <span className={selectedUser.status === 'ACTIVE' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {selectedUser.status}
                </span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Auth Provider:</span>
                <span className="font-mono capitalize text-gray-300">{selectedUser.authProvider}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Registration Date:</span>
                <span className="font-mono text-gray-300">{new Date(selectedUser.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => handleToggleVerification(selectedUser)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
              >
                {selectedUser.isVerified ? 'Revoke Verification' : 'Verify Account'}
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedUser)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors ${
                  selectedUser.status === 'ACTIVE'
                    ? 'bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40'
                    : 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40'
                }`}
              >
                {selectedUser.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
