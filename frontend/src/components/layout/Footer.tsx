'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Music,
  Sparkles,
  ShieldCheck,
  Shield,
  Heart,
  Globe,
  ArrowRight,
  CheckCircle2,
  Mail,
  Disc3,
  Award,
  Mic,
  Coins,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Do not render consumer footer on Admin pages or dedicated auth routes if preferred
  if (pathname.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  // Render minimal, compact editorial footer on landing page
  if (pathname === '/') {
    return (
      <footer
        className="w-full border-t border-white/10 pt-10 pb-24 px-6 sm:px-8 lg:px-12 relative z-20"
        style={{ background: 'rgba(6,5,10,0.38)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-10 items-start">

            {/* Brand column */}
            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-2 mb-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-white">
                  TALENT<span className="text-amber-500">5</span>
                </span>
              </Link>
              <p className="font-serif italic text-sm text-white/60 leading-snug">
                &ldquo;Real voices. Original stories.&rdquo;
              </p>
              <p className="text-[11px] text-white/40 mt-2 max-w-xs">
                A quiet place to discover loud talent.
              </p>
            </div>

            {/* Explore column */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">
                Explore
              </p>
              <ul className="space-y-2 text-xs text-white/55">
                <li><Link href="/home" className="hover:text-amber-400 transition-colors">Discover</Link></li>
                <li><Link href="/music" className="hover:text-amber-400 transition-colors">Music</Link></li>
                <li><Link href="/desi" className="hover:text-amber-400 transition-colors">Desi Music</Link></li>
                <li><Link href="/music" className="hover:text-amber-400 transition-colors">Artists</Link></li>
              </ul>
            </div>

            {/* Creators column */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">
                Creators
              </p>
              <ul className="space-y-2 text-xs text-white/55">
                <li><Link href="/creator-studio/apply" className="hover:text-amber-400 transition-colors">Become a Creator</Link></li>
                <li><Link href="/creator-studio" className="hover:text-amber-400 transition-colors">Creator Studio</Link></li>
                <li><Link href="/about" className="hover:text-amber-400 transition-colors">Support</Link></li>
              </ul>
            </div>

            {/* Company column */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">
                Company
              </p>
              <ul className="space-y-2 text-xs text-white/55">
                <li><Link href="/about" className="hover:text-amber-400 transition-colors">About</Link></li>
                <li><Link href="/about#contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
                <li><Link href="/about#careers" className="hover:text-amber-400 transition-colors">Careers</Link></li>
                <li><Link href="/admin/login" className="hover:text-rose-400 transition-colors flex items-center gap-1"><Shield className="w-3 h-3 text-rose-400" /><span>Admin Portal</span></Link></li>
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-white mb-3">
                Legal
              </p>
              <ul className="space-y-2 text-xs text-white/55">
                <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms</Link></li>
                <li><Link href="/rights" className="hover:text-amber-400 transition-colors">Copyright</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/35">
            <p>© 2026 Talent5. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <Link href="/rights" className="hover:text-amber-400 transition-colors">Copyright Policy</Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Notice</Link>
              <span>·</span>
              <Link href="/admin/login" className="hover:text-rose-400 transition-colors text-white/50">Admin Access</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setNewsletterEmail('');
    }
  };

  const languages = [
    'Hindi',
    'Punjabi',
    'Tamil',
    'Telugu',
    'Bengali',
    'Kannada',
    'Malayalam',
    'Marathi',
    'Gujarati',
    'Bhojpuri',
    'Assamese',
    'Odia',
    'Urdu',
  ];

  return (
    <footer className="w-full border-t border-amber-500/15 dark:border-white/10 bg-gradient-to-b from-white/90 via-slate-50 to-amber-50/40 dark:from-midnight-950 dark:via-midnight-900 dark:to-midnight-950 text-slate-700 dark:text-gray-300 transition-colors duration-300 relative z-20 pb-28 sm:pb-24">
      {/* 1. Regional Languages Strip */}
      <div className="border-b border-amber-500/10 dark:border-white/5 py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
            <Globe className="w-4 h-4 text-amber-500" />
            <span>13 Official Desi Languages:</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {languages.map((lang) => (
              <Link
                key={lang}
                href={`/music?language=${encodeURIComponent(lang)}`}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white dark:bg-midnight-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-400 dark:hover:text-slate-950 border border-slate-200 dark:border-white/10 transition-colors shadow-xs"
              >
                {lang}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand & Sargam Heritage */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-teal-400 flex items-center justify-center p-0.5 shadow-saffronGlow group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white dark:bg-midnight-950 rounded-[10px] flex items-center justify-center">
                  <Music className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                  TALENT<span className="text-amber-500">5</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Desi
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed max-w-sm">
              <strong>Real Voices. Original Stories. Desi Talent.</strong>
              <br />
              India’s premier music streaming and independent artist discovery platform celebrating authentic grassroots creators across classical ragas, folk traditions, and street cyphers.
            </p>

            {/* Sargam Badges */}
            <div className="flex items-center gap-1.5 pt-1">
              {['सा', 'रे', 'ग', 'म', 'प', 'ध', 'नि'].map((sargam) => (
                <span
                  key={sargam}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-midnight-900 border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs select-none"
                >
                  {sargam}
                </span>
              ))}
            </div>

            {/* Newsletter Input */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                Join the Desi Music Newsletter:
              </p>
              {isSubscribed ? (
                <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  <span>Dhanyavaad! You are subscribed to weekly Desi drops.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 max-w-md">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-midnight-900 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-saffronGlow transition-transform active:scale-95"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Col 2: Platform & Discovery */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-display uppercase tracking-widest text-slate-900 dark:text-white">
              Platform & Audio
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/home" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Discover Feed
                </Link>
              </li>
              <li>
                <Link href="/music" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Full Music Catalog
                </Link>
              </li>
              <li>
                <Link href="/desi" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Desi Originals Hub</span>
                  <Sparkles className="w-3 h-3 text-teal-500" />
                </Link>
              </li>
              <li>
                <Link href="/karaoke" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>AI Singing Lab</span>
                  <Mic className="w-3 h-3 text-purple-500" />
                </Link>
              </li>
              <li>
                <Link href="/competitions" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Tournaments Arena</span>
                  <Award className="w-3 h-3 text-rose-500" />
                </Link>
              </li>
              <li>
                <Link href="/leaderboards" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Audited Leaderboards
                </Link>
              </li>
              <li>
                <Link href="/library" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Your Music Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Creators & Economy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-display uppercase tracking-widest text-slate-900 dark:text-white">
              Creator Movement
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/creator-studio" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Creator Studio Cockpit
                </Link>
              </li>
              <li>
                <Link href="/creator-studio/apply" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>Become a Creator</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-bold">Apply</span>
                </Link>
              </li>
              <li>
                <Link href="/about#economics" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
                  <span>₹0.10 Valid Like Rewards</span>
                  <Coins className="w-3 h-3 text-amber-500" />
                </Link>
              </li>
              <li>
                <Link href="/about#anti-fraud" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Anti-Fraud Heuristics
                </Link>
              </li>
              <li>
                <Link href="/terms#creator-deeds" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Master Rights Deeds
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Creator Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Heritage */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-display uppercase tracking-widest text-slate-900 dark:text-white">
              Heritage & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  About Talent5 Story
                </Link>
              </li>
              <li>
                <Link href="/rights" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Rights Cleared</span>
                </Link>
              </li>
              <li>
                <Link href="/rights#act1957" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Indian Copyright Act 1957
                </Link>
              </li>
              <li>
                <Link href="/rights#takedown" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Notice & Takedown Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Privacy & Data Security
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1.5 font-medium text-rose-500/90">
                  <Shield className="w-3.5 h-3.5 text-rose-500" />
                  <span>Admin Command Center</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Legal & Compliance Statement */}
        <div className="mt-12 pt-8 border-t border-amber-500/10 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>
              Talent5 operates under strict statutory provenance with creator-owned deeds & direct publisher licensing.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/about" className="hover:underline">About</Link>
            <span>•</span>
            <Link href="/rights" className="hover:underline">Copyright</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:underline text-rose-500/90 hover:text-rose-400 font-medium">Admin Portal</Link>
            <span>•</span>
            <span>© 2026 Talent5 Inc. All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
