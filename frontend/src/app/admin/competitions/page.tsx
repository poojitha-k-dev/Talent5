'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Calendar,
  Users,
  Award,
  Vote,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Edit2,
  Sliders,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Competition {
  id: string;
  title: string;
  slug: string;
  description: string;
  rules: string;
  prize_inr: string | number;
  start_date: string;
  end_date: string;
  eligible_languages: string[];
  eligible_genres: string[];
  cover_url: string | null;
  status: string;
  totalEntries: string | number;
  uniqueCreators: string | number;
  totalVotes: string | number;
}

interface CompetitionEntry {
  id: string;
  competition_id: string;
  creator_id: string;
  stageName: string;
  creatorName: string;
  creatorEmail: string;
  videoUrl: string | null;
  songTitle: string | null;
  audioUrl: string | null;
  rank: number | null;
  votes_count: number;
  status: string;
  submitted_at: string;
}

export default function AdminCompetitionsPage() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
  const [entries, setEntries] = useState<CompetitionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    prizeInr: 50000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    coverUrl: '',
    status: 'ACTIVE',
  });

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/competitions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCompetitions(data.data);
        if (!selectedComp && data.data.length > 0) {
          selectCompetition(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load competitions', err);
    } finally {
      setLoading(false);
    }
  };

  const selectCompetition = async (comp: Competition) => {
    setSelectedComp(comp);
    setEntriesLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/competitions/${comp.id}/entries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (err) {
      console.error('Failed to load competition entries', err);
    } finally {
      setEntriesLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCompetitions();
  }, [token]);

  // Create Competition Submit
  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        fetchCompetitions();
      } else {
        alert(data.message || 'Failed to create competition');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Entry Rank/Status
  const handleUpdateEntry = async (entryId: string, status: string, rank?: number) => {
    try {
      const res = await fetch(`/api/v1/admin/competitions/entries/${entryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, rank: rank || null }),
      });
      const data = await res.json();
      if (data.success && selectedComp) {
        selectCompetition(selectedComp);
      }
    } catch (err) {
      console.error('Failed to update entry', err);
    }
  };

  // Adjust votes (penalty or bonus)
  const handleAdjustVotes = async (entryId: string) => {
    const deltaStr = window.prompt('Enter vote adjustment (e.g., -50 to remove bot votes, or +100):', '-10');
    if (!deltaStr) return;
    const delta = parseInt(deltaStr, 10);
    if (isNaN(delta)) return;

    try {
      const res = await fetch(`/api/v1/admin/competitions/entries/${entryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ votesDelta: delta }),
      });
      const data = await res.json();
      if (data.success && selectedComp) {
        selectCompetition(selectedComp);
      }
    } catch (err) {
      console.error('Failed to adjust votes', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-midnight-900/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Competitions & Grand Desi Challenges
            </h1>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Create regional music hunts, verify voting integrity, declare grand champions, and disburse prize purse allocations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Competition</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Competitions List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-mono text-gray-400">
            <span>Challenges Directory ({competitions.length})</span>
            <button onClick={fetchCompetitions} className="hover:text-white">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {competitions.map((comp) => {
              const isSelected = selectedComp?.id === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => selectCompetition(comp)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : 'bg-midnight-900/40 border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-bold text-white text-sm">{comp.title}</h3>
                      <p className="text-[11px] text-gray-400 line-clamp-1">{comp.description}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        comp.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-2 border-t border-white/5 text-gray-400">
                    <div>
                      <span className="block text-gray-500">Prize Purse</span>
                      <span className="text-amber-400 font-bold">₹{Number(comp.prize_inr).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Entries</span>
                      <span className="text-white font-semibold">{comp.totalEntries}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Votes</span>
                      <span className="text-teal-400 font-semibold">{comp.totalVotes}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Challenge Entries & Podium */}
        <div className="lg:col-span-8 space-y-4">
          {selectedComp ? (
            <div className="bg-midnight-900/50 rounded-2xl border border-white/5 p-6 space-y-6">
              {/* Competition Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Prize Pool: ₹{Number(selectedComp.prize_inr).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      Ends: {new Date(selectedComp.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedComp.title}</h2>
                  <p className="text-xs text-gray-400 leading-relaxed mt-1">{selectedComp.rules}</p>
                </div>
              </div>

              {/* Entries Leaderboard */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                    Audition Entries & Voting Standings ({entries.length})
                  </h3>
                </div>

                {entriesLoading ? (
                  <div className="p-12 text-center text-gray-400 text-xs font-mono">
                    Loading competition entries...
                  </div>
                ) : entries.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 text-xs font-mono bg-midnight-950/40 rounded-xl border border-white/5">
                    No creator entries registered for this competition yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {entries.map((entry, idx) => {
                      const isWinner = entry.status === 'WINNER';
                      const isRunnerUp = entry.status === 'RUNNER_UP';
                      return (
                        <div
                          key={entry.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isWinner
                              ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                              : isRunnerUp
                              ? 'bg-slate-300/10 border-slate-300/30'
                              : 'bg-midnight-950/70 border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                              {entry.rank ? `#${entry.rank}` : `#${idx + 1}`}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-xs flex items-center gap-2">
                                <span>{entry.stageName}</span>
                                {isWinner && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500 text-black">
                                    GRAND CHAMPION
                                  </span>
                                )}
                                {isRunnerUp && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200 text-black">
                                    RUNNER-UP
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono">
                                {entry.creatorEmail} • {entry.songTitle || 'Audition Recording'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right font-mono">
                              <div className="text-teal-300 font-bold text-xs">{entry.votes_count} votes</div>
                              <button
                                onClick={() => handleAdjustVotes(entry.id)}
                                className="text-[10px] text-gray-500 hover:text-amber-400 underline"
                              >
                                Adjust Bot Votes
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateEntry(entry.id, 'WINNER', 1)}
                                className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-semibold"
                                title="Crown as 1st Place Winner"
                              >
                                🏆 1st
                              </button>
                              <button
                                onClick={() => handleUpdateEntry(entry.id, 'RUNNER_UP', 2)}
                                className="px-2 py-1 bg-slate-300/20 hover:bg-slate-300/30 text-slate-200 border border-slate-300/40 rounded text-[10px] font-semibold"
                                title="Award Runner-Up"
                              >
                                🥈 2nd
                              </button>
                              <button
                                onClick={() => handleUpdateEntry(entry.id, 'QUALIFIED')}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded text-[10px]"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-20 text-center text-gray-500 text-xs font-mono bg-midnight-900/30 rounded-2xl border border-white/5">
              Select a competition to view audit details and leaderboard entries.
            </div>
          )}
        </div>
      </div>

      {/* Create Competition Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-950 border border-amber-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-white text-base">Launch Competition</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-mono">Challenge Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Desi Classical Voice 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Summary for participants..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Rules & Evaluation Criteria *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Only original vocal compositions accepted..."
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-mono">Prize Purse (INR)</label>
                  <input
                    type="number"
                    value={formData.prizeInr}
                    onChange={(e) => setFormData({ ...formData, prizeInr: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-mono">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-mono">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold rounded-xl text-xs shadow-lg shadow-amber-500/20"
                >
                  {isSubmitting ? 'Creating...' : 'Launch Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
