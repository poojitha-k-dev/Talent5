'use client';

import React from 'react';
import Link from 'next/link';
import {
  Music,
  Sparkles,
  ShieldCheck,
  Coins,
  Mic,
  Trophy,
  Users,
  Globe,
  ArrowRight,
  Heart,
  CheckCircle2,
  Disc3,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  const pillars = [
    {
      icon: Music,
      title: 'Original Desi Music Only',
      desc: 'No stolen covers or unauthorized remixes. Every track on Talent5 is an authentic original master published directly by emerging grassroots Indian artists.',
    },
    {
      icon: Coins,
      title: 'Validated Engagement Rewards',
      desc: 'Creators earn transparently at ₹0.10 per validated like, safeguarded by real-time anti-fraud heuristics to eliminate bots and click farms.',
    },
    {
      icon: Trophy,
      title: 'Audience-Judged Tournaments',
      desc: 'Nationwide talent discovery competitions with ₹1,00,000+ prize pools, live transparent leaderboards, and audited voter verification.',
    },
    {
      icon: Mic,
      title: 'AI Raga & Singing Studio',
      desc: 'Interactive AI vocal evaluation with millisecond-synced backing tracks, live pitch tracking, and raga shruti scoring for aspiring vocalists.',
    },
  ];

  const languages = [
    'Hindi (हिन्दी)',
    'Punjabi (ਪੰਜਾਬੀ)',
    'Tamil (தமிழ்)',
    'Telugu (తెలుగు)',
    'Bengali (বাংলা)',
    'Kannada (ಕನ್ನಡ)',
    'Malayalam (മലയാളം)',
    'Marathi (मराठी)',
    'Gujarati (ગુજરાતી)',
    'Bhojpuri (भोजपुरी)',
    'Assamese (অসমীয়া)',
    'Odia (ଓଡ଼ିଆ)',
    'Urdu (اردو)',
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      {/* 1. Header Hero */}
      <section className="text-center space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-saffronGlow">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>The Talent5 Manifesto</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-display text-slate-900 dark:text-white tracking-tight leading-tight">
          Real Voices. Original Stories. <br />
          <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-teal-600 dark:from-amber-400 dark:via-amber-300 dark:to-teal-300 bg-clip-text text-transparent">
            Desi Talent.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          For decades, the Indian music industry has been monopolized by film soundtracks and commercial labels. Talent5 was founded with a single, uncompromising mission: to build a direct-to-creator digital stage where independent Indian artists retain 100% of their creative rights, earn transparent rewards, and connect directly with millions of passionate listeners.
        </p>
      </section>

      {/* 2. Four Platform Pillars */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
            How Talent5 Transforms the Indian Music Landscape
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
            Engineered from scratch with legal provenance, anti-fraud economics, and advanced audio technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Validated Engagement Economics */}
      <section id="economics" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-500/15 via-white to-teal-500/10 dark:from-amber-950/40 dark:via-midnight-900 dark:to-midnight-950 border border-amber-500/30 shadow-card space-y-6">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs font-bold">
          <Coins className="w-4 h-4 text-amber-500" />
          <span>Fair & Transparent Creator Economics</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
          Why "₹0.10 Per Valid Like" Changes Everything
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
          Traditional global streaming platforms pay fractions of a penny per stream through opaque pooled royalty calculations where 90% of revenues flow to major legacy catalogs. Talent5 pays creators direct engagement rewards for real, authenticated listener admiration.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-midnight-950/80 border border-slate-200 dark:border-white/10">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-display">₹0.10</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">Direct reward per verified, non-bot listener like</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-midnight-950/80 border border-slate-200 dark:border-white/10">
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-display">₹500.00</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">Minimum wallet payout threshold via instant UPI / IMPS</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-midnight-950/80 border border-slate-200 dark:border-white/10">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-display">0% Bot Tolerance</div>
            <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">Multi-vector device fingerprinting & IP velocity auditing</div>
          </div>
        </div>
      </section>

      {/* 4. 13 Indian Languages Coverage */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400">
            <Globe className="w-4 h-4" />
            <span>Pan-Indian Cultural Spectrum</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white">
            Singing in 13 Voices. United in Rhythm.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
            From Baul folk ballads of Bengal to Carnatic fusion in Chennai, and Punjabi drill in Ludhiana.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {languages.map((lang, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/70 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-gray-200 flex items-center justify-center text-center shadow-xs"
            >
              {lang}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Call to Action Banner */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-xl mx-auto">
          <h2 className="text-3xl font-black font-display">
            Ready to Be Part of the Movement?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Whether you are an independent musician releasing your first master or a music lover searching for authentic Desi sounds, Talent5 is your home.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/home">
              <Button variant="primary" size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold">
                Start Listening Free
              </Button>
            </Link>
            <Link href="/creator-studio/apply">
              <Button variant="ghost" size="lg" className="border border-white/20 text-white hover:bg-white/10">
                Apply for Creator Studio
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
