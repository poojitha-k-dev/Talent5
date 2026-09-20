'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  X,
  Sparkles,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Mic,
  ListMusic,
  Tv,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { formatDuration } from '@talent5/utils';

export const LyricsDrawer: React.FC = () => {
  const {
    isLyricsOpen,
    setIsLyricsOpen,
    currentSong,
    currentLyricsLines,
    activeLyricIndex,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    nextTrack,
    prevTrack,
    volume,
    isMuted,
    toggleMute,
    setVolume,
  } = useAudio();

  const [drawerMode, setDrawerMode] = useState<'stream' | 'teleprompter'>('stream');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  const handleCopyLyrics = () => {
    if (!currentLyricsLines || currentLyricsLines.length === 0) return;
    const text = currentLyricsLines.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Auto-scroll to active lyric line whenever index changes or drawer opens
  useEffect(() => {
    if (isLyricsOpen && activeLineRef.current) {
      const timer = setTimeout(() => {
        activeLineRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLyricsOpen, activeLyricIndex]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLyricsOpen) {
        setIsLyricsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLyricsOpen, setIsLyricsOpen]);

  if (!isLyricsOpen || !currentSong) return null;

  const effectiveDuration = duration > 0 ? duration : (currentSong.durationSeconds || 0);
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-midnight-950/98 backdrop-blur-3xl flex flex-col p-4 sm:p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 max-w-4xl mx-auto w-full flex-shrink-0 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {currentSong.artworkUrl ? (
            <img
              src={currentSong.artworkUrl}
              alt={currentSong.title}
              className="w-14 h-14 rounded-2xl object-cover shadow-card border border-white/10"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/30">
              T5
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white drop-shadow-sm">
                {currentSong.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Synced Lyrics
              </span>
              {currentSong.languageName && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                  {currentSong.languageName}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-amber-400 mt-0.5">
              {currentSong.artistName || 'Talent5 Artist'}
            </p>
          </div>
        </div>

        {/* Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setDrawerMode('stream')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                drawerMode === 'stream'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Full Lyrics Stream"
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stream</span>
            </button>
            <button
              onClick={() => setDrawerMode('teleprompter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                drawerMode === 'teleprompter'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Focus Teleprompter"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Teleprompter</span>
            </button>
          </div>

          {/* Copy Lyrics */}
          <button
            onClick={handleCopyLyrics}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/15 transition-colors border border-white/10 text-xs flex items-center gap-1.5"
            title="Copy all lyrics to clipboard"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden md:inline">{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Karaoke Link */}
          <Link
            href={`/karaoke?song=${currentSong.id}`}
            onClick={() => setIsLyricsOpen(false)}
            className="p-2 text-amber-300 hover:text-amber-200 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 transition-colors border border-amber-500/30 text-xs flex items-center gap-1.5 font-bold"
            title="Open in AI Karaoke Studio"
          >
            <Mic className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Karaoke Lab</span>
          </Link>

          {/* Close button */}
          <button
            onClick={() => setIsLyricsOpen(false)}
            className="p-2.5 text-slate-300 hover:text-white rounded-full bg-white/5 hover:bg-white/15 transition-colors border border-white/10"
            title="Close Lyrics (Esc)"
            aria-label="Close Lyrics"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Subtitle helper & Line progress indicator */}
      <div className="max-w-4xl mx-auto w-full pt-2.5 pb-1 flex items-center justify-between text-xs text-amber-300/80 font-medium">
        <span>Click any lyric line to jump audio to that exact moment</span>
        {currentLyricsLines.length > 0 && activeLyricIndex >= 0 && (
          <span className="font-mono text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
            Line <strong className="text-amber-300 font-bold">{activeLyricIndex + 1}</strong> of {currentLyricsLines.length}
          </span>
        )}
      </div>

      {/* Lyrics Body */}
      {drawerMode === 'teleprompter' ? (
        /* Teleprompter Focus Mode */
        <div className="flex-1 max-w-4xl mx-auto w-full py-8 px-4 flex flex-col items-center justify-center text-center space-y-8 select-none">
          {currentLyricsLines.length > 0 ? (
            (() => {
              const currentLine = currentLyricsLines[activeLyricIndex] || currentLyricsLines[0];
              const prevLine = activeLyricIndex > 0 ? currentLyricsLines[activeLyricIndex - 1] : null;
              const nextLine = activeLyricIndex < currentLyricsLines.length - 1 ? currentLyricsLines[activeLyricIndex + 1] : null;

              return (
                <div className="space-y-8 w-full max-w-3xl">
                  {/* Previous line */}
                  <div
                    onClick={() => prevLine && seek(prevLine.startTimeMs / 1000)}
                    className="cursor-pointer text-lg sm:text-xl md:text-2xl text-slate-400 font-medium opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {prevLine ? prevLine.text : '• • •'}
                  </div>

                  {/* Active glowing line */}
                  <div className="relative py-6 px-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-500/25 to-amber-500/20 border-2 border-amber-400/50 shadow-[0_0_50px_rgba(245,158,11,0.35)] transform scale-105 transition-all">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-display text-amber-300 drop-shadow-[0_2px_15px_rgba(245,158,11,0.5)] leading-tight">
                      {currentLine.text}
                    </div>
                    <div className="mt-3 text-xs font-mono text-amber-200/90 font-semibold tracking-wider uppercase">
                      Now Singing • {formatDuration(Math.floor(currentLine.startTimeMs / 1000))}
                    </div>
                  </div>

                  {/* Upcoming next line */}
                  <div
                    onClick={() => nextLine && seek(nextLine.startTimeMs / 1000)}
                    className="cursor-pointer space-y-1 group"
                  >
                    <div className="text-xs uppercase tracking-widest text-amber-400/70 font-bold">
                      Upcoming Next
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl text-slate-200 font-medium group-hover:text-white transition-colors">
                      {nextLine ? nextLine.text : '• Fin •'}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4 opacity-80 animate-pulse" />
              <h3 className="text-2xl font-bold text-white mb-2">Teleprompter Synchronizing</h3>
            </div>
          )}
        </div>
      ) : (
        /* Full Lyrics Stream Mode */
        <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full py-6 px-4 flex flex-col items-center space-y-3 text-center">
          {currentLyricsLines.length > 0 ? (
            currentLyricsLines.map((line, idx) => {
              const isActive = idx === activeLyricIndex;
              const isPassed = idx < activeLyricIndex;

              return (
                <div
                  key={line.id || idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seek(line.startTimeMs / 1000)}
                  className={`cursor-pointer transition-all duration-300 text-base sm:text-xl md:text-2xl font-display px-6 py-3 rounded-2xl max-w-2xl w-full select-none flex items-center justify-between gap-4 ${
                    isActive
                      ? 'text-amber-300 font-extrabold scale-105 bg-amber-500/20 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.35)]'
                      : isPassed
                      ? 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
                      : 'text-slate-200 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <span className="flex-1 text-center">{line.text}</span>
                  <span className="text-xs font-mono opacity-50 flex-shrink-0">
                    {formatDuration(Math.floor(line.startTimeMs / 1000))}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="my-auto text-center py-16">
              <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4 opacity-80 animate-pulse" />
              <h3 className="text-2xl font-bold text-white mb-2">Synchronized Lyrics Loading</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Synchronizing lyrics stream for <span className="text-amber-300 font-semibold">{currentSong.title}</span>...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Integrated In-Drawer Transport Bar */}
      <div className="max-w-3xl mx-auto w-full pt-4 border-t border-white/10 flex-shrink-0 flex flex-col gap-3">
        {/* Scrubber */}
        <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
          <span className="w-10 text-right">{formatDuration(currentTime)}</span>
          <div className="flex-1 relative flex items-center group cursor-pointer py-1">
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
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
          <span className="w-10">{formatDuration(effectiveDuration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-white/20 accent-amber-500 rounded-full cursor-pointer hidden sm:block"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={prevTrack}
              className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-midnight-950 flex items-center justify-center font-bold shadow-saffronGlow transition-transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="w-24 text-right">
            <button
              onClick={() => setIsLyricsOpen(false)}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold hover:underline"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
