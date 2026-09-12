'use client';

import React, { useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

export const LyricsDrawer: React.FC = () => {
  const { isLyricsOpen, setIsLyricsOpen, currentSong, currentLyricsLines, activeLyricIndex, seek } =
    useAudio();
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIndex]);

  if (!isLyricsOpen || !currentSong) return null;

  return (
    <div className="fixed inset-0 z-50 bg-midnight-950/95 backdrop-blur-2xl flex flex-col p-6 sm:p-10 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4">
          {currentSong.artworkUrl && (
            <img
              src={currentSong.artworkUrl}
              alt={currentSong.title}
              className="w-14 h-14 rounded-xl object-cover shadow-card"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-white">{currentSong.title}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Synced Lyrics
              </span>
            </div>
            <p className="text-sm text-amber-400/80">{currentSong.artistName || 'Talent5 Artist'}</p>
          </div>
        </div>

        <button
          onClick={() => setIsLyricsOpen(false)}
          className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Lyrics Flow */}
      <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full py-12 flex flex-col items-center space-y-6 text-center">
        {currentLyricsLines.length > 0 ? (
          currentLyricsLines.map((line, idx) => {
            const isActive = idx === activeLyricIndex;
            const isPassed = idx < activeLyricIndex;

            return (
              <div
                key={line.id || idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.startTimeMs / 1000)}
                className={`cursor-pointer transition-all duration-300 text-lg sm:text-2xl font-display font-medium px-4 py-2 rounded-2xl ${
                  isActive
                    ? 'text-amber-400 scale-110 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)] bg-white/5'
                    : isPassed
                    ? 'text-gray-500 hover:text-gray-300'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {line.text}
              </div>
            );
          })
        ) : (
          <div className="my-auto text-center">
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-xl font-bold text-white mb-2">Synchronized Lyrics Not Available</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Talent5 ensures all lyrics are verified and rights-cleared. Synchronized lyrics for this track will be added shortly by our verified editors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
