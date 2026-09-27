'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
          <FileText className="w-4 h-4" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight">
          Terms of Service & Creator Deed
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
          Last updated: September 12, 2026 • Governed by the Laws of the Republic of India
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
        {/* Section 1 */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By creating an account, browsing catalog tracks, or publishing music on Talent5, you agree to be bound by these Terms of Service. If you do not agree with any provision, please do not use the platform.
          </p>
        </div>

        {/* Section 2 */}
        <div id="creator-deeds" className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            2. Creator Deed & Music Publishing Rights
          </h2>
          <p>
            When publishing content to Talent5 Creator Studio:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-gray-400">
            <li>You grant Talent5 a worldwide, non-exclusive license to stream, transcode, display metadata, and index your tracks.</li>
            <li>You retain 100% of your underlying copyright, master recording rights, and moral rights.</li>
            <li>You warrant that all compositions, lyrics, and instrumental tracks are original works or cleared under documented licenses.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            3. Creator Economics & Payout Conditions
          </h2>
          <p>
            Talent5 calculates creator earnings based on verified, non-fraudulent listener likes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-gray-400">
            <li><strong>Reward Rate:</strong> ₹0.10 per validated like (subject to platform dynamic economics).</li>
            <li><strong>Minimum Withdrawal:</strong> Earnings are transferable to Indian bank accounts / UPI once the available balance reaches ₹500.00.</li>
            <li><strong>Anti-Fraud Disqualification:</strong> Bot traffic, like-trading rings, self-likes, and VPN velocity spikes are automatically discarded. Accounts engaging in repeat manipulation will be suspended and forfeits pending balances.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            4. Tournament Rules & Fair Play
          </h2>
          <p>
            Competitions and prize pools are open to verified Indian creators. Community voting is monitored through voter fingerprint verification. Cash prizes are disbursed subject to applicable Indian tax deductions at source (TDS under section 194B/194BA).
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
