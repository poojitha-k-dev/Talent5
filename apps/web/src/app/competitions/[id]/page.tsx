'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  Calendar,
  Sparkles,
  Play,
  Pause,
  ThumbsUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Music,
  User,
  AlertCircle,
} from 'lucide-react';
import { formatINR } from '@talent5/utils';
import { Button } from '@/components/ui/Button';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';

interface CompetitionDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string;
  rules: string;
  prizeINR: string;
  startDate: string;
  endDate: string;
  eligibleLanguages: string[];
  eligibleGenres: string[];
  status: string;
}

interface TournamentEntry {
  id: string;
  rank?: number;
  votesCount: number;
  status: string;
  submittedAt: string;
  creatorId: string;
  creatorName: string;
  city: string;
  songId: string;
  songTitle: string;
  audioUrl: string;
  artworkUrl: string;
  validLikesCount: number;
  videoUrl?: string;
}

export default function CompetitionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { user } = useAuth();

  const [competition, setCompetition] = useState<CompetitionDetail | null>(null);
  const [entries, setEntries] = useState<TournamentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [votedEntryIds, setVotedEntryIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  // Entry submission modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [creatorTracks, setCreatorTracks] = useState<any[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [submittingEntry, setSubmittingEntry] = useState(false);

  const fetchCompetition = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/competitions/${id}`);
      const json = await res.json();
      if (json.success) {
        setCompetition(json.data.competition);
        setEntries(json.data.entries);
      }
    } catch (err) {
      console.error('Error fetching tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCompetition();
  }, [id]);

  const handleVote = async (entry: TournamentEntry) => {
    setVotingId(entry.id);
    try {
      const res = await fetch(`/api/v1/competitions/${competition?.id || id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: entry.id }),
      });
      const json = await res.json();

      if (json.success) {
        setVotedEntryIds((prev) => new Set(prev).add(entry.id));
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, votesCount: e.votesCount + 1 } : e))
        );
        setToast(`Voted for ${entry.creatorName}!`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setVotingId(null);
    }
  };

  const handlePlaySong = (entry: TournamentEntry) => {
    if (currentSong?.id === entry.songId) {
      togglePlay();
      return;
    }

    playSong({
      id: entry.songId,
      title: entry.songTitle,
      artistName: entry.creatorName,
      audioUrl: entry.audioUrl,
      artworkUrl: entry.artworkUrl,
      durationSeconds: 210,
    } as any);
  };

  const openSubmitModal = async () => {
    setShowSubmitModal(true);
    try {
      const res = await fetch('/api/v1/creators/studio/summary');
      const json = await res.json();
      if (json.success && json.data.topContent) {
        setCreatorTracks(json.data.topContent);
        if (json.data.topContent.length > 0) {
          setSelectedTrackId(json.data.topContent[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading creator catalog:', err);
    }
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrackId) return;
    setSubmittingEntry(true);

    try {
      const res = await fetch(`/api/v1/competitions/${competition?.id || id}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: selectedTrackId }),
      });
      const json = await res.json();

      if (json.success) {
        setToast('Entry successfully submitted to tournament!');
        setShowSubmitModal(false);
        fetchCompetition();
        setTimeout(() => setToast(null), 3000);
      } else {
        alert(json.error?.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Error submitting tournament entry:', err);
    } finally {
      setSubmittingEntry(false);
    }
  };

  if (loading || !competition) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Loading Tournament Arena...</p>
      </div>
    );
  }

  const isCreator = user?.roles?.includes('CREATOR');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back Button */}
      <Link
        href="/competitions"
        className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Tournaments</span>
      </Link>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 bg-midnight-900 shadow-2xl">
        <div className="absolute inset-0">
          <img
            src={competition.coverUrl}
            alt={competition.title}
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/80 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-10 md:p-12 space-y-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-midnight-950 shadow-saffronGlow uppercase tracking-wider">
              Grand Prize: {formatINR(parseFloat(competition.prizeINR))}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              {competition.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            {competition.title}
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            {competition.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
            <div>
              <span className="text-gray-400 block">Eligible Languages:</span>
              <strong className="text-white">
                {competition.eligibleLanguages?.join(', ') || 'All Regional Languages'}
              </strong>
            </div>
            <div>
              <span className="text-gray-400 block">Eligible Genres:</span>
              <strong className="text-white">
                {competition.eligibleGenres?.join(', ') || 'Independent & Folk'}
              </strong>
            </div>
            <div>
              <span className="text-gray-400 block">Tournament Window:</span>
              <strong className="text-white">
                {competition.startDate} to {competition.endDate}
              </strong>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            {isCreator ? (
              <Button
                variant="primary"
                size="lg"
                onClick={openSubmitModal}
                className="font-bold text-midnight-950 bg-amber-500 hover:bg-amber-400 shadow-saffronGlow"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Submit Your Entry
              </Button>
            ) : (
              <Link href="/creator-studio/apply">
                <Button variant="primary" size="lg" className="font-bold text-midnight-950">
                  Join as Creator to Enter
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 right-8 z-50 p-4 rounded-xl bg-emerald-500/90 text-white font-medium text-xs shadow-xl backdrop-blur-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Rules & Criteria */}
      <div className="p-6 rounded-2xl bg-midnight-900/60 border border-white/5 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          Official Adjudication Rules & Evaluation Weightage
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
          {competition.rules}
        </p>
      </div>

      {/* Live Entries Gallery */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Live Tournament Entries</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Listen to contestant tracks and cast your vote to advance your favorite desi creators.
            </p>
          </div>
          <span className="text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            Entries: <strong className="text-white">{entries.length}</strong>
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-midnight-900/40 border border-white/5 text-xs text-gray-400">
            No entries submitted yet. Be the first creator to enter and claim the spotlight!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry, idx) => {
              const isEntryPlaying = currentSong?.id === entry.songId && isPlaying;
              const hasVoted = votedEntryIds.has(entry.id);

              return (
                <div
                  key={entry.id}
                  className="p-5 rounded-2xl bg-midnight-900/70 border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Artwork & Rank */}
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-midnight-950 border border-white/5">
                      <img
                        src={entry.artworkUrl}
                        alt={entry.songTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="w-7 h-7 rounded-lg bg-midnight-950/80 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-xs">
                          #{idx + 1}
                        </span>
                      </div>
                      <button
                        onClick={() => handlePlaySong(entry)}
                        className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isEntryPlaying
                            ? 'bg-amber-500 text-midnight-950 scale-105'
                            : 'bg-black/60 hover:bg-amber-500 hover:text-midnight-950 text-white'
                        }`}
                      >
                        {isEntryPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white truncate">{entry.songTitle}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mt-0.5">
                        <User className="w-3 h-3" />
                        <span>{entry.creatorName}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400 text-[11px]">{entry.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Voting Action Bar */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <ThumbsUp className="w-3.5 h-3.5 text-amber-400" />
                      <strong className="text-white font-mono text-sm">{entry.votesCount}</strong>
                      <span className="text-gray-400 text-[11px]">votes</span>
                    </div>

                    <Button
                      variant={hasVoted ? 'ghost' : 'primary'}
                      size="sm"
                      onClick={() => handleVote(entry)}
                      disabled={votingId === entry.id || hasVoted}
                      className={`text-xs ${
                        hasVoted
                          ? 'text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500 hover:bg-amber-400 text-midnight-950 font-bold'
                      }`}
                    >
                      {hasVoted ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Voted
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                          Vote for Artist
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Entry Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitEntry}
            className="max-w-md w-full bg-midnight-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Enter Tournament</h3>
                <p className="text-xs text-gray-400">{competition.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="text-gray-300 font-medium block">
                Select from Your Published / Uploaded Originals:
              </label>

              {creatorTracks.length === 0 ? (
                <div className="p-4 rounded-xl bg-midnight-950 border border-white/5 text-gray-400 text-center">
                  No submitted originals found.{' '}
                  <Link href="/creator-studio/uploads" className="text-amber-400 underline">
                    Upload an original track first
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {creatorTracks.map((tr) => (
                    <label
                      key={tr.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedTrackId === tr.id
                          ? 'bg-amber-500/10 border-amber-500/40 text-white'
                          : 'bg-midnight-950 border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="track"
                          value={tr.id}
                          checked={selectedTrackId === tr.id}
                          onChange={(e) => setSelectedTrackId(e.target.value)}
                          className="accent-amber-500"
                        />
                        <span className="font-medium text-xs text-white">{tr.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{tr.category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submittingEntry || !selectedTrackId}
                className="bg-amber-500 hover:bg-amber-400 text-midnight-950 font-bold text-xs"
              >
                {submittingEntry ? 'Submitting...' : 'Confirm Submission'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
