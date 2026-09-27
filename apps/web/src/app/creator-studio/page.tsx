'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Music,
  Eye,
  Heart,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Upload,
  ArrowUpRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatCompactNumber, formatINR } from '@talent5/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function CreatorStudioOverviewPage() {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/v1/creators/studio/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (e) {
        console.error('Studio summary error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-teal-400 mx-auto" />
        <h2 className="text-2xl font-bold font-display text-white">Creator Studio Access</h2>
        <p className="text-sm text-gray-400">Please sign in to access your creator dashboard.</p>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="peacock" size="md">
              Sign In to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-teal-400 font-display">Loading Creator Studio...</p>
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6 glass-panel rounded-3xl p-8 border border-white/10">
        <Sparkles className="w-12 h-12 text-teal-400 mx-auto" />
        <h2 className="text-2xl font-bold font-display text-white">
          Become an Approved Creator to Access Studio
        </h2>
        <p className="text-sm text-gray-400">
          Creator Studio is reserved for verified independent singers, rappers, and composers. Submit an audition to get started.
        </p>
        <Link href="/creator-studio/apply">
          <Button variant="peacock" size="lg" className="font-bold text-midnight-950">
            Apply Now
          </Button>
        </Link>
      </div>
    );
  }

  const { profile, wallet, metrics, songs, submissions, rewardRule } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              {profile.stageName} Studio
            </h1>
            <Badge type="approvedCreator" label="Approved Creator" />
          </div>
          <p className="text-xs text-gray-400">
            {profile.category} • {profile.city}, {profile.state} • Validated Rewards Active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/creator-studio/uploads">
            <Button variant="peacock" size="md" className="gap-2 font-bold text-midnight-950">
              <Upload className="w-4 h-4" /> Submit Original Track
            </Button>
          </Link>
          <Link href="/creator-studio/wallet">
            <Button variant="secondary" size="md" className="gap-2">
              <Wallet className="w-4 h-4 text-amber-400" /> Creator Wallet
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Wallet Balance */}
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Available Balance</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-amber-400">
            {formatINR(wallet.availableBalanceINR)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
            <span>Rate: ₹{rewardRule?.rewardPerValidLikeINR?.toFixed(2)}/valid like</span>
            <Link href="/creator-studio/wallet" className="text-amber-400 hover:underline flex items-center gap-0.5">
              Withdraw <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Validated Engagement Likes */}
        <div className="glass-panel rounded-2xl p-5 border border-teal-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Validated Likes</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-teal-300">
            {formatCompactNumber(metrics.totalValidLikes)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
            <span>Raw: {formatCompactNumber(metrics.totalRawLikes)}</span>
            {metrics.invalidLikesDeducted > 0 && (
              <span className="text-rose-400">-{metrics.invalidLikesDeducted} Filtered</span>
            )}
          </div>
        </div>

        {/* Total Streams */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Streams</span>
            <Music className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {formatCompactNumber(metrics.totalPlays)}
          </p>
          <p className="text-[11px] text-gray-400 pt-1">Across all published catalog tracks</p>
        </div>

        {/* Followers */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Followers</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            {formatCompactNumber(metrics.followersCount)}
          </p>
          <p className="text-[11px] text-gray-400 pt-1">Growing audience across India</p>
        </div>
      </div>

      {/* 3. Published Music Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-white">Published Catalog ({songs.length})</h2>
          <Link href="/creator-studio/uploads" className="text-xs text-teal-400 hover:underline">
            + Submit New Track
          </Link>
        </div>

        <div className="divide-y divide-white/5 bg-midnight-900/50 rounded-2xl p-2 border border-white/5">
          {songs.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center">No tracks published yet.</p>
          ) : (
            songs.map((song: any) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={song.artworkUrl}
                    alt={song.title}
                    className="w-12 h-12 rounded-lg object-cover bg-midnight-800"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/song/${song.id}`}
                      className="text-sm font-semibold text-white hover:text-teal-400 truncate block"
                    >
                      {song.title}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {song.languageName} • {song.genreName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-gray-400">
                  <span>{formatCompactNumber(song.playCount)} plays</span>
                  <span className="flex items-center gap-1 text-teal-400 font-semibold">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    {formatCompactNumber(song.validLikesCount)} Valid Likes
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                    Monetized
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Submissions Review Pipeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display text-white">
          Submissions Pipeline ({submissions.length})
        </h2>

        <div className="divide-y divide-white/5 bg-midnight-900/50 rounded-2xl p-2 border border-white/5">
          {submissions.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No pending submissions.</p>
          ) : (
            submissions.map((sub: any) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">{sub.title}</h3>
                  <p className="text-xs text-gray-400">
                    Category: {sub.category} • Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                  {sub.reviewNotes && (
                    <p className="text-xs text-amber-400/80 mt-1">Reviewer Note: {sub.reviewNotes}</p>
                  )}
                </div>

                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      sub.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : sub.status === 'UNDER_REVIEW'
                        ? 'bg-amber-500/20 text-amber-300'
                        : sub.status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
