'use client';

import React, { useState } from 'react';
import { Play, Pause, Sparkles, Volume2, Clock, Disc3 } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

export interface RagaMood {
  id: string;
  name: string;
  devanagari: string;
  prahar: string;
  timeSlot: string;
  emotion: string;
  instruments: string[];
  colorGradient: string;
  lightBg: string;
  darkBg: string;
  sampleSong: {
    id: string;
    title: string;
    artistName: string;
    audioUrl: string;
    artworkUrl: string;
    durationSeconds: number;
  };
}

const RAGAS: RagaMood[] = [
  {
    id: 'bhairav',
    name: 'Raag Bhairav',
    devanagari: 'राग भैरव',
    prahar: 'Pratah Kaal (Dawn)',
    timeSlot: '6:00 AM – 9:00 AM',
    emotion: 'Peace, Devotion & Awakening',
    instruments: ['Tanpura', 'Sitar', 'Bansuri'],
    colorGradient: 'from-amber-500/20 via-orange-500/15 to-yellow-500/20',
    lightBg: 'bg-amber-50 border-amber-200 text-amber-900',
    darkBg: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
    sampleSong: {
      id: 'd0000000-0000-0000-0000-000000000001',
      title: 'Tum Bin Mann Kaha (Morning Dawn Version)',
      artistName: 'Kabir Sen',
      audioUrl: 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3',
      artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
      durationSeconds: 210,
    },
  },
  {
    id: 'megh',
    name: 'Raag Megh',
    devanagari: 'राग मेघ',
    prahar: 'Varsha Ritu (Rain)',
    timeSlot: 'Monsoon Clouds & Storms',
    emotion: 'Ecstasy, Rejuvenation & Monsoon Thunder',
    instruments: ['Sarod', 'Pakhawaj', 'Violin'],
    colorGradient: 'from-teal-500/20 via-cyan-500/15 to-emerald-500/20',
    lightBg: 'bg-teal-50 border-teal-200 text-teal-900',
    darkBg: 'bg-teal-950/40 border-teal-500/30 text-teal-200',
    sampleSong: {
      id: 'd0000000-0000-0000-0000-000000000002',
      title: 'Chennai Rain Raga (Megh Fusion)',
      artistName: 'Meera Swaminathan',
      audioUrl: 'https://cdn.freesound.org/previews/612/612608_11861866-lq.mp3',
      artworkUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400',
      durationSeconds: 250,
    },
  },
  {
    id: 'yaman',
    name: 'Raag Yaman',
    devanagari: 'राग यमन',
    prahar: 'Sandhya Kaal (Dusk)',
    timeSlot: '6:00 PM – 9:00 PM',
    emotion: 'Romance, Longing & Serenades',
    instruments: ['Bansuri', 'Harmonium', 'Tabla'],
    colorGradient: 'from-rose-500/20 via-amber-500/15 to-orange-500/20',
    lightBg: 'bg-rose-50 border-rose-200 text-rose-900',
    darkBg: 'bg-rose-950/40 border-rose-500/30 text-rose-200',
    sampleSong: {
      id: 'd0000000-0000-0000-0000-000000000004',
      title: 'Varanasi Sunset Raga (Acoustic)',
      artistName: 'Pandit Rajesh Sharma',
      audioUrl: 'https://cdn.freesound.org/previews/415/415804_5121236-lq.mp3',
      artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
      durationSeconds: 195,
    },
  },
  {
    id: 'malkauns',
    name: 'Raag Malkauns',
    devanagari: 'राग मालकौंस',
    prahar: 'Nishitha (Midnight)',
    timeSlot: '12:00 AM – 3:00 AM',
    emotion: 'Deep Trance, Cosmic Meditation',
    instruments: ['Surbahar', 'Veena', 'Ghatam'],
    colorGradient: 'from-purple-500/20 via-indigo-500/15 to-violet-500/20',
    lightBg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    darkBg: 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200',
    sampleSong: {
      id: 'd0000000-0000-0000-0000-000000000005',
      title: 'Midnight Darbar Echoes',
      artistName: 'Zubair Khan Ensemble',
      audioUrl: 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3',
      artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
      durationSeconds: 270,
    },
  },
  {
    id: 'bhairavi',
    name: 'Raag Bhairavi',
    devanagari: 'राग भैरवी',
    prahar: 'Sarva Kaalik (Eternal)',
    timeSlot: 'Festive & Culminating Moments',
    emotion: 'Joyous Celebration & Desi Euphoria',
    instruments: ['Dholak', 'Shehnai', 'Mandolin'],
    colorGradient: 'from-pink-500/20 via-rose-500/15 to-amber-500/20',
    lightBg: 'bg-pink-50 border-pink-200 text-pink-900',
    darkBg: 'bg-pink-950/40 border-pink-500/30 text-pink-200',
    sampleSong: {
      id: 'd0000000-0000-0000-0000-000000000003',
      title: 'Desi Cypher Anthem (Bhairavi Trap)',
      artistName: 'DJ Shera ft. Young Veer',
      audioUrl: 'https://cdn.freesound.org/previews/665/665183_11861866-lq.mp3',
      artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
      durationSeconds: 165,
    },
  },
];

export const RagaSoundscapeExplorer: React.FC = () => {
  const [selectedRaga, setSelectedRaga] = useState<RagaMood>(RAGAS[0]);
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();

  const isCurrentPlaying = currentSong?.id === selectedRaga.sampleSong.id && isPlaying;

  const handlePlay = (raga: RagaMood) => {
    if (currentSong?.id === raga.sampleSong.id) {
      togglePlay();
      return;
    }
    playSong(raga.sampleSong as any);
  };

  return (
    <div className="w-full relative rounded-3xl overflow-hidden border border-amber-500/20 dark:border-white/10 bg-gradient-to-b from-white/90 via-slate-50/80 to-amber-50/50 dark:from-midnight-900/80 dark:via-midnight-950/80 dark:to-midnight-950 p-6 sm:p-8 backdrop-blur-xl shadow-card transition-all duration-500">
      {/* Dynamic Background Glow */}
      <div
        className={`absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-tr ${selectedRaga.colorGradient} blur-3xl opacity-60 pointer-events-none transition-all duration-700`}
      />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Desi Prahar & Sonic Mood Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
              Explore Music by Ancient & Modern Ragas
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mt-1">
              In Indian classical and indie music, every hour of the day possesses a distinctive sonic emotion.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-white/5 px-3 py-1.5 rounded-full border border-amber-500/20">
              5 Classical Prahars
            </span>
          </div>
        </div>

        {/* Raga Selector Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {RAGAS.map((raga) => {
            const isSelected = selectedRaga.id === raga.id;
            return (
              <button
                key={raga.id}
                onClick={() => setSelectedRaga(raga)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex-shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-saffronGlow scale-105'
                    : 'bg-white/60 dark:bg-midnight-800/60 hover:bg-white dark:hover:bg-midnight-700 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-gray-300'
                }`}
              >
                <span>{raga.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950 font-mono' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400'}`}>
                  {raga.devanagari}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Raga Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Left: Metadata */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white/70 dark:bg-midnight-950/60 border border-slate-200/80 dark:border-white/5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {selectedRaga.prahar}
                  </span>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
                    {selectedRaga.name} <span className="text-slate-500 dark:text-slate-300 font-semibold">({selectedRaga.devanagari})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-200 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{selectedRaga.timeSlot}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-white/5 border border-amber-500/20 text-xs text-slate-900 dark:text-slate-100 flex items-center gap-3 font-medium">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  <strong className="text-amber-600 dark:text-amber-400 font-bold">Sonic Mood:</strong> {selectedRaga.emotion}
                </span>
              </div>
            </div>

            {/* Acoustic Instruments Tags */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">
                Acoustic Foundations
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedRaga.instruments.map((inst) => (
                  <span
                    key={inst}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-midnight-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10"
                  >
                    ✦ {inst}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Featured Indie Master Preview */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 via-white/80 to-teal-500/10 dark:from-amber-950/30 dark:via-midnight-900 dark:to-midnight-950 border border-amber-500/30 dark:border-white/10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg group">
              <img
                src={selectedRaga.sampleSong.artworkUrl}
                alt={selectedRaga.sampleSong.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <button
                onClick={() => handlePlay(selectedRaga)}
                className="absolute inset-0 bg-slate-950/40 hover:bg-slate-950/50 flex items-center justify-center transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                  {isCurrentPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                </div>
              </button>
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {selectedRaga.sampleSong.title}
              </h4>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate mt-0.5">
                {selectedRaga.sampleSong.artistName}
              </p>
            </div>

            <button
              onClick={() => handlePlay(selectedRaga)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isCurrentPlaying ? 'Now Playing Raga' : 'Tune Into Raga'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
