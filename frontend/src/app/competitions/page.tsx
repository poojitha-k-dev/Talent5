'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Trophy,
  Calendar,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Play,
  Pause,
  Heart,
  Clock,
  Mic,
  ShieldCheck,
  Flame,
  Info,
} from 'lucide-react';
import { formatINR, formatDate, formatCompactNumber } from '@talent5/utils';
import { Button } from '@/components/ui/Button';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';

export default function CompetitionsPage() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { token, user } = useAuth();

  const [competitions, setCompetitions] = useState<any[]>([]);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedCompDetails, setSelectedCompDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [votedEntries, setVotedEntries] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState<number>(Date.now());

  // 1. Tick every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch list of competitions
  useEffect(() => {
    fetch('/api/v1/competitions')
      .then((r) => r.json())
      .then((d) => {
        if (d.data && d.data.length > 0) {
          setCompetitions(d.data);
          setSelectedCompId(d.data[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 3. Fetch selected competition details with entries
  useEffect(() => {
    if (!selectedCompId) return;
    setLoadingDetails(true);
    fetch(`/api/v1/competitions/${selectedCompId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setSelectedCompDetails(d.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingDetails(false));
  }, [selectedCompId]);

  // Countdown Helper
  const getCountdown = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime();
    const diff = Math.max(0, end - now);
    if (diff === 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds, isEnded: false };
  };

  const handleVote = async (entryId: string) => {
    if (votedEntries[entryId]) return;
    if (!token) {
      alert('Please log in to cast your verified vote for this contestant!');
      return;
    }

    setVotedEntries((prev) => ({ ...prev, [entryId]: true }));
    if (selectedCompDetails?.entries) {
      setSelectedCompDetails((prev: any) => ({
        ...prev,
        entries: prev.entries.map((e: any) =>
          e.id === entryId ? { ...e, votesCount: Number(e.votesCount || 0) + 1 } : e
        ),
      }));
    }

    try {
      const res = await fetch(`/api/v1/competitions/${selectedCompId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ entryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Vote failed');
      }
    } catch (e) {
      console.error('Vote failed', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1.5">
            <Trophy className="w-4 h-4" />
            <span>Audited Tournaments & Awards</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            Desi Music Tournaments
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
            Discover rising grassroots artists across India, audition with your original compositions, and vote to crown the next indie icons.
          </p>
        </div>

        <Link href="/creator-studio/apply">
          <Button variant="primary" size="lg" className="font-bold text-midnight-950 shadow-saffronGlow gap-2 flex-shrink-0">
            <Mic className="w-5 h-5" />
            <span>Submit Your Audition</span>
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center text-gray-400 text-sm">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading active tournaments...
        </div>
      ) : competitions.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-sm bg-midnight-900/40 rounded-3xl border border-white/5">
          No active competitions right now. Check back soon!
        </div>
      ) : (
        <>
          {/* ─── TOURNAMENTS CAROUSEL / SELECTOR ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competitions.map((comp) => {
              const isSelected = selectedCompId === comp.id;
              const cd = getCountdown(comp.endDate);

              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedCompId(comp.id)}
                  className={`cursor-pointer rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-card relative group ${
                    isSelected
                      ? 'bg-midnight-900/90 border-amber-500 shadow-saffronGlow scale-[1.01]'
                      : 'bg-midnight-950/60 border-white/10 hover:border-amber-500/40 hover:bg-midnight-900/60'
                  }`}
                >
                  <div className="relative aspect-[21/9] bg-midnight-900 overflow-hidden">
                    <img
                      src={comp.coverUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200'}
                      alt={comp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-transparent to-transparent" />

                    <div className="absolute top-4 left-4">
                      <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-500 text-midnight-950 shadow-saffronGlow uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 fill-current" />
                        <span>Prize: {formatINR(parseFloat(comp.prizeINR))}</span>
                      </span>
                    </div>

                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/80 text-emerald-400 border border-emerald-500/40 uppercase tracking-wider backdrop-blur-md">
                        ● {comp.status}
                      </span>
                    </div>

                    {/* Live Ticking Countdown Overlay */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-midnight-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-mono font-bold text-white">
                          {cd.isEnded ? (
                            'Tournament Ended'
                          ) : (
                            `${cd.days}d : ${String(cd.hours).padStart(2, '0')}h : ${String(cd.minutes).padStart(2, '0')}m : ${String(cd.seconds).padStart(2, '0')}s left`
                          )}
                        </span>
                      </div>

                      <span className="text-xs text-amber-400 font-semibold underline group-hover:translate-x-1 transition-transform">
                        {isSelected ? 'Viewing Entries ▼' : 'Click to View Entries →'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-bold font-display text-white">{comp.title}</h2>
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mt-1 line-clamp-2">
                        {comp.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                      <span>{comp.entriesCount || 0} Registered Contestants</span>
                      <span className="text-gray-300">
                        {comp.eligibleLanguages?.join(', ') || 'All Indian Languages'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── LIVE AUDITIONS & COMMUNITY VOTING SHOWCASE ─── */}
          {selectedCompDetails && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
                      <span>{selectedCompDetails.competition?.title}</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Live Contestant Leaderboard
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Listen to verified original masters below and cast your vote. One vote per verified listener.
                    </p>
                  </div>
                </div>
              </div>

              {loadingDetails ? (
                <div className="p-12 text-center text-gray-400 text-sm">
                  Loading contestant submissions...
                </div>
              ) : selectedCompDetails.entries?.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-sm bg-midnight-900/30 rounded-2xl border border-white/5">
                  No submissions yet for this competition. Be the first to enter!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {selectedCompDetails.entries.map((entry: any, idx: number) => {
                    const isAudioPlaying = currentSong?.id === entry.songId && isPlaying;
                    const hasVoted = votedEntries[entry.id];

                    return (
                      <div
                        key={entry.id}
                        className="rounded-2xl p-4 bg-midnight-900/80 border border-white/10 hover:border-amber-500/40 flex flex-col justify-between gap-4 transition-all shadow-card group"
                      >
                        <div className="flex items-center gap-3">
                          {/* Rank Badge */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-sm flex-shrink-0 ${
                              idx === 0
                                ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow'
                                : idx === 1
                                ? 'bg-slate-300 text-midnight-950'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-midnight-800 text-gray-400 border border-white/5'
                            }`}
                          >
                            #{idx + 1}
                          </div>

                          {/* Contestant Artwork & Play */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-midnight-800 flex-shrink-0 border border-white/10">
                            <img
                              src={entry.artworkUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400'}
                              alt={entry.songTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <button
                              onClick={() => {
                                if (isAudioPlaying) {
                                  togglePlay();
                                } else {
                                  playSong({
                                    id: entry.songId || entry.id,
                                    title: entry.songTitle,
                                    audioUrl: entry.audioUrl,
                                    artworkUrl: entry.artworkUrl,
                                    artistName: entry.creatorName,
                                    artistId: entry.creatorId,
                                    durationSeconds: 180,
                                  } as any);
                                }
                              }}
                              className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                                isAudioPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                              title={isAudioPlaying ? 'Pause Audition' : 'Play Audition Track'}
                            >
                              <div className="w-8 h-8 rounded-full bg-amber-500 text-midnight-950 flex items-center justify-center shadow-saffronGlow">
                                {isAudioPlaying ? (
                                  <Pause className="w-4 h-4 fill-current" />
                                ) : (
                                  <Play className="w-4 h-4 fill-current ml-0.5" />
                                )}
                              </div>
                            </button>
                          </div>

                          {/* Contestant Info */}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-white truncate">{entry.songTitle}</h3>
                            <p className="text-xs text-amber-400 font-semibold truncate">{entry.creatorName}</p>
                            <span className="text-[11px] text-gray-400 block truncate">{entry.city || 'India'}</span>
                          </div>
                        </div>

                        {/* Votes & Action Row */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold">
                            <Flame className="w-4 h-4 text-amber-500" />
                            <span>{formatCompactNumber(entry.votesCount || 0)} Community Votes</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleVote(entry.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              hasVoted
                                ? 'bg-rose-500 text-white shadow-md cursor-default'
                                : 'bg-white/10 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 active:scale-95'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${hasVoted ? 'fill-current' : ''}`} />
                            <span>{hasVoted ? 'Voted' : 'Vote'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── AUDITION ENTRY GUIDELINES ─── */}
          <div className="p-6 sm:p-8 rounded-3xl bg-midnight-900/60 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Audition Quality Guidelines</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white">How to Compete and Win</h3>
              <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
                All tournament entries must be 100% original musical works or rights-cleared vocals. Submissions are screened by Talent5 AI Sentinel for audio fidelity, statutory clearance, and authentic performance.
              </p>
            </div>

            <Link href="/creator-studio/apply">
              <Button variant="outline" size="md" className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 whitespace-nowrap">
                Review Rules & Apply →
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
