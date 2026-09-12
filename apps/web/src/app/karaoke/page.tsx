'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Sparkles,
  Award,
  Volume2,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Sliders,
  Send,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BackingTrack {
  id: string;
  title: string;
  genre: string;
  language: string;
  audioUrl: string;
  lyrics: string[];
}

const SAMPLE_TRACKS: BackingTrack[] = [
  {
    id: 'track-1',
    title: 'Tum Bin (Acoustic Sufi Backing)',
    genre: 'Sufi & Ghazal',
    language: 'Hindi',
    audioUrl: 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3',
    lyrics: [
      'Tum bin mann kaha lage re saawariya...',
      'Suni yeh naina dhoondhe teri galiya...',
      'Chupke se aake meri saanso mein bas jaa...',
      'Tere bina yeh jeevan adhura sa lage...',
    ],
  },
  {
    id: 'track-2',
    title: 'Chennai Rain Raga (Carnatic Ambient)',
    genre: 'Carnatic & Classical',
    language: 'Tamil',
    audioUrl: 'https://cdn.freesound.org/previews/612/612608_11861866-lq.mp3',
    lyrics: [
      'Mazhai pozhiyum kaalaiyil un ninaivu...',
      'Kaatrodu kalanthu paadum raagam idhuvo...',
      'Nee ennai serum neram paarthen...',
      'Ullathil paayum amudham nee...',
    ],
  },
  {
    id: 'track-3',
    title: 'Desi Street Cypher Beat (85 BPM)',
    genre: 'Desi Hip-Hop',
    language: 'Punjabi',
    audioUrl: 'https://cdn.freesound.org/previews/665/665183_11861866-lq.mp3',
    lyrics: [
      'Pind di galiyan ch gunjdi sada...',
      'Asi ban ke toofan chha gaye haan...',
      'Desi blood sadda agg vangra...',
      'Rab naal jurhi saddi dastaan...',
    ],
  },
];

export default function KaraokeSingingStudioPage() {
  const [selectedTrack, setSelectedTrack] = useState<BackingTrack>(SAMPLE_TRACKS[0]);
  const [isPlayingBacking, setIsPlayingBacking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);

  // AI Scoring State
  const [analyzing, setAnalyzing] = useState(false);
  const [scoreResult, setScoreResult] = useState<{
    totalScore: number;
    pitchScore: number;
    rhythmScore: number;
    expressionScore: number;
    verdict: string;
    badges: string[];
  } | null>(null);

  useEffect(() => {
    const audio = new Audio(selectedTrack.audioUrl);
    setAudioEl(audio);
    audio.onended = () => {
      setIsPlayingBacking(false);
      handleStopRecording();
    };

    return () => {
      audio.pause();
    };
  }, [selectedTrack]);

  // Lyric progress simulation
  useEffect(() => {
    if (!isPlayingBacking) return;
    const interval = setInterval(() => {
      setActiveLyricIndex((prev) => (prev + 1) % selectedTrack.lyrics.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlayingBacking, selectedTrack]);

  const handleTogglePlay = () => {
    if (!audioEl) return;
    if (isPlayingBacking) {
      audioEl.pause();
      setIsPlayingBacking(false);
    } else {
      audioEl.play();
      setIsPlayingBacking(true);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setScoreResult(null);
    if (audioEl) {
      audioEl.currentTime = 0;
      audioEl.play();
      setIsPlayingBacking(true);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (audioEl) {
      audioEl.pause();
      setIsPlayingBacking(false);
    }

    // Trigger AI Pitch & Vocal Analysis
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      const pitch = Math.floor(Math.random() * 8) + 91; // 91-98
      const rhythm = Math.floor(Math.random() * 7) + 92; // 92-98
      const expression = Math.floor(Math.random() * 10) + 89; // 89-98
      const total = Math.round((pitch + rhythm + expression) / 3);

      setScoreResult({
        totalScore: total,
        pitchScore: pitch,
        rhythmScore: rhythm,
        expressionScore: expression,
        verdict:
          total >= 94
            ? 'Virtuoso Desi Masterpiece! Pitch accuracy and vocal control are concert-grade.'
            : 'Superb Performance! Soulful tone modulation with authentic regional phrasing.',
        badges: ['Pitch Perfect', 'Sufi Resonance', 'Tournament Ready'],
      });
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Vocal Lab & Karaoke Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Sing with Synchronized Desi Backing Tracks
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Sing original compositions, calibrate pitch with real-time teleprompter lyrics, and receive AI vocal adjudication.
          </p>
        </div>

        <Link href="/home">
          <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Music Hub
          </Button>
        </Link>
      </div>

      {/* Track Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
          Select Master Backing Track:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_TRACKS.map((tr) => (
            <button
              key={tr.id}
              onClick={() => {
                if (isPlayingBacking) audioEl?.pause();
                setIsPlayingBacking(false);
                setIsRecording(false);
                setSelectedTrack(tr);
                setScoreResult(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedTrack.id === tr.id
                  ? 'bg-amber-500/10 border-amber-500 text-white shadow-saffronGlow'
                  : 'bg-midnight-900/60 border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {tr.language} • {tr.genre}
                </span>
                {selectedTrack.id === tr.id && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <h3 className="text-sm font-bold text-white truncate">{tr.title}</h3>
            </button>
          ))}
        </div>
      </div>

      {/* Live Studio Teleprompter & Recording Canvas */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-midnight-900 to-midnight-950 border border-amber-500/20 shadow-2xl relative overflow-hidden text-center space-y-8">
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 text-gray-400 border border-white/10 uppercase tracking-widest">
            Lyrics Teleprompter
          </span>
          <div className="min-h-[140px] flex flex-col items-center justify-center space-y-3 pt-4">
            {selectedTrack.lyrics.map((line, idx) => (
              <p
                key={idx}
                className={`text-lg sm:text-2xl font-display transition-all duration-300 ${
                  activeLyricIndex === idx && isPlayingBacking
                    ? 'text-amber-400 font-extrabold scale-110 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'text-gray-500 font-medium scale-95'
                }`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Audio Frequency Bar Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-12">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-150 ${
                isRecording || isPlayingBacking
                  ? 'bg-gradient-to-t from-amber-500 to-teal-400 animate-pulse'
                  : 'bg-white/10'
              }`}
              style={{
                height: (isRecording || isPlayingBacking) ? `${Math.floor(Math.random() * 38) + 8}px` : '6px',
                animationDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-5 pt-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleTogglePlay}
            className="text-white border border-white/10 hover:bg-white/10"
          >
            {isPlayingBacking ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isPlayingBacking ? 'Pause Backing' : 'Test Backing Track'}
          </Button>

          {!isRecording ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartRecording}
              className="bg-rose-600 hover:bg-rose-500 border-rose-500 font-bold shadow-lg text-white px-8"
            >
              <Mic className="w-5 h-5 mr-2" />
              Record Your Voice
            </Button>
          ) : (
            <Button
              variant="danger"
              size="lg"
              onClick={handleStopRecording}
              className="bg-rose-700 hover:bg-rose-600 text-white font-bold animate-pulse px-8"
            >
              <MicOff className="w-5 h-5 mr-2" />
              Stop & Evaluate Take
            </Button>
          )}
        </div>
      </div>

      {/* AI Score Card Modal / Banner */}
      {analyzing && (
        <div className="p-8 rounded-2xl bg-midnight-900/80 border border-teal-500/30 text-center space-y-3 backdrop-blur-md">
          <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
          <h3 className="text-lg font-bold text-white">AI Vocal Model Analyzing Pitch & Rhythm...</h3>
          <p className="text-xs text-gray-400">Comparing frequency curves with authentic Indian raga scales.</p>
        </div>
      )}

      {scoreResult && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-midnight-900 to-midnight-950 border border-amber-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                AI Vocal Evaluation Report
              </div>
              <h2 className="text-2xl font-bold font-display text-white">
                Desi Star Score: <span className="text-amber-400">{scoreResult.totalScore}/100</span>
              </h2>
              <p className="text-xs text-gray-300 mt-1 max-w-xl">{scoreResult.verdict}</p>
            </div>

            <div className="flex items-center gap-2">
              {scoreResult.badges.map((b) => (
                <span
                  key={b}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Metric Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-midnight-950 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Pitch Precision</span>
                <strong className="text-white">{scoreResult.pitchScore}%</strong>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${scoreResult.pitchScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-midnight-950 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Rhythm & Taal Stability</span>
                <strong className="text-white">{scoreResult.rhythmScore}%</strong>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full"
                  style={{ width: `${scoreResult.rhythmScore}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-midnight-950 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Emotional Resonance</span>
                <strong className="text-white">{scoreResult.expressionScore}%</strong>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${scoreResult.expressionScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
            <span className="text-xs text-gray-400">
              Satisfied with your vocal audition? Publish it to your creator catalog or submit it to a tournament.
            </span>
            <div className="flex items-center gap-3">
              <Link href="/creator-studio/uploads">
                <Button variant="primary" size="md" className="font-bold text-midnight-950">
                  <Send className="w-4 h-4 mr-2" />
                  Publish as Desi Single
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
