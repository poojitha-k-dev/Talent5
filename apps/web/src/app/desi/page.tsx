'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  Pause,
  Video,
  Heart,
  Eye,
  ShieldCheck,
  Filter,
  Flame,
  Award,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { formatCompactNumber } from '@talent5/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function DesiHubPage() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const [desiItems, setDesiItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const categories = [
    { id: '', label: 'All Desi Creators' },
    { id: 'SINGER', label: 'Indie Singers' },
    { id: 'RAPPER', label: 'Street Rap & Drill' },
    { id: 'FOLK', label: 'Folk Innovators' },
    { id: 'CLASSICAL', label: 'Classical Fusion' },
    { id: 'INSTRUMENTAL', label: 'Instrumentalists' },
  ];

  useEffect(() => {
    const fetchDesi = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);

        const res = await fetch(`/api/v1/desi?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setDesiItems(json.data || []);
        }
      } catch (e) {
        console.error('Desi fetch error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDesi();
  }, [selectedCategory]);

  const heroItem = desiItems.find((i) => i.isFeatured) || desiItems[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Desi Hub Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-teal-500/30 bg-gradient-to-r from-teal-950 via-midnight-950 to-midnight-900 p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Independent Creator Showcase</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
              DESI <span className="text-teal-400">ORIGINALS</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300">
              "Real Voices. Original Stories. Desi Talent."
              <br />
              A dedicated stage exclusively for approved grassroots musicians, folk singers, and street poets across India.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/creator-studio/apply">
                <Button variant="peacock" size="lg" className="font-bold">
                  Apply as a Desi Creator
                </Button>
              </Link>
              <Link href="/competitions">
                <Button variant="outline" size="lg" className="border-teal-500/40 text-teal-300">
                  Desi Tournaments
                </Button>
              </Link>
            </div>
          </div>

          {/* Featured Video Teaser Card */}
          {heroItem && (
            <div className="w-full md:w-80 rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-card flex flex-col group">
              <div className="relative aspect-video bg-midnight-950">
                <img
                  src={heroItem.coverUrl}
                  alt={heroItem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <Link
                  href={`/desi/${heroItem.id}`}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-500 text-midnight-950 flex items-center justify-center shadow-peacockGlow">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </Link>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/80 text-midnight-950 font-bold text-[10px] uppercase">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-bold text-white truncate">{heroItem.title}</h3>
                <p className="text-xs text-teal-400">By {heroItem.creatorName}</p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-gray-400">
                  <span>{heroItem.city}, {heroItem.state}</span>
                  <span className="text-amber-400 font-semibold">{formatCompactNumber(heroItem.validLikesCount)} Valid Likes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-teal-500 text-midnight-950 shadow-peacockGlow font-bold'
                : 'bg-midnight-800 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Desi Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-teal-400 font-display">Tuning Desi Waves...</p>
        </div>
      ) : desiItems.length === 0 ? (
        <div className="text-center py-20 bg-midnight-900/30 rounded-3xl border border-white/5">
          <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">No Desi creations in this category yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
            Are you an independent artist? Submit your original composition and get discovered by millions.
          </p>
          <Link href="/creator-studio/apply">
            <Button variant="peacock" size="sm">
              Apply as Creator
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {desiItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col border border-white/10 group"
            >
              <div className="relative aspect-video bg-midnight-950">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() =>
                    playSong({
                      id: item.songId,
                      title: item.title,
                      slug: item.id,
                      artistId: item.creatorId,
                      artistName: item.creatorName,
                      durationSeconds: item.durationSeconds || 200,
                      audioUrl: item.audioUrl,
                      artworkUrl: item.coverUrl,
                      languageId: '1',
                      genreId: '1',
                      releaseDate: '2026-01-01',
                      isExplicit: false,
                      playCount: item.playCount,
                      rawLikesCount: item.validLikesCount,
                      validLikesCount: item.validLikesCount,
                      popularityScore: 90,
                      status: 'PUBLISHED',
                      featuredArtists: [],
                      createdAt: new Date().toISOString(),
                    })
                  }
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-500 text-midnight-950 flex items-center justify-center shadow-peacockGlow transform hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </button>

                <div className="absolute top-2 right-2">
                  <span
                    title="Approved Creator Original"
                    className="p-1 rounded-full bg-black/60 text-teal-400 flex items-center justify-center"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 uppercase">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400">• {item.languageName}</span>
                  </div>

                  <Link
                    href={`/desi/${item.id}`}
                    className="text-base font-bold font-display text-white hover:text-teal-400 truncate block transition-colors"
                  >
                    {item.title}
                  </Link>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400">By {item.creatorName}</span>
                    {item.verifiedBadge && <Badge type="approvedCreator" label="Approved" />}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {formatCompactNumber(item.viewsCount)}
                  </span>
                  <span className="flex items-center gap-1 text-teal-400 font-semibold">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    {formatCompactNumber(item.validLikesCount)} Valid Likes
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
