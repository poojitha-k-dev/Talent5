'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Scale,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Lock,
  ArrowRight,
} from 'lucide-react';

export default function RightsPage() {
  const licenseTypes = [
    {
      code: 'CREATOR_OWNED',
      name: 'Creator-Owned Master (Default)',
      desc: 'The artist maintains 100% legal ownership of master recordings and underlying musical works. Talent5 is granted a non-exclusive, revocable streaming license.',
    },
    {
      code: 'DIRECT_LICENSED',
      name: 'Direct Publisher / Label Deed',
      desc: 'Formally cleared through an executed bilateral licensing deed with recognized Indian indie record labels, publisher societies, and rights aggregators.',
    },
    {
      code: 'TALENT5_OWNED',
      name: 'Talent5 Commissioned Original',
      desc: 'Works commissioned, financed, or co-produced by Talent5 Studios with full worldwide perpetual digital distribution rights and statutory royalty sharing.',
    },
    {
      code: 'OPEN_LICENSE',
      name: 'Creative Commons / Open Desi Sound',
      desc: 'Music released under open culture licenses allowing non-commercial remixing, study, and karaoke derivative generation with mandatory creator attribution.',
    },
    {
      code: 'PUBLIC_DOMAIN',
      name: 'Classical & Traditional Heritage',
      desc: 'Centuries-old folk songs, traditional bandishes, and public domain compositions where underlying copyrights have expired under Indian statutory law.',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Statutory Provenance & Legal Assurance</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-display text-slate-900 dark:text-white tracking-tight">
          Copyright, Rights Provenance & Compliance Policy
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Talent5 operates under strict copyright provenance to ensure every track, lyric, and performance is 100% legally cleared under the Indian Copyright Act, 1957.
        </p>
      </div>

      {/* 1. Indian Copyright Act 1957 Compliance */}
      <section id="act1957" className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-midnight-900/60 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold font-display text-lg">
          <Scale className="w-5 h-5 text-amber-500" />
          <h2>Compliance with the Indian Copyright Act, 1957</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
          Talent5 is committed to statutory compliance under Section 31D (Statutory license for broadcasting of literary and musical works and sound recording) and Section 52 (Permitted acts) of the Copyright Act, 1957 (as amended). Every creator publishing through Talent5 warrants that:
        </p>
        <ul className="space-y-2 text-xs text-slate-600 dark:text-gray-400 pl-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>They are the sole original author, composer, lyricist, or authorized rights-holder of the master recording.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>The sound recording does not sample or infringe upon unauthorized third-party commercial compositions or film soundtracks.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>All guest performers, instrumentalists, and featured vocalists have executed explicit digital clearance deeds.</span>
          </li>
        </ul>
      </section>

      {/* 2. Supported Licensing Schema */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
          Our Schema-Enforced License Categories
        </h2>
        <div className="space-y-3">
          {licenseTypes.map((lic) => (
            <div
              key={lic.code}
              className="p-5 rounded-2xl bg-white/80 dark:bg-midnight-900/40 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {lic.name}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                    {lic.code}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                  {lic.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Notice & Takedown Procedure */}
      <section id="takedown" className="p-6 sm:p-8 rounded-3xl bg-rose-500/10 dark:bg-rose-950/20 border border-rose-500/30 space-y-4">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold font-display text-lg">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <h2>Notice & Takedown Policy (DMCA / Indian IP Infringement)</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
          If you believe in good faith that any content hosted on Talent5 infringes your copyright or related moral rights, please submit a formal takedown request to our designated Grievance Officer:
        </p>

        <div className="p-4 rounded-2xl bg-white/90 dark:bg-midnight-950/90 border border-rose-500/20 text-xs space-y-1.5 font-mono">
          <p className="font-bold text-slate-900 dark:text-white">Grievance & Copyright Officer: Talent5 Legal Directorate</p>
          <p className="text-slate-600 dark:text-gray-300">Email: legal@talent5.com / copyright@talent5.com</p>
          <p className="text-slate-500 dark:text-gray-400">Response SLA: Within 24 Business Hours</p>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-gray-400">
          Please include: (1) identification of the copyrighted work, (2) exact URL/songId on Talent5, (3) documentation proving rights ownership, and (4) a signed declaration of accuracy.
        </p>
      </section>

      {/* Back to Home */}
      <div className="text-center pt-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
        >
          <span>Return to Discover Feed</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
