'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Shield,
  User,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Download,
  Calendar,
  AlertTriangle,
  UserPlus,
  Edit,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  X,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  ArrowRight,
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

const AVAILABLE_ROLES = [
  { id: 'USER', label: 'Listener / User', desc: 'Standard platform music listener & social member' },
  { id: 'CREATOR', label: 'Creator', desc: 'Verified artist with track upload & monetization rights' },
  { id: 'ADMIN', label: 'Administrator', desc: 'Command Center operational & review clearance' },
  { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full root clearance & access governance' },
  { id: 'MODERATOR', label: 'Moderator', desc: 'Audition, lyrics, and content moderation specialist' },
  { id: 'FINANCE', label: 'Finance Officer', desc: 'Settlement, wallet, and royalty payout auditor' },
];

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
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [inspectUser, setInspectUser] = useState<UserRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserRecord | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);

  // Form states: Add User
  const [addFullName, setAddFullName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addShowPw, setAddShowPw] = useState(false);
  const [addRoles, setAddRoles] = useState<string[]>(['USER']);
  const [addStatus, setAddStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [addIsVerified, setAddIsVerified] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Form states: Edit User
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'DELETED'>('ACTIVE');
  const [editIsVerified, setEditIsVerified] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Form states: Password Reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [isSubmittingPw, setIsSubmittingPw] = useState(false);
  const [pwCopied, setPwCopied] = useState(false);

  // Form states: Delete
  const [permanentDelete, setPermanentDelete] = useState(true);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

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

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(id);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'T5#';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // 1. ADD USER HANDLER
  const handleOpenAdd = () => {
    setAddFullName('');
    setAddEmail('');
    setAddUsername('');
    setAddPhone('');
    setAddPassword(generateRandomPassword());
    setAddShowPw(true);
    setAddRoles(['USER']);
    setAddStatus('ACTIVE');
    setAddIsVerified(false);
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail || !addPassword || !addFullName) {
      showToast('error', 'Full Name, Email, and Password are required.');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: addFullName,
          email: addEmail,
          username: addUsername || undefined,
          phone: addPhone || undefined,
          password: addPassword,
          roles: addRoles,
          status: addStatus,
          isVerified: addIsVerified,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || 'Failed to create user');
      }

      showToast('success', `Created account for ${json.data.fullName || json.data.email}`);
      setShowAddModal(false);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // 2. EDIT USER HANDLER
  const handleOpenEdit = (userItem: UserRecord) => {
    setEditingUser(userItem);
    setEditFullName(userItem.fullName);
    setEditEmail(userItem.email);
    setEditUsername(userItem.username);
    setEditPhone(userItem.phone || '');
    setEditRoles(userItem.roles.length > 0 ? userItem.roles : ['USER']);
    setEditStatus(userItem.status);
    setEditIsVerified(userItem.isVerified);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmittingEdit(true);
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          fullName: editFullName,
          email: editEmail,
          username: editUsername,
          phone: editPhone,
          roles: editRoles,
          status: editStatus,
          isVerified: editIsVerified,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to update user');
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...json.data } : u))
      );
      if (inspectUser?.id === editingUser.id) {
        setInspectUser({ ...inspectUser, ...json.data });
      }

      showToast('success', `Updated account details for ${json.data.fullName || json.data.email}`);
      setEditingUser(null);
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // 3. RESET PASSWORD HANDLER
  const handleOpenPassword = (userItem: UserRecord) => {
    setPasswordUser(userItem);
    const generated = generateRandomPassword();
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowNewPw(true);
    setPwCopied(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser) return;
    if (newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }

    setIsSubmittingPw(true);
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: passwordUser.id,
          newPassword,
          notes: 'Admin updated user passphrase from Command Center',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to update password');
      }

      showToast('success', `New password saved for ${passwordUser.fullName || passwordUser.email}`);
      setPasswordUser(null);
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setIsSubmittingPw(false);
    }
  };

  // 4. DELETE USER HANDLER
  const handleOpenDelete = (userItem: UserRecord) => {
    setDeletingUser(userItem);
    setPermanentDelete(true);
  };

  const handleDeleteSubmit = async () => {
    if (!deletingUser) return;

    setIsSubmittingDelete(true);
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: deletingUser.id,
          permanent: permanentDelete,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to delete user');
      }

      if (permanentDelete) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === deletingUser.id ? { ...u, status: 'DELETED' } : u))
        );
      }

      if (inspectUser?.id === deletingUser.id) {
        setInspectUser(null);
      }

      showToast('success', json.message || 'User deleted successfully');
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // 5. QUICK TOGGLES
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
        if (inspectUser?.id === targetUser.id) {
          setInspectUser({ ...inspectUser, isVerified: !targetUser.isVerified });
        }
        showToast('success', `Verification updated for ${targetUser.fullName || targetUser.username}`);
      } else {
        throw new Error(json.error?.message || 'Update failed');
      }
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setActionLoadingId(null);
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
        if (inspectUser?.id === targetUser.id) {
          setInspectUser({ ...inspectUser, status: newStatus });
        }
        showToast('success', `Account status set to ${newStatus} for ${targetUser.fullName || targetUser.username}`);
      } else {
        throw new Error(json.error?.message || 'Update failed');
      }
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setActionLoadingId(null);
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

        <div className="flex flex-wrap items-center gap-3">
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

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs flex items-center gap-2 shadow-[0_4px_15px_rgba(244,63,94,0.3)] border border-rose-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User / Admin</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between gap-3 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
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

        {/* Admins */}
        <div className="p-4 rounded-2xl bg-midnight-900/70 border border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-400/90">Staff & Admins</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-rose-400 mt-2">
            {summary ? summary.totalAdmins.toLocaleString() : '...'}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Command clearances</p>
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
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Signed Up</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-midnight-900/20">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
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
                              : item.status === 'SUSPENDED'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'ACTIVE'
                                ? 'bg-emerald-400 animate-pulse'
                                : item.status === 'SUSPENDED'
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
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
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect */}
                          <button
                            type="button"
                            onClick={() => setInspectUser(item)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/5"
                            title="Inspect User Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details & Roles */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-colors"
                            title="Edit User Details & Roles"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenPassword(item)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors"
                            title="Update / Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Suspend / Activate */}
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleToggleStatus(item)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-colors border ${
                              item.status === 'ACTIVE'
                                ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/20'
                            }`}
                          >
                            {item.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(item)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <p className="text-base font-semibold text-white">No registered users found</p>
                    <p className="text-xs text-gray-500 mt-1">Try altering your search query or role/status filters.</p>
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
            <strong className="text-white">{summary?.totalUsers ?? users.length}</strong> registered platform accounts
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

      {/* ========================================================= */}
      {/* 1. ADD USER / ADMIN MODAL */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-midnight-950 border border-rose-500/30 p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider">
                  <UserPlus className="w-4 h-4" />
                  <span>Provision New Account</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">Add User or Administrator</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addFullName}
                    onChange={(e) => setAddFullName(e.target.value)}
                    placeholder="e.g. Arijit Singh"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    placeholder="Auto-generated if empty"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono text-gray-400 uppercase">
                    Initial Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const p = generateRandomPassword();
                      setAddPassword(p);
                    }}
                    className="text-[10px] font-mono text-amber-400 hover:underline"
                  >
                    Generate Secure Key
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={addShowPw ? 'text' : 'password'}
                    required
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setAddShowPw(!addShowPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {addShowPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Roles Selection */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1.5">
                  Select User Roles & Permissions
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_ROLES.map((r) => {
                    const isChecked = addRoles.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (addRoles.length > 1) {
                              setAddRoles(addRoles.filter((x) => x !== r.id));
                            }
                          } else {
                            setAddRoles([...addRoles, r.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                          isChecked
                            ? r.id.includes('ADMIN')
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                              : r.id === 'CREATOR'
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                              : 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                            : 'bg-white/[0.02] border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-semibold text-[11px]">{r.label}</span>
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${
                              isChecked ? 'bg-white text-black' : 'border border-white/20'
                            }`}
                          >
                            {isChecked && '✓'}
                          </span>
                        </div>
                        <span className="text-[9px] opacity-75 line-clamp-1">{r.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status and Verification Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">Identity Verified</span>
                    <span className="text-[10px] text-gray-500">Green verification tick</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={addIsVerified}
                    onChange={(e) => setAddIsVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">Status</span>
                    <span className="text-[10px] text-gray-500">{addStatus}</span>
                  </div>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as any)}
                    className="bg-black/60 border border-white/10 rounded-lg text-xs text-white px-2 py-1"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingAdd}
                  className="bg-rose-600 hover:bg-rose-500 border-rose-500 text-white font-bold"
                >
                  {isSubmittingAdd ? 'Provisioning Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. EDIT USER MODAL */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-midnight-950 border border-blue-500/30 p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-wider">
                  <Edit className="w-4 h-4" />
                  <span>Update Account Dossier</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">Edit User & Clearance</h2>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Roles Selection */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1.5">
                  Assigned Roles (Promote / Demote)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_ROLES.map((r) => {
                    const isChecked = editRoles.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (editRoles.length > 1) {
                              setEditRoles(editRoles.filter((x) => x !== r.id));
                            }
                          } else {
                            setEditRoles([...editRoles, r.id]);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                          isChecked
                            ? r.id.includes('ADMIN')
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                              : r.id === 'CREATOR'
                              ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                              : 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                            : 'bg-white/[0.02] border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-semibold text-[11px]">{r.label}</span>
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${
                              isChecked ? 'bg-white text-black' : 'border border-white/20'
                            }`}
                          >
                            {isChecked && '✓'}
                          </span>
                        </div>
                        <span className="text-[9px] opacity-75 line-clamp-1">{r.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status and Verification Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">Identity Verified</span>
                    <span className="text-[10px] text-gray-500">
                      {editIsVerified ? 'Active badge' : 'Unverified'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsVerified}
                    onChange={(e) => setEditIsVerified(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500 focus:ring-0 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">Account Status</span>
                    <span className="text-[10px] text-gray-500">{editStatus}</span>
                  </div>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="bg-black/60 border border-white/10 rounded-lg text-xs text-white px-2 py-1"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="DELETED">DELETED</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingEdit}
                  className="bg-blue-600 hover:bg-blue-500 border-blue-500 text-white font-bold"
                >
                  {isSubmittingEdit ? 'Saving Changes...' : 'Save Updates'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. RESET PASSWORD MODAL */}
      {/* ========================================================= */}
      {passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-midnight-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
                  <KeyRound className="w-4 h-4" />
                  <span>Credential Security</span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1">Reset Password</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update passphrase for <span className="text-white font-medium">{passwordUser.fullName || passwordUser.username}</span> ({passwordUser.email})
                </p>
              </div>
              <button
                onClick={() => setPasswordUser(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Quick Generator Button */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="text-amber-300 font-medium">Generate Random Passphrase:</span>
                <button
                  type="button"
                  onClick={() => {
                    const p = generateRandomPassword();
                    setNewPassword(p);
                    setConfirmPassword(p);
                  }}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-mono font-bold transition-colors"
                >
                  Generate
                </button>
              </div>

              {/* New Password Field */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                  New Cryptographic Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Copy Key Button */}
              {newPassword && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
                  <span className="text-gray-400 truncate max-w-[240px]">{newPassword}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(newPassword);
                      setPwCopied(true);
                      setTimeout(() => setPwCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-amber-400 hover:underline"
                  >
                    {pwCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPasswordUser(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingPw}
                  className="bg-amber-600 hover:bg-amber-500 border-amber-500 text-white font-bold"
                >
                  {isSubmittingPw ? 'Securing Passphrase...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-midnight-950 border border-rose-500/50 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete User Account</h3>
                <p className="text-xs text-gray-400 mt-1">
                  You are about to remove <strong className="text-white">{deletingUser.fullName || deletingUser.username}</strong> ({deletingUser.email}).
                </p>
              </div>
            </div>

            <div className="space-y-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200">
              <p className="font-semibold text-rose-300">Choose Deletion Type:</p>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="delType"
                  checked={permanentDelete}
                  onChange={() => setPermanentDelete(true)}
                  className="mt-0.5 text-rose-600 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white block">Permanent Purge (Irreversible)</span>
                  <span className="text-[11px] text-gray-400">
                    Completely removes the user record and cleans up relational references from database.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="radio"
                  name="delType"
                  checked={!permanentDelete}
                  onChange={() => setPermanentDelete(false)}
                  className="mt-0.5 text-rose-600 focus:ring-0"
                />
                <div>
                  <span className="font-bold text-white block">Soft Deactivate (Archive)</span>
                  <span className="text-[11px] text-gray-400">
                    Marks status as DELETED. Revokes access but keeps history for compliance.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeletingUser(null)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <button
                type="button"
                disabled={isSubmittingDelete}
                onClick={handleDeleteSubmit}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-[0_4px_15px_rgba(244,63,94,0.4)] border border-rose-500 transition-all disabled:opacity-50"
              >
                {isSubmittingDelete ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. INSPECT USER DOSSIER MODAL */}
      {/* ========================================================= */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-midnight-950 border border-rose-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/30 to-rose-900/40 border border-rose-500/40 flex items-center justify-center text-rose-300 font-bold text-base">
                  {inspectUser.fullName
                    ? inspectUser.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                    : inspectUser.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{inspectUser.fullName || inspectUser.username}</h3>
                  <p className="text-xs font-mono text-gray-400">@{inspectUser.username}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectUser(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 divide-y divide-white/5 text-xs">
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Account ID:</span>
                <span className="font-mono text-gray-200 select-all">{inspectUser.id}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Email Address:</span>
                <span className="font-mono text-gray-200">{inspectUser.email}</span>
              </div>
              {inspectUser.phone && (
                <div className="pt-2 flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="font-mono text-gray-200">{inspectUser.phone}</span>
                </div>
              )}
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Assigned Roles:</span>
                <div className="flex gap-1">
                  {inspectUser.roles.map((r) => (
                    <span key={r} className="px-2 py-0.5 rounded bg-white/5 text-gray-300 font-mono text-[10px]">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Verification Status:</span>
                <span className={inspectUser.isVerified ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  {inspectUser.isVerified ? 'Verified Account' : 'Pending Verification'}
                </span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Account Status:</span>
                <span className={inspectUser.status === 'ACTIVE' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {inspectUser.status}
                </span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Auth Provider:</span>
                <span className="font-mono capitalize text-gray-300">{inspectUser.authProvider}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-gray-400">Registration Date:</span>
                <span className="font-mono text-gray-300">{new Date(inspectUser.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Bar inside Dossier */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  handleOpenEdit(inspectUser);
                }}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenPassword(inspectUser);
                }}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleVerification(inspectUser)}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center justify-center gap-1"
              >
                <span>{inspectUser.isVerified ? 'Unverify' : 'Verify'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenDelete(inspectUser);
                }}
                className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
