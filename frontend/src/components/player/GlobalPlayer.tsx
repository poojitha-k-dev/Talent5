'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  FileText,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { formatDuration } from '@talent5/utils';
import { LyricsDrawer } from './LyricsDrawer';
import { QueueDrawer } from './QueueDrawer';

export const GlobalPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    seek,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setIsQueueOpen,
    setIsLyricsOpen,
  } = useAudio();

  const { user, token } = useAuth();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  // Sync like count when current song changes
  React.useEffect(() => {
    if (currentSong) {
      setLikeCount(Number(currentSong.validLikesCount || currentSong.rawLikesCount || 0));
      setIsLiked(false);
    }
  }, [currentSong]);

  const handleLike = async () => {
    if (!currentSong) return;
    if (!user || !token) {
      alert('Please log in to like this track and support the creator!');
      return;
    }

    try {
      const res = await fetch('/api/v1/social/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: 'SONG',
          targetId: currentSong.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsLiked(!isLiked);
        setLikeCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch (e) {
      console.error('Like failed', e);
    }
  };

  if (!currentSong) return null;

  const effectiveDuration = duration > 0 ? duration : (currentSong.durationSeconds || 0);
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <>
      <aside aria-label="Persistent Audio Player" className="fixed bottom-[56px] lg:bottom-0 left-0 right-0 z-40 bg-[#f8f6f1] dark:bg-[#0c0e15] border-t border-amber-500/20 dark:border-white/10 px-4 sm:px-6 py-2.5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* 1. Track Info */}
          <div className="flex items-center gap-3 w-full sm:w-1/4 min-w-0">
            <Link
              href={`/song/${currentSong.id}`}
              className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-midnight-800 flex-shrink-0 shadow-md block group/art"
              title="Open Track Page"
            >
              {currentSong.artworkUrl ? (
                <img
                  src={currentSong.artworkUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover group-hover/art:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-500 font-display font-bold text-lg">
                  T5
                </div>
              )}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                  <div className="w-0.5 bg-amber-400 rounded-full animate-wave-1" />
                  <div className="w-0.5 bg-amber-400 rounded-full animate-wave-2" />
                  <div className="w-0.5 bg-amber-400 rounded-full animate-wave-3" />
                  <div className="w-0.5 bg-amber-400 rounded-full animate-wave-4" />
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/song/${currentSong.id}`}
                  className="text-sm font-semibold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 truncate block transition-colors"
                >
                  {currentSong.title}
                </Link>
                <span
                  title="Verified Rights Cleared"
                  className="flex items-center text-emerald-600 dark:text-emerald-400 flex-shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <Link
                href={`/artist/${currentSong.artistId}`}
                className="text-xs text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:underline truncate block"
              >
                {currentSong.artistName || 'Talent5 Artist'}
              </Link>
            </div>

            <button
              onClick={handleLike}
              title="Like & Support Creator"
              className={`p-2 rounded-full transition-all flex items-center gap-1 flex-shrink-0 ${
                isLiked ? 'text-rose-500' : 'text-slate-600 hover:text-rose-500 dark:text-gray-300 dark:hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
              <span className="text-[10px] font-bold">{likeCount > 0 ? likeCount : ''}</span>
            </button>

            {/* Prominent Lyrics button visible on all screen sizes */}
            <button
              onClick={() => setIsLyricsOpen(true)}
              title="Open Synchronized Lyrics"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-600 dark:text-amber-300 font-bold text-xs transition-all flex-shrink-0 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lyrics</span>
            </button>
          </div>

          {/* 2. Audio Transport Controls & Scrubber */}
          <div className="flex flex-col items-center w-full sm:w-2/4 max-w-xl">
            <div className="flex items-center gap-4 mb-1">
              <button
                onClick={toggleShuffle}
                title="Shuffle"
                className={`p-1.5 transition-colors ${
                  isShuffle ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={prevTrack}
                title="Previous Track"
                className="p-1.5 text-slate-700 hover:text-slate-950 dark:text-gray-200 dark:hover:text-white transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 flex items-center justify-center text-midnight-950 font-extrabold shadow-saffronGlow transition-transform active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                title="Next Track"
                className="p-1.5 text-slate-700 hover:text-slate-950 dark:text-gray-200 dark:hover:text-white transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={toggleRepeat}
                title={`Repeat: ${repeatMode}`}
                className={`p-1.5 transition-colors ${
                  repeatMode !== 'off' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Seek Bar */}
            <div className="w-full flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium select-none">
              <span className="w-9 text-right font-mono font-semibold">{formatDuration(currentTime)}</span>
              <div className="flex-1 relative flex items-center group cursor-pointer py-1">
                <div className="w-full h-1.5 bg-slate-300 dark:bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={effectiveDuration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <span className="w-9 font-mono font-semibold">{formatDuration(effectiveDuration)}</span>
            </div>
          </div>

          {/* 3. Volume & Features (Lyrics, Queue) */}
          <div className="hidden sm:flex items-center justify-end gap-3 w-1/4">
            <button
              onClick={() => setIsQueueOpen(true)}
              title="Play Queue"
              className="p-2 text-slate-600 hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-slate-300 dark:bg-white/25 accent-amber-500 rounded-full cursor-pointer"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Global Lyrics & Queue Drawers */}
      <LyricsDrawer />
      <QueueDrawer />
    </>
  );
};
