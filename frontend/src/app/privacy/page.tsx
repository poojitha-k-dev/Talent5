'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Database, ArrowRight } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Data Privacy & Security</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
          Last updated: September 12, 2026 • In compliance with Indian Digital Personal Data Protection Act (DPDP), 2023
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
        {/* Section 1 */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            1. Information We Collect
          </h2>
          <p>
            Talent5 collects minimal data required to deliver high-fidelity streaming and creator monetization:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-gray-400">
            <li><strong>Account Information:</strong> Name, username, email address, password hash (encrypted using bcrypt with salt rounds).</li>
            <li><strong>Creator Payment Details:</strong> UPI VPA ID or Bank Account IFSC for payout settlements (stored in encrypted columns).</li>
            <li><strong>Listening & Audio Telemetry:</strong> Play counts, song completion ratios, playlists, and synchronized lyrics scrolling.</li>
            <li><strong>Device & Integrity Signatures:</strong> Hashed IP and device fingerprint signatures used strictly for anti-fraud like validation.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            2. Data Localization & Hosting
          </h2>
          <p>
            In compliance with Indian data sovereignty principles, all core PostgreSQL databases, audio metadata, and user records are stored and processed within secure cloud servers located within the territory of India.
          </p>
        </div>

        {/* Section 3 */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            3. Cookies & Offline Audio Caching
          </h2>
          <p>
            We use browser LocalStorage for theme preferences (`dark` vs `light`), JWT access tokens, and Service Worker Cache (`talent5-cache-v2`) for offline PWA playback of previously cached audio tracks. We do not sell or monetize personal browsing history to third-party ad networks.
          </p>
        </div>

        {/* Section 4 */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            4. Data Grievance Redressal
          </h2>
          <p>
            For any queries regarding your personal data, rights to erasure, or consent withdrawal, contact our Data Protection Officer at <strong>privacy@talent5.com</strong>.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
        >
          <span>Back to Music Platform</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
