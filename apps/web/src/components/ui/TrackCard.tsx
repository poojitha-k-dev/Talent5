'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Pause } from 'lucide-react';
import { Song } from '@talent5/types';
import { useAudio } from '@/context/AudioContext';
import { formatDuration } from '@talent5/utils';

interface TrackCardProps {
  song: Song;
  playlistContext?: Song[];
  showLanguageBadge?: boolean;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  song,
  playlistContext,
  showLanguageBadge = true,
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const isCurrent = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlistContext);
    }
  };

  return (
    <div className="group relative flex flex-col p-3 rounded-2xl bg-white/60 dark:bg-midnight-900/60 border border-black/5 dark:border-white/5 hover:border-amber-500/30 dark:hover:border-amber-500/30 hover:bg-white/90 dark:hover:bg-midnight-800/80 transition-all duration-300 shadow-sm hover:shadow-card">
      {/* Artwork with Overlay Play Button */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-midnight-950/20 mb-3 shadow-inner">
        <img
          src={song.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Language Badge */}
        {showLanguageBadge && song.languageName && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-midnight-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
              {song.languageName}
            </span>
          </div>
        )}

        {/* Duration Chip */}
        {song.durationSeconds > 0 && (
          <div className="absolute bottom-2 right-2">
            <span className="px-1.5 py-0.5 text-[10px] font-mono text-white/90 rounded bg-black/60 backdrop-blur-sm">
              {formatDuration(song.durationSeconds)}
            </span>
          </div>
        )}

        {/* Hover / Active Floating Play Button */}
        <button
          type="button"
          onClick={handlePlay}
          className={`absolute bottom-3 left-3 w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-midnight-950 flex items-center justify-center shadow-saffronGlow transition-all duration-300 ${
            isCurrentlyPlaying
              ? 'opacity-100 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
          aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Metadata */}
      <div className="flex flex-col flex-1 min-w-0">
        <Link
          href={`/song/${song.id}`}
          className={`text-sm font-semibold truncate transition-colors ${
            isCurrent
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400'
          }`}
        >
          {song.title}
        </Link>
        <Link
          href={`/artist/${song.artistId}`}
          className="text-xs text-gray-500 dark:text-gray-400 truncate hover:underline hover:text-slate-700 dark:hover:text-gray-200 mt-0.5"
        >
          {song.artistName || 'Artist'}
        </Link>
      </div>
    </div>
  );
};
