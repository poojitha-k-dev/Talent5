'use client';

import React from 'react';
import { useAudio } from '@/context/AudioContext';

interface SoundMandalaProps {
  auraColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SoundMandalaVisualizer: React.FC<SoundMandalaProps> = ({
  auraColor = 'from-amber-500/20 via-rose-500/15 to-teal-500/20',
  size = 'md',
}) => {
  const { isPlaying } = useAudio();

  const sargamNotes = [
    { note: 'सा', en: 'Sa', deg: '0deg' },
    { note: 'रे', en: 'Re', deg: '51.4deg' },
    { note: 'ग', en: 'Ga', deg: '102.8deg' },
    { note: 'म', en: 'Ma', deg: '154.2deg' },
    { note: 'प', en: 'Pa', deg: '205.6deg' },
    { note: 'ध', en: 'Dha', deg: '257deg' },
    { note: 'नि', en: 'Ni', deg: '308.4deg' },
  ];

  const sizeClasses = {
    sm: 'w-48 h-48 sm:w-64 sm:h-64',
    md: 'w-72 h-72 sm:w-96 sm:h-96',
    lg: 'w-80 h-80 sm:w-[480px] sm:h-[480px]',
  }[size];

  return (
    <div className={`relative ${sizeClasses} flex items-center justify-center select-none pointer-events-none`}>
      {/* 1. Pulsing Ambient Aura */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${auraColor} blur-3xl transition-all duration-1000 ${
          isPlaying ? 'opacity-80 scale-110' : 'opacity-40 scale-95'
        }`}
      />

      {/* 2. Concentric Geometric Sacred Rings */}
      <div
        className={`absolute inset-0 rounded-full border border-amber-500/20 dark:border-amber-400/20 ${
          isPlaying ? 'animate-[spin_60s_linear_infinite]' : ''
        }`}
      />
      <div
        className={`absolute inset-6 rounded-full border border-dashed border-teal-500/30 dark:border-teal-400/20 ${
          isPlaying ? 'animate-[spin_45s_linear_infinite_reverse]' : ''
        }`}
      />
      <div
        className={`absolute inset-14 rounded-full border border-amber-500/25 dark:border-amber-400/15 ${
          isPlaying ? 'animate-[spin_30s_linear_infinite]' : ''
        }`}
      />
      <div className="absolute inset-24 rounded-full border border-rose-500/20 dark:border-rose-400/20" />

      {/* 3. Sargam Notes Floating around circumference */}
      <div
        className={`absolute inset-0 rounded-full transition-transform duration-700 ${
          isPlaying ? 'animate-[spin_40s_linear_infinite]' : ''
        }`}
      >
        {sargamNotes.map((item, idx) => (
          <div
            key={idx}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
            style={{
              transform: `rotate(${item.deg}) translateY(-135px) rotate(-${item.deg})`,
            }}
          >
            <span className="w-8 h-8 rounded-full bg-white/80 dark:bg-midnight-900/80 backdrop-blur-md border border-amber-500/30 flex items-center justify-center font-display font-black text-xs text-amber-600 dark:text-amber-400 shadow-sm">
              {item.note}
            </span>
          </div>
        ))}
      </div>

      {/* 4. Central Equalizer Core */}
      <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-teal-400 p-0.5 shadow-saffronGlow">
        <div className="w-full h-full rounded-full bg-white dark:bg-midnight-950 flex flex-col items-center justify-center gap-1">
          <div className="flex items-end gap-1 h-6">
            <div className={`w-1 bg-amber-500 rounded-full ${isPlaying ? 'animate-wave-1' : 'h-2'}`} />
            <div className={`w-1 bg-teal-500 rounded-full ${isPlaying ? 'animate-wave-2' : 'h-3'}`} />
            <div className={`w-1 bg-amber-400 rounded-full ${isPlaying ? 'animate-wave-3' : 'h-4'}`} />
            <div className={`w-1 bg-rose-500 rounded-full ${isPlaying ? 'animate-wave-4' : 'h-2'}`} />
            <div className={`w-1 bg-teal-400 rounded-full ${isPlaying ? 'animate-wave-2' : 'h-3'}`} />
          </div>
          <span className="text-[9px] font-extrabold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
            {isPlaying ? 'Live Sargam' : 'Talent5'}
          </span>
        </div>
      </div>
    </div>
  );
};
