'use client';

import React from 'react';
import { Play, Pause, Disc3, Sparkles, Activity } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

interface VinylTurntableProps {
  track?: {
    id: string;
    title: string;
    artistName: string;
    artworkUrl: string;
    audioUrl: string;
    genre?: string;
  };
}

export const VinylTurntableShowcase: React.FC<VinylTurntableProps> = ({
  track = {
    id: 'd0000000-0000-0000-0000-000000000003',
    title: 'Desi Cypher Anthem',
    artistName: 'DJ Shera ft. Young Veer',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
    audioUrl: 'https://cdn.freesound.org/previews/665/665183_11861866-lq.mp3',
    genre: 'Desi Hip-Hop',
  },
}) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const isThisPlaying = currentSong?.id === track.id && isPlaying;

  const handleToggle = () => {
    if (currentSong?.id === track.id) {
      togglePlay();
      return;
    }
    playSong({
      id: track.id,
      title: track.title,
      artistName: track.artistName,
      audioUrl: track.audioUrl,
      artworkUrl: track.artworkUrl,
      durationSeconds: 180,
    } as any);
  };

  return (
    <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/90 via-slate-50/90 to-amber-50/40 dark:from-midnight-900/90 dark:via-midnight-950/90 dark:to-midnight-950 border border-amber-500/20 dark:border-white/10 backdrop-blur-xl shadow-card flex flex-col md:flex-row items-center justify-between gap-8 transition-all">
      {/* Vinyl Turntable Unit */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-gradient-to-br from-slate-900 to-black p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-700/50 flex items-center justify-center flex-shrink-0">
        {/* Platter Rim */}
        <div className="relative w-full h-full rounded-full bg-neutral-950 p-2 flex items-center justify-center border border-neutral-800 shadow-inner">
          {/* Vinyl Record Disc */}
          <div
            className={`relative w-full h-full rounded-full bg-black shadow-[inset_0_0_30px_rgba(255,255,255,0.05)] flex items-center justify-center transition-transform ${
              isThisPlaying ? 'animate-vinyl-spin' : ''
            }`}
            style={{
              backgroundImage:
                'radial-gradient(circle, transparent 28%, rgba(255,255,255,0.04) 29%, transparent 30%, rgba(255,255,255,0.04) 35%, transparent 36%, rgba(255,255,255,0.03) 45%, transparent 46%, rgba(255,255,255,0.05) 55%, transparent 56%, rgba(255,255,255,0.04) 65%, transparent 66%, rgba(255,255,255,0.03) 80%, transparent 81%)',
            }}
          >
            {/* Glossy Grooves Reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none" />

            {/* Center Label with Artwork */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500/80 shadow-md">
              <img
                src={track.artworkUrl}
                alt={track.title}
                className="w-full h-full object-cover"
              />
              {/* Spindle Hole */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black border border-white/50" />
            </div>
          </div>

          {/* Tonearm & Stylus */}
          <div
            className={`absolute top-2 right-2 w-20 h-32 origin-top-right transition-transform duration-700 pointer-events-none ${
              isThisPlaying ? 'rotate-[26deg]' : 'rotate-[2deg]'
            }`}
          >
            {/* Pivot Base */}
            <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-gradient-to-b from-neutral-300 to-neutral-600 shadow-md border border-neutral-400" />
            {/* Arm Shaft */}
            <div className="absolute top-3 right-2.5 w-1 h-28 bg-gradient-to-b from-neutral-200 via-neutral-400 to-neutral-300 rounded-full shadow-sm" />
            {/* Headshell & Cartridge */}
            <div className="absolute bottom-0 left-0 w-4 h-6 rounded bg-amber-500 shadow-saffronGlow border border-amber-300" />
          </div>
        </div>
      </div>

      {/* Turntable Info & Play Controls */}
      <div className="flex-1 space-y-4 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-bold">
          <Activity className="w-3.5 h-3.5" />
          <span>Analog Soundstage • Hi-Res 24-bit Desi Master</span>
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
            {track.genre || 'Desi Original'}
          </span>
          <h3 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
            {track.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
            By <span className="font-semibold text-slate-900 dark:text-gray-200">{track.artistName}</span>
          </p>
        </div>

        {/* Live Audio Equalizer Indicators */}
        <div className="p-3 rounded-2xl bg-white/60 dark:bg-midnight-950/60 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Disc3 className={`w-5 h-5 text-amber-500 ${isThisPlaying ? 'animate-spin' : ''}`} />
            <div className="text-xs">
              <p className="font-bold text-slate-800 dark:text-gray-200">
                {isThisPlaying ? 'Turntable Spinning at 33 ⅓ RPM' : 'Turntable Cue Ready'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-gray-400">
                Direct Indian master tape transfer • Uncompressed
              </p>
            </div>
          </div>

          <div className="flex items-end gap-1 h-5">
            <div className={`w-1 bg-amber-500 rounded-full ${isThisPlaying ? 'animate-wave-1' : 'h-1.5'}`} />
            <div className={`w-1 bg-teal-500 rounded-full ${isThisPlaying ? 'animate-wave-2' : 'h-3'}`} />
            <div className={`w-1 bg-amber-400 rounded-full ${isThisPlaying ? 'animate-wave-3' : 'h-2'}`} />
            <div className={`w-1 bg-rose-500 rounded-full ${isThisPlaying ? 'animate-wave-4' : 'h-1.5'}`} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleToggle}
            className="py-3 px-6 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-saffronGlow transition-transform active:scale-95"
          >
            {isThisPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Turntable</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Drop The Needle & Play</span>
              </>
            )}
          </button>

          <span className="text-xs font-mono text-slate-500 dark:text-gray-400 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            FLAC / 96kHz
          </span>
        </div>
      </div>
    </div>
  );
};
