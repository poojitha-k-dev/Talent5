'use client';

import React from 'react';

export const SongRowSkeleton: React.FC = () => (
  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl animate-pulse">
    <div className="flex items-center gap-3.5 flex-1">
      <div className="w-7 h-4 bg-black/10 dark:bg-white/10 rounded" />
      <div className="w-11 h-11 bg-black/10 dark:bg-white/10 rounded-xl" />
      <div className="space-y-2 flex-1 max-w-xs">
        <div className="h-3.5 bg-black/10 dark:bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-black/10 dark:bg-white/5 rounded w-1/2" />
      </div>
    </div>
    <div className="w-10 h-3 bg-black/10 dark:bg-white/5 rounded" />
  </div>
);

export const TrackCardSkeleton: React.FC = () => (
  <div className="flex flex-col p-3 rounded-2xl bg-white/40 dark:bg-midnight-900/40 border border-black/5 dark:border-white/5 animate-pulse">
    <div className="aspect-square w-full rounded-xl bg-black/10 dark:bg-white/10 mb-3" />
    <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-3/4 mb-2" />
    <div className="h-3 bg-black/10 dark:bg-white/5 rounded w-1/2" />
  </div>
);

export const ArtistCardSkeleton: React.FC = () => (
  <div className="flex flex-col items-center text-center p-4 rounded-3xl bg-white/40 dark:bg-midnight-900/40 border border-black/5 dark:border-white/5 animate-pulse">
    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-black/10 dark:bg-white/10 mb-3.5" />
    <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-24 mb-2" />
    <div className="h-3 bg-black/10 dark:bg-white/5 rounded w-16 mb-3" />
    <div className="w-full h-7 bg-black/10 dark:bg-white/5 rounded-full" />
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="relative rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 bg-black/5 dark:bg-midnight-900/50 p-6 sm:p-10 animate-pulse">
    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex-1 space-y-4 w-full">
        <div className="h-3 w-28 bg-amber-500/20 rounded-full" />
        <div className="h-8 sm:h-10 bg-black/10 dark:bg-white/10 rounded-xl w-3/4" />
        <div className="h-4 bg-black/10 dark:bg-white/5 rounded w-1/2" />
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-28 bg-amber-500/30 rounded-full" />
          <div className="h-10 w-32 bg-black/10 dark:bg-white/10 rounded-full" />
        </div>
      </div>
      <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl bg-black/10 dark:bg-white/10 flex-shrink-0" />
    </div>
  </div>
);
