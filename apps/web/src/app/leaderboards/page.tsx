'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Trophy,
  ShieldCheck,
  Music,
  User,
  Heart,
  Play,
  Pause,
  Award,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { formatCompactNumber } from '@talent5/utils';
import { Badge } from '@/components/ui/Badge';

export default function LeaderboardsPage() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const [activeTab, setActiveTab] = useState<'likes' | 'streams' | 'creators'>('likes');
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/leaderboards?timeframe=${timeframe}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setData(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeframe]);

  const topLikes = data?.topLikes || [];
  const topStreams = data?.topStreams || [];
  const topCreators = data?.topCreators || [];

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-500 text-midnight-950 font-bold shadow-saffronGlow';
    if (rank === 2) return 'bg-gray-300 text-midnight-950 font-bold';
    if (rank === 3) return 'bg-amber-700 text-white font-bold';
    return 'bg-midnight-800 text-gray-400 font-mono';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Flame className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Audited Rankings
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Talent5 Leaderboards</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Rankings powered by verified audience engagement and fraud-cleared likes.
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-midnight-900 border border-white/10">
          {(['weekly', 'monthly', 'all-time'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                timeframe === t
                  ? 'bg-amber-500 text-midnight-950 font-bold shadow-saffronGlow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-3">
        {[
          { id: 'likes', label: 'Top Validated Likes', icon: ShieldCheck },
          { id: 'streams', label: 'Most Streamed Songs', icon: Music },
          { id: 'creators', label: 'Top Desi Creators', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard Table Feed */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-gray-400">Calculating Rankings...</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5 bg-midnight-900/50 rounded-2xl p-3 border border-white/5">
          {/* Top Likes Tab */}
          {activeTab === 'likes' &&
            topLikes.map((song: any) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-xs"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${getMedalColor(
                        song.rank
                      )}`}
                    >
                      {song.rank}
                    </span>

                    <img
                      src={song.artworkUrl}
                      alt={song.title}
                      className="w-11 h-11 rounded-lg object-cover bg-midnight-800 flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/music/${song.slug || song.id}`}
                        className="text-sm font-semibold text-white hover:text-amber-400 truncate block"
                      >
                        {song.title}
                      </Link>
                      <Link
                        href={`/artist/${song.artistId}`}
                        className="text-xs text-gray-400 hover:text-gray-200 truncate block"
                      >
                        {song.artistName} • {song.languageName}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <span className="text-gray-500 hidden sm:inline">
                      {formatCompactNumber(song.playCount)} streams
                    </span>
                    <div className="flex items-center gap-1.5 text-teal-400 font-bold font-mono text-sm">
                      <Heart className="w-4 h-4 fill-current" />
                      <span>{formatCompactNumber(song.score)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Most Streamed Tab */}
          {activeTab === 'streams' &&
            topStreams.map((song: any) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-xs"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${getMedalColor(
                        song.rank
                      )}`}
                    >
                      {song.rank}
                    </span>

                    <img
                      src={song.artworkUrl}
                      alt={song.title}
                      className="w-11 h-11 rounded-lg object-cover bg-midnight-800 flex-shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/music/${song.slug || song.id}`}
                        className="text-sm font-semibold text-white hover:text-amber-400 truncate block"
                      >
                        {song.title}
                      </Link>
                      <p className="text-xs text-gray-400">{song.artistName} • {song.languageName}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-amber-400 font-bold font-mono text-sm">
                      {formatCompactNumber(song.score)} Plays
                    </span>
                  </div>
                </div>
              );
            })}

          {/* Top Desi Creators Tab */}
          {activeTab === 'creators' &&
            topCreators.map((creator: any) => (
              <div
                key={creator.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-xs"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${getMedalColor(
                      creator.rank
                    )}`}
                  >
                    {creator.rank}
                  </span>

                  <div className="w-11 h-11 rounded-full overflow-hidden bg-midnight-800 border border-white/10 flex-shrink-0">
                    <img
                      src={creator.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                      alt={creator.creatorName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {creator.creatorName}
                      </h3>
                      {creator.verifiedBadge && <Badge type="approvedCreator" label="Approved" />}
                    </div>
                    <p className="text-xs text-gray-400">
                      {creator.category} • {creator.city}, {creator.state}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-teal-400 font-bold font-mono text-sm">
                    {formatCompactNumber(creator.score)} Valid Likes
                  </span>
                  <p className="text-[11px] text-gray-500">
                    {formatCompactNumber(creator.followersCount || 0)} followers
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
