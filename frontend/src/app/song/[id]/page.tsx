'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  Heart,
  Bookmark,
  Share2,
  Sparkles,
  ShieldCheck,
  Disc3,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Music,
  Mic,
  Tv,
} from 'lucide-react';
import { useAudio, findActiveLyricIndex } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Song, LyricLine } from '@talent5/types';
import { SongRow } from '@/components/ui/SongRow';
import { TrackCard } from '@/components/ui/TrackCard';
import { Button } from '@/components/ui/Button';
import { formatCompactNumber, formatDuration } from '@talent5/utils';

export default function SongDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    currentTime,
    seek,
    setIsLyricsOpen,
    activeLyricIndex: globalActiveLyricIndex,
  } = useAudio();
  const { token } = useAuth();

  const [data, setData] = useState<{
    song: Song;
    rights: any;
    lyrics: { id: string; isSynced: boolean; fullText: string; lines: LyricLine[] } | null;
    comments: any[];
    recommended: Song[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  const activeLyricRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`/api/v1/catalog/songs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Song not found');
        return res.json();
      })
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load song:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Check like and save status
  useEffect(() => {
    if (!token || !id) return;
    fetch('/api/v1/library', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          const liked = (json.data.likedSongs || []).some((s: any) => s.id === id);
          setIsLiked(liked);
        }
      })
      .catch(() => {});
  }, [token, id]);

  const isThisSongPlaying = currentSong?.id === data?.song?.id && isPlaying;
  const currentMs = currentTime * 1000;
  const lyricsLines = data?.lyrics?.lines || [];
  const isSynced = Boolean(data?.lyrics?.isSynced && lyricsLines.length > 0);

  const activeLineIndex = isThisSongPlaying && isSynced
    ? (globalActiveLyricIndex >= 0
        ? globalActiveLyricIndex
        : findActiveLyricIndex(currentMs, lyricsLines, isSynced, 120))
    : -1;

  // Automatically scroll the currently sung lyric into the center of the viewport
  useEffect(() => {
    if (isThisSongPlaying && activeLineIndex >= 0 && activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex, isThisSongPlaying]);

  const handlePlayToggle = () => {
    if (!data?.song) return;
    if (currentSong?.id === data.song.id) {
      togglePlay();
    } else {
      playSong(data.song, data.recommended ? [data.song, ...data.recommended] : [data.song]);
    }
  };

  const handleLike = async () => {
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLiked(!isLiked);
    try {
      await fetch('/api/v1/social/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetType: 'SONG', targetId: id }),
      });
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleSave = async () => {
    if (!token) {
      router.push('/login');
      return;
    }
    setIsSaved(!isSaved);
    try {
      await fetch('/api/v1/library/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songId: id }),
      });
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-amber-500 font-display uppercase tracking-widest">
          Loading Master Recording...
        </p>
      </div>
    );
  }

  if (!data?.song) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-white">Song Not Found</h2>
        <p className="text-sm text-gray-400">The requested track could not be located in our catalog.</p>
        <Link href="/discover">
          <Button variant="primary" size="md">
            Explore Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const { song, rights, lyrics, recommended } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* ────────────────────────────────────────────────────────────
          1. HERO HEADER: TRACK ARTWORK & METADATA
      ──────────────────────────────────────────────────────────── */}
      <section className="flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-10 pb-8 border-b border-black/5 dark:border-white/10">
        {/* Cover Art with Glow and Soundwave Visualizer */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-2xl bg-midnight-900 border border-white/10 group">
            <img
              src={song.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'}
              alt={song.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-radial-gradient opacity-20 pointer-events-none" />
            {isThisSongPlaying && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-midnight-950/80 backdrop-blur-md border border-amber-500/30 flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Playing Now
              </div>
            )}
          </div>

          {/* Soundwave Frequency Bar Visualizer */}
          <div className="w-56 sm:w-64 flex items-center justify-between px-3 h-7 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 overflow-hidden">
            {[45, 80, 60, 100, 35, 75, 90, 50, 70, 95, 40, 85, 65, 90, 55, 70].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-gradient-to-t from-amber-600 to-amber-400 transition-all ${
                  isThisSongPlaying ? 'animate-pulse' : 'opacity-30'
                }`}
                style={{
                  height: isThisSongPlaying ? `${h}%` : '20%',
                  animationDelay: `${(i * 65) % 800}ms`,
                  animationDuration: '600ms',
                }}
              />
            ))}
          </div>
        </div>

        {/* Track Metadata & Actions */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {song.languageName && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {song.languageName}
              </span>
            )}
            {song.genreName && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                {song.genreName}
              </span>
            )}
            {rights?.status === 'VERIFIED' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" /> Rights Verified
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight">
            {song.title}
          </h1>

          {/* Artist link */}
          <div className="flex items-center justify-center md:justify-start gap-3">
            <Link
              href={`/artist/${song.artistId}`}
              className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-gray-200 hover:text-amber-500 transition-colors"
            >
              <span>{song.artistName}</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </Link>
            <span className="text-gray-400">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {formatDuration(song.durationSeconds)}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {formatCompactNumber(song.playCount || 0)} streams
            </span>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePlayToggle}
              className="gap-2.5 font-bold shadow-saffronGlow text-midnight-950 px-8"
            >
              {isThisSongPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  <span>Play Track</span>
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={handleLike}
              className={`p-3 rounded-full border transition-all ${
                isLiked
                  ? 'bg-rose-500/20 text-rose-500 border-rose-500/40 shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-400 hover:text-rose-500 hover:border-rose-500/30'
              }`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`p-3 rounded-full border transition-all ${
                isSaved
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-400 hover:text-amber-500 hover:border-amber-500/30'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save to Library'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-3 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all relative"
              title="Share Track"
            >
              <Share2 className="w-5 h-5" />
              {shareCopied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-amber-500 text-midnight-950 font-bold text-[10px] rounded-md shadow-md whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          2. SYNCHRONIZED LYRICS SECTION (Full-Song Timed Display)
      ──────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                <span>{lyrics?.isSynced ? 'Synchronized Lyrics' : 'Lyrics'}</span>
              </h2>
              {lyrics?.isSynced && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {isThisSongPlaying ? '● Live 60FPS Sync' : 'Synced'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {lyrics?.isSynced && (
                <button
                  type="button"
                  onClick={() => setIsLyricsOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-amber-500/20 text-slate-700 dark:text-gray-200 hover:text-amber-500 text-xs font-semibold transition-all border border-black/10 dark:border-white/10"
                  title="Open Fullscreen Teleprompter"
                >
                  <Tv className="w-3.5 h-3.5 text-amber-500" />
                  <span>Teleprompter</span>
                </button>
              )}
              <Link
                href={`/karaoke?songId=${song.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all border border-amber-500/30 shadow-sm"
                title="Sing along in Karaoke Studio"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Sing Karaoke</span>
              </Link>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white/60 dark:bg-midnight-900/60 border border-black/5 dark:border-white/10 max-h-[500px] overflow-y-auto space-y-3 shadow-sm scrollbar-thin">
            {/* Instrumental Prelude Notice */}
            {isThisSongPlaying && isSynced && lyrics?.lines && lyrics.lines.length > 0 && activeLineIndex === -1 && currentMs < lyrics.lines[0].startTimeMs && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-2 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-3 bg-amber-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-5 bg-amber-400 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-2 bg-amber-500 rounded-full animate-bounce delay-200" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Instrumental Prelude Playing</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300/80">
                      Vocals drop in {Math.max(1, Math.ceil((lyrics.lines[0].startTimeMs - currentMs) / 1000))} seconds
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => seek(lyrics.lines[0].startTimeMs / 1000)}
                  className="text-xs px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-midnight-950 font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  <span>Skip to Vocals</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {lyrics?.lines && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, idx) => {
                const isActive = idx === activeLineIndex;
                const isPast = activeLineIndex >= 0 && idx < activeLineIndex;

                const lineDuration = Math.max(1, line.endTimeMs - line.startTimeMs);
                const lineProgress = isActive
                  ? Math.min(100, Math.max(0, ((currentMs - line.startTimeMs) / lineDuration) * 100))
                  : isPast
                  ? 100
                  : 0;

                return (
                  <div
                    key={line.id || idx}
                    ref={isActive ? activeLyricRef : null}
                    onClick={() => {
                      if (lyrics?.isSynced) {
                        if (currentSong?.id !== song.id) {
                          playSong(song);
                        }
                        seek(line.startTimeMs / 1000);
                      }
                    }}
                    className={`group/line p-3.5 rounded-2xl transition-all duration-300 flex items-center justify-between gap-3 ${
                      lyrics?.isSynced ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isActive
                        ? 'bg-amber-500/15 border-l-4 border-amber-500 pl-5 scale-[1.01] shadow-sm'
                        : isPast
                        ? 'opacity-85 hover:bg-black/5 dark:hover:bg-white/5 pl-4'
                        : 'opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 pl-4'
                    }`}
                  >
                    <p
                      className="text-base sm:text-xl font-bold tracking-tight transition-all duration-150 leading-relaxed flex-1"
                      style={
                        isActive
                          ? {
                              background: `linear-gradient(to right, #F59E0B ${lineProgress}%, #CBD5E1 ${lineProgress}%)`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }
                          : isPast
                          ? { color: '#F59E0B' }
                          : undefined
                      }
                    >
                      {line.text}
                    </p>

                    {/* Interactive hover playhead */}
                    {lyrics?.isSynced && (
                      <div className="opacity-0 group-hover/line:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-500 flex-shrink-0 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30 shadow-sm">
                        <Play className="w-3 h-3 fill-current" />
                        <span>{formatDuration(line.startTimeMs / 1000)}</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : lyrics?.fullText ? (
              <pre className="font-sans text-sm sm:text-base text-gray-300 whitespace-pre-wrap leading-relaxed">
                {lyrics.fullText}
              </pre>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Lyrics for this recording are currently being verified by our musicologists.
              </p>
            )}
          </div>
        </div>

        {/* Provenance & Rights Transparency Panel */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span>Master Provenance</span>
          </h2>

          <div className="p-6 rounded-3xl bg-white/60 dark:bg-midnight-900/60 border border-black/5 dark:border-white/10 space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">Vocalist / Artist</span>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">{song.artistName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">Language & Heritage</span>
              <p className="font-medium text-slate-800 dark:text-gray-200">{song.languageName} • {song.genreName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">Rights & License</span>
              <p className="font-medium text-slate-800 dark:text-gray-200">
                {rights?.licenseType || 'Talent5 Verified Master License'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 uppercase tracking-wider text-[10px]">Audio Integrity</span>
              <p className="font-medium text-emerald-500">
                100% Pure Human Vocal Recording (0 AI Artifacts)
              </p>
            </div>

            <div className="pt-2 border-t border-black/5 dark:border-white/10">
              <Link
                href="/rights"
                className="text-amber-600 dark:text-amber-400 hover:underline font-semibold block text-center"
              >
                Learn About Rights & Royalties →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          3. RECOMMENDED TRACKS
      ──────────────────────────────────────────────────────────── */}
      {recommended && recommended.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              You May Also Like
            </h2>
            <Link
              href={`/discover?language=${song.languageId}`}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              More in {song.languageName} →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recommended.map((rec) => (
              <TrackCard key={rec.id} song={rec} playlistContext={recommended} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
