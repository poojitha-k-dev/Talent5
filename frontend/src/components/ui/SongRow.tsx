'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Pause, Heart, Bookmark, MoreHorizontal } from 'lucide-react';
import { Song } from '@talent5/types';
import { useAudio } from '@/context/AudioContext';
import { formatDuration } from '@talent5/utils';

interface SongRowProps {
  song: Song;
  index?: number;
  showCover?: boolean;
  onLike?: (songId: string) => void;
  isLiked?: boolean;
  onSave?: (songId: string) => void;
  isSaved?: boolean;
  playlistContext?: Song[];
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  showCover = true,
  onLike,
  isLiked = false,
  onSave,
  isSaved = false,
  playlistContext,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const isCurrent = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlistContext);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer ${
        isCurrent
          ? 'bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20'
          : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
      }`}
    >
      {/* Left: Index / Play Icon & Track Metadata */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Track Index or Animated Equalizer */}
        <div className="w-7 text-center flex-shrink-0 flex items-center justify-center">
          {isCurrentlyPlaying ? (
            <div className="flex items-end justify-center gap-0.5 h-4 w-4">
              <span className="w-1 bg-amber-500 h-full animate-wave-pulse rounded-full" />
              <span className="w-1 bg-amber-400 h-2/3 animate-wave-pulse rounded-full [animation-delay:0.2s]" />
              <span className="w-1 bg-amber-500 h-4/5 animate-wave-pulse rounded-full [animation-delay:0.4s]" />
            </div>
          ) : (
            <div className="relative">
              <span
                className={`text-xs font-medium ${
                  isCurrent ? 'text-amber-500 font-bold' : 'text-gray-400 group-hover:opacity-0'
                }`}
              >
                {typeof index === 'number' ? (index + 1 < 10 ? `0${index + 1}` : index + 1) : ''}
              </span>
              <Play
                className={`w-4 h-4 text-amber-500 absolute inset-0 m-auto transition-opacity ${
                  isCurrent
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
                fill="currentColor"
              />
            </div>
          )}
        </div>

        {/* Thumbnail Cover */}
        {showCover && (
          <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-midnight-800 border border-white/10 shadow-sm">
            <img
              src={song.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
              alt={song.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        {/* Title & Artist */}
        <div className="min-w-0 flex-1 pr-2">
          <Link
            href={`/song/${song.id}`}
            onClick={(e) => e.stopPropagation()}
            className={`block truncate text-sm font-semibold tracking-tight transition-colors ${
              isCurrent
                ? 'text-amber-500 dark:text-amber-400'
                : 'text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400'
            }`}
          >
            {song.title}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            <Link
              href={`/artist/${song.artistId}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline hover:text-slate-700 dark:hover:text-gray-200 truncate"
            >
              {song.artistName || 'Unknown Artist'}
            </Link>
            {song.languageName && (
              <>
                <span>•</span>
                <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {song.languageName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions & Duration */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Like Button */}
        {onLike && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLike(song.id);
            }}
            className={`p-1.5 rounded-full transition-colors ${
              isLiked
                ? 'text-rose-500 fill-rose-500'
                : 'text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 sm:opacity-100'
            }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Save / Bookmark Button */}
        {onSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSave(song.id);
            }}
            className={`p-1.5 rounded-full transition-colors ${
              isSaved
                ? 'text-amber-500 fill-amber-500'
                : 'text-gray-400 hover:text-amber-500 opacity-0 group-hover:opacity-100'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save to Library'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Duration */}
        <span className="text-xs text-gray-400 font-mono tracking-tight w-11 text-right">
          {formatDuration(song.durationSeconds || 0)}
        </span>
      </div>
    </div>
  );
};
