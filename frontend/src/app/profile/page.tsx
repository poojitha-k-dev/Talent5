'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Edit3,
  Key,
  LogOut,
  Music,
  Heart,
  ListMusic,
  UserCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Radio,
  Play,
  Clock,
  Mic2,
  Trophy,
  Headphones,
  Wallet,
  MapPin,
  Flame,
  UploadCloud,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { Song, Playlist, Artist } from '@talent5/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SongRow } from '@/components/ui/SongRow';
import { FileUploadZone } from '@/components/ui/FileUploadZone';

interface ProfileSummaryData {
  stats: {
    likedSongsCount: number;
    playlistsCount: number;
    followingCount: number;
    songsPlayedCount: number;
    totalListeningMinutes: number;
    competitionVotesCount: number;
    activeCompetitionsCount: number;
  };
  creatorProfile: {
    id: string;
    stageName: string;
    bio: string | null;
    city: string;
    state: string;
    category: string;
    isApproved: boolean;
    verifiedBadge: boolean;
    availableBalance: number;
    totalEarned: number;
    createdAt: string;
  } | null;
  creatorApplication: {
    id: string;
    stageName: string;
    category: string;
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    createdAt: string;
  } | null;
  recentHistory: Song[];
}

export default function ProfilePage() {
  const { user, token, logout, login, isLoading: authLoading } = useAuth();
  const { currentSong, isPlaying } = useAudio();

  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'security' | 'library'>('overview');

  // Dynamic profile summary from backend
  const [summaryData, setSummaryData] = useState<ProfileSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Full library items for detailed tabs
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([]);

  // Edit Profile Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync profile details when user loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Fetch real profile summary data from DB
  const fetchProfileSummary = async () => {
    if (!token) {
      setSummaryLoading(false);
      return;
    }

    try {
      setSummaryLoading(true);
      const [sumRes, libRes] = await Promise.all([
        fetch('/api/v1/auth/profile-summary', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/v1/library', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (sumRes.ok) {
        const sumJson = await sumRes.json();
        if (sumJson.success && sumJson.data) {
          setSummaryData(sumJson.data);
        }
      }

      if (libRes.ok) {
        const libJson = await libRes.json();
        setLikedSongs(libJson.data?.likedSongs || []);
        setPlaylists(libJson.data?.playlists || []);
        setFollowedArtists(libJson.data?.followedArtists || []);
      }
    } catch (err) {
      console.error('Error fetching real profile data:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileSummary();
  }, [token]);

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim(),
          phone: phone.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data?.user) {
        login(token, data.data.user);
        setUpdateMessage({ type: 'success', text: 'Profile updated successfully!' });
        fetchProfileSummary();
        setTimeout(() => setUpdateMessage(null), 4000);
      } else {
        setUpdateMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err: any) {
      setUpdateMessage({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setIsChangingPass(true);
    setPasswordMessage(null);

    try {
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(null), 4000);
      } else {
        setPasswordMessage({ type: 'error', text: data.message || 'Failed to change password.' });
      }
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <EmptyState
          icon={UserIcon}
          title="Sign in to view your profile"
          description="Access your real account settings, customized playlists, favorite Desi creators, and music preferences."
          actionLabel="Sign In / Register"
          actionHref="/login"
        />
      </div>
    );
  }

  const userInitial = (user.fullName || user.username || user.email || 'U')[0]?.toUpperCase();
  const formattedJoinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  const isGoogleAuth = user.authProvider === 'google';
  const isCreator = user.roles?.includes('CREATOR') || Boolean(summaryData?.creatorProfile);
  const isAdmin = user.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN'].includes(r));

  // Dynamic real stats from database
  const stats = summaryData?.stats || {
    likedSongsCount: likedSongs.length,
    playlistsCount: playlists.length,
    followingCount: followedArtists.length,
    songsPlayedCount: 0,
    totalListeningMinutes: 0,
    competitionVotesCount: 0,
    activeCompetitionsCount: 0,
  };

  const creatorProfile = summaryData?.creatorProfile;
  const creatorApp = summaryData?.creatorApplication;
  const recentHistory = summaryData?.recentHistory || [];

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-16">
      {/* 1. HERO BANNER & REAL USER PROFILE INFO */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-[#181311] to-[#0f0e0d] border border-black/10 dark:border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.18)_0%,transparent_70%)] pointer-events-none rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.15)_0%,transparent_70%)] pointer-events-none rounded-full" />

        {/* Top Header Pattern */}
        <div className="h-32 sm:h-44 w-full bg-gradient-to-r from-orange-600/30 via-amber-600/20 to-zinc-800/40 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          <div className="absolute bottom-3 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-black/50 backdrop-blur-md text-white/90 border border-white/10 shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Real Verified Account
            </span>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 sm:px-10 pb-8 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Real Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-[#0e1017] shadow-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-500 flex items-center justify-center text-white text-4xl font-extrabold uppercase flex-shrink-0">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName || user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>
              <button
                onClick={() => setActiveTab('edit')}
                className="absolute bottom-1 right-1 p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 transition-transform hover:scale-105"
                title="Upload Photo / Edit Profile"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Name, Handle, Member Since & Roles */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {user.fullName || user.username}
                </h1>
                {user.isVerified && (
                  <span title="Verified User">
                    <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20" />
                  </span>
                )}
              </div>

              <p className="text-sm text-zinc-400 flex items-center justify-center sm:justify-start gap-2 font-mono">
                <span>@{user.username}</span>
                <span>•</span>
                <span className="font-sans flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  Member since {formattedJoinDate}
                </span>
              </p>

              {/* Roles Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {user.roles?.map((role) => (
                  <span
                    key={role}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                      role === 'ADMIN' || role === 'SUPER_ADMIN'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : role === 'CREATOR'
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                        : 'bg-white/5 text-zinc-300 border-white/10'
                    }`}
                  >
                    {role}
                  </span>
                ))}
                {isGoogleAuth && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Google OAuth
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {isCreator ? (
              <Link
                href="/creator-studio"
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2"
              >
                <Mic2 className="w-4 h-4" />
                Creator Studio
              </Link>
            ) : creatorApp ? (
              <span className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Application: {creatorApp.status}
              </span>
            ) : (
              <Link
                href="/creator-studio/apply"
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Become Creator
              </Link>
            )}

            <button
              onClick={() => logout()}
              className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL STATS GRID (All numbers calculated from live database tables) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/library"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-sm hover:border-orange-500/40 hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Liked Songs</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4 fill-rose-500/20" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {summaryLoading ? '...' : stats.likedSongsCount}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">Real favorited tracks</span>
        </Link>

        <Link
          href="/library"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-sm hover:border-orange-500/40 hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Created Playlists</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ListMusic className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {summaryLoading ? '...' : stats.playlistsCount}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">Personal playlists</span>
        </Link>

        <Link
          href="/library"
          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-sm hover:border-orange-500/40 hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Following Artists</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {summaryLoading ? '...' : stats.followingCount}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">Desi creators followed</span>
        </Link>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Stream History</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white">
            {summaryLoading ? '...' : stats.songsPlayedCount}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 inline-block">
            {stats.totalListeningMinutes > 0 ? `${stats.totalListeningMinutes} mins played` : 'Tracks listened'}
          </span>
        </div>
      </div>

      {/* 3. TABS HEADER */}
      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'edit'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile & Avatar
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Key className="w-4 h-4" />
          Account & Security
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'library'
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Heart className="w-4 h-4" />
          Favorite Tracks ({likedSongs.length})
        </button>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Credentials / Real Record Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                Account Credentials
              </h2>

              <div className="space-y-3.5 text-xs">
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                  <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">{user.email}</span>
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                  <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                    <UserIcon className="w-3.5 h-3.5" /> User Handle
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">@{user.username}</span>
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                  <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5" /> Registered Phone
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                    {user.phone ? user.phone : 'Not provided yet'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                  <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Auth Provider
                  </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100 uppercase">
                    {user.authProvider || 'password'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                  <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Account Status
                  </span>
                  <span className="font-semibold text-emerald-500 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {user.status || 'ACTIVE'}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold"
                onClick={() => setActiveTab('edit')}
              >
                Edit Profile
              </Button>
            </div>

            {/* Creator Profile Card (if exists) */}
            {creatorProfile && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-orange-500/20 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic2 className="w-3.5 h-3.5" /> Creator Profile
                  </span>
                  {creatorProfile.verifiedBadge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                      Verified
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {creatorProfile.stageName}
                  </h3>
                  <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {creatorProfile.city}, {creatorProfile.state} • {creatorProfile.category}
                  </p>
                </div>

                {creatorProfile.bio && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 italic line-clamp-2">
                    &quot;{creatorProfile.bio}&quot;
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-500/20">
                  <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                    <span className="text-[10px] text-zinc-400">Wallet Balance</span>
                    <p className="text-sm font-bold text-emerald-500">
                      ₹{Number(creatorProfile.availableBalance).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04]">
                    <span className="text-[10px] text-zinc-400">Total Earned</span>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      ₹{Number(creatorProfile.totalEarned).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <Link href="/creator-studio" className="block pt-1">
                  <Button size="sm" className="w-full text-xs font-semibold gap-1.5">
                    Open Creator Studio
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Recently Liked & User Playlists */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real Liked Songs */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Recently Liked Songs
                  </h2>
                  <p className="text-xs text-zinc-500">From your live Talent5 favorites collection</p>
                </div>
                <Link
                  href="/library"
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                >
                  View All ({likedSongs.length})
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {likedSongs.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No liked songs found in your library yet. Browse the home page or search tracks and click the heart icon!
                </div>
              ) : (
                <div className="space-y-1">
                  {likedSongs.slice(0, 4).map((song, idx) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={idx}
                      playlistContext={likedSongs}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Real Playlists */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ListMusic className="w-4 h-4 text-orange-500" />
                    Your Playlists
                  </h2>
                  <p className="text-xs text-zinc-500">Playlists created under this account</p>
                </div>
                <Link
                  href="/library"
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                >
                  Manage Playlists
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {playlists.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">
                  You haven&apos;t created any playlists yet. Click &quot;Create Playlist&quot; in the sidebar to build your first mix!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {playlists.slice(0, 4).map((playlist) => (
                    <Link
                      key={playlist.id}
                      href={`/playlist/${playlist.id}`}
                      className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:border-orange-500/30 transition-all flex items-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-500 flex-shrink-0 group-hover:scale-105 transition-transform">
                        <Music className="w-6 h-6" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors truncate">
                          {playlist.name}
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {(playlist as any).songCount || 0} tracks • {playlist.visibility}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Real Recent Listening History */}
            {recentHistory.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-purple-500" />
                    Recently Streamed Tracks
                  </h2>
                </div>

                <div className="space-y-1">
                  {recentHistory.map((song, idx) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={idx}
                      playlistContext={recentHistory}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EDIT PROFILE & REAL AVATAR UPLOAD */}
      {activeTab === 'edit' && (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Edit Profile Details</h2>
            <p className="text-xs text-zinc-500">Update your actual name, handle, phone number, and avatar photo.</p>
          </div>

          {updateMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
                updateMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}
            >
              {updateMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{updateMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Real Avatar Photo Upload / URL */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Profile Photo
              </label>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-orange-500/50 bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Paste image URL (e.g. https://...)"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-white"
                    />
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-3 py-2 text-xs font-semibold rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors whitespace-nowrap"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Or Direct File Upload */}
                  {token && (
                    <FileUploadZone
                      accept="image"
                      label="Or click / drag an image file from your device"
                      helperText="Supports JPG, PNG, WEBP (Max 15MB)"
                      token={token}
                      onFileUploaded={(result) => setAvatarUrl(result.url)}
                      onClear={() => setAvatarUrl('')}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-zinc-400">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/[0.06] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-zinc-500">Contact support to change your account email.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={isUpdating} className="gap-2 text-xs font-bold px-6">
                <Save className="w-4 h-4" />
                {isUpdating ? 'Saving to Database...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: PASSWORD & SECURITY */}
      {activeTab === 'security' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Account Security</h2>
            <p className="text-xs text-zinc-500">
              {isGoogleAuth
                ? 'Your account is authenticated securely via Google OAuth.'
                : 'Manage your password and security credentials.'}
            </p>
          </div>

          {isGoogleAuth ? (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Connected to Google
              </p>
              <p className="text-blue-300/80">
                You log in using your Google account ({user.email}). Password changes are managed directly via Google.
              </p>
            </div>
          ) : (
            <>
              {passwordMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
                    passwordMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}
                >
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" disabled={isChangingPass} className="gap-2 text-xs font-bold px-6">
                    <Key className="w-4 h-4" />
                    {isChangingPass ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </>
          )}

          <div className="pt-4 border-t border-black/5 dark:border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
              Account Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <span className="text-zinc-400">Account ID (UUID)</span>
                <p className="font-mono text-[11px] text-zinc-600 dark:text-zinc-300 truncate mt-0.5">
                  {user.id}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <span className="text-zinc-400">Last Updated</span>
                <p className="font-sans text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-IN') : 'Recently'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REAL FAVORITES */}
      {activeTab === 'library' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
                Your Liked Tracks ({likedSongs.length})
              </h2>
              <p className="text-xs text-zinc-500">Every track you heart is automatically stored in your library.</p>
            </div>

            <Link href="/library">
              <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5">
                Open Full Library
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {likedSongs.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No liked songs in your collection yet.
            </div>
          ) : (
            <div className="space-y-1">
              {likedSongs.map((song, idx) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={idx}
                  playlistContext={likedSongs}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
