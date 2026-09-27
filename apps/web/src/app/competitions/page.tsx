'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Trophy, Calendar, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatINR, formatDate } from '@talent5/utils';
import { Button } from '@/components/ui/Button';

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/v1/competitions')
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setCompetitions(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
          <Trophy className="w-4 h-4" />
          <span>Competitions & Awards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          Desi Music Tournaments
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Vote for rising grassroots creators, evaluate pure vocal authenticity, and participate in community tournaments.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-sm">Loading tournaments...</div>
      ) : competitions.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-sm">No active competitions right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {competitions.map((comp) => (
            <div
              key={comp.id}
              className="glass-panel rounded-3xl overflow-hidden border border-amber-500/20 flex flex-col justify-between shadow-card group"
            >
              <div className="relative aspect-[21/9] bg-midnight-900 overflow-hidden">
                <img
                  src={comp.coverUrl}
                  alt={comp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-midnight-950 shadow-saffronGlow uppercase tracking-wider">
                    Prize: {formatINR(parseFloat(comp.prizeINR))}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-emerald-400 border border-emerald-500/30 uppercase">
                    {comp.status}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold font-display text-white">{comp.title}</h2>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {comp.description}
                  </p>

                  <div className="pt-2 space-y-1 text-xs text-gray-400">
                    <p>
                      <strong className="text-gray-300">Eligible Languages:</strong>{' '}
                      {comp.eligibleLanguages?.join(', ') || 'All Indian Languages'}
                    </p>
                    <p>
                      <strong className="text-gray-300">Timeline:</strong> {formatDate(comp.startDate)} – {formatDate(comp.endDate)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {comp.entriesCount || 0} Registered Entries
                  </span>
                  <Link href="/creator-studio/apply">
                    <Button variant="primary" size="md" className="font-bold text-midnight-950">
                      Enter Challenge
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
