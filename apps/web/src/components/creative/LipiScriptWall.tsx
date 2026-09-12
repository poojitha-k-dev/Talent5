'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Sparkles } from 'lucide-react';

interface LanguageScript {
  code: string;
  name: string;
  script: string;
  greeting: string;
  state: string;
  count: string;
}

const LANGUAGES: LanguageScript[] = [
  { code: 'hindi', name: 'Hindi', script: 'हिन्दी', greeting: 'नमस्ते', state: 'North & Central India', count: '1,400+ tracks' },
  { code: 'punjabi', name: 'Punjabi', script: 'ਪੰਜਾਬੀ', greeting: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ', state: 'Punjab & Global Diaspora', count: '980+ tracks' },
  { code: 'tamil', name: 'Tamil', script: 'தமிழ்', greeting: 'வணக்கம்', state: 'Tamil Nadu & Carnatic', count: '850+ tracks' },
  { code: 'telugu', name: 'Telugu', script: 'తెలుగు', greeting: 'నమస్కారం', state: 'Andhra Pradesh & Telangana', count: '780+ tracks' },
  { code: 'bengali', name: 'Bengali', script: 'বাংলা', greeting: 'নমস্কার', state: 'Bengal & Baul Folk', count: '620+ tracks' },
  { code: 'kannada', name: 'Kannada', script: 'ಕನ್ನಡ', greeting: 'ನಮಸ್ಕಾರ', state: 'Karnataka & Mysore', count: '450+ tracks' },
  { code: 'malayalam', name: 'Malayalam', script: 'മലയാളം', greeting: 'നമസ്കാരം', state: 'Kerala Backwaters', count: '520+ tracks' },
  { code: 'marathi', name: 'Marathi', script: 'मराठी', greeting: 'नमस्कार', state: 'Maharashtra & Lavani', count: '410+ tracks' },
  { code: 'gujarati', name: 'Gujarati', script: 'ગુજરાતી', greeting: 'નમસ્તે', state: 'Gujarat & Garba Folk', count: '340+ tracks' },
];

export const LipiScriptWall: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
            13 Regional Lipis & Desi Dialects
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-gray-400">
          Click any regional script to discover authentic grassroots masters
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        {LANGUAGES.map((lang) => (
          <Link
            key={lang.code}
            href={`/music?language=${encodeURIComponent(lang.name)}`}
            className="p-3.5 rounded-2xl bg-white/70 dark:bg-midnight-900/60 hover:bg-white dark:hover:bg-midnight-800 border border-slate-200 dark:border-white/10 hover:border-amber-500/50 transition-all duration-300 flex flex-col items-center justify-center text-center group shadow-sm hover:shadow-md hover:-translate-y-1"
          >
            <span className="font-display font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {lang.script}
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-gray-300 mt-1">
              {lang.name}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400/80 font-medium">
              "{lang.greeting}"
            </span>
            <span className="text-[9px] text-slate-400 dark:text-gray-500 mt-1">
              {lang.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
