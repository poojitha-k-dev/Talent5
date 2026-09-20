'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Users, Music } from 'lucide-react';
import { Artist } from '@talent5/types';
import { formatCompactNumber } from '@talent5/utils';

interface ArtistCardProps {
  artist: Artist;
  onFollow?: (artistId: string) => void;
  isFollowing?: boolean;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  onFollow,
  isFollowing = false,
}) => {
  return (
    <div className="group relative flex flex-col items-center text-center p-4 rounded-3xl bg-white/50 dark:bg-midnight-900/50 border border-black/5 dark:border-white/5 hover:border-amber-500/30 dark:hover:border-amber-500/30 hover:bg-white/80 dark:hover:bg-midnight-800/80 transition-all duration-300 shadow-sm hover:shadow-card">
      {/* Circular Avatar */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-3.5 border-2 border-amber-500/20 group-hover:border-amber-500 transition-colors shadow-md bg-midnight-800">
        <img
          src={artist.avatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {artist.isVerified && (
          <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-midnight-950 flex items-center justify-center text-teal-400 shadow-md">
            <CheckCircle2 className="w-4 h-4 fill-teal-400 text-midnight-950" />
          </div>
        )}
      </div>

      {/* Name & Title */}
      <Link
        href={`/artist/${artist.id}`}
        className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate max-w-full"
      >
        {artist.name}
      </Link>

      {/* Followers or Category */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
        <Users className="w-3.5 h-3.5" />
        <span>{formatCompactNumber(artist.followersCount || 0)} followers</span>
      </div>

      {/* Languages Pills */}
      {artist.languages && artist.languages.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
          {artist.languages.slice(0, 2).map((lang, idx) => (
            <span
              key={idx}
              className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium"
            >
              {lang}
            </span>
          ))}
        </div>
      )}

      {/* Follow / View Button */}
      <div className="mt-3.5 w-full">
        {onFollow ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onFollow(artist.id);
            }}
            className={`w-full py-1.5 px-3 rounded-full text-xs font-semibold transition-all duration-200 ${
              isFollowing
                ? 'bg-white/10 dark:bg-white/10 text-gray-300 border border-white/10 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30'
                : 'bg-amber-500 hover:bg-amber-400 text-midnight-950 shadow-saffronGlow'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        ) : (
          <Link
            href={`/artist/${artist.id}`}
            className="inline-block w-full py-1.5 px-3 rounded-full text-xs font-semibold text-center bg-black/5 dark:bg-white/10 text-slate-700 dark:text-gray-200 hover:bg-amber-500 hover:text-midnight-950 transition-colors"
          >
            View Artist
          </Link>
        )}
      </div>
    </div>
  );
};
