'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Music,
  User,
  MapPin,
  Mic2,
  Link2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Radio,
  FileMusic,
  Award,
  Layers,
  Check,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function CreatorApplyPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [existingStatus, setExistingStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [creationIntent, setCreationIntent] = useState<'ORIGINAL_CREATION' | 'VOCAL_SHOWCASE'>('ORIGINAL_CREATION');
  const [performedSongReference, setPerformedSongReference] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [stageName, setStageName] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [category, setCategory] = useState<string>('SINGER');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Hindi']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Sufi & Ghazal']);
  const [experience, setExperience] = useState<string>('');
  const [portfolioUrl, setPortfolioUrl] = useState<string>('');
  const [samplePerformanceUrl, setSamplePerformanceUrl] = useState<string>('');
  const [originalCompositionInfo, setOriginalCompositionInfo] = useState<string>('');
  const [ownershipDeclaration, setOwnershipDeclaration] = useState<boolean>(false);
  const [copyrightDeclaration, setCopyrightDeclaration] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setStageName(user.username || '');
    }
  }, [user]);

  // Check existing application/profile status
  useEffect(() => {
    const checkStatus = async () => {
      if (!token) {
        setLoadingStatus(false);
        return;
      }
      try {
        const res = await fetch('/api/v1/creators/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setExistingStatus(json);
        }
      } catch (e) {
        console.error('Status check error', e);
      } finally {
        setLoadingStatus(false);
      }
    };
    checkStatus();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/creators/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          stageName,
          bio,
          city,
          state,
          category,
          languages: selectedLanguages,
          genres: selectedGenres,
          experience,
          portfolioUrl,
          samplePerformanceUrl,
          originalCompositionInfo:
            creationIntent === 'VOCAL_SHOWCASE'
              ? `Vocal Showcase Rendition: ${performedSongReference || 'Cover performance'} - ${originalCompositionInfo || 'Live singing evaluation'}`
              : originalCompositionInfo || '100% Original Music Composition',
          creationIntent,
          performedSongReference: creationIntent === 'VOCAL_SHOWCASE' ? performedSongReference : null,
          ownershipDeclaration,
          copyrightDeclaration,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Application submission failed');
      }

      // Reload status
      setExistingStatus({
        isCreator: false,
        application: json.data,
      });
      setStep(6); // Completion step
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-teal-600 dark:text-teal-400 mx-auto" />
        <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white">
          Join the Desi Creator Program
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Please log in to submit your audition, publish original music, and earn verified rewards.
        </p>
      </div>
    );
  }

  // If already an approved creator
  if (existingStatus?.isCreator) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white">
            You Are an Approved Desi Creator!
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Your stage profile <span className="text-teal-600 dark:text-teal-400 font-bold">{existingStatus.profile?.stageName}</span> is verified and eligible for validated engagement rewards.
          </p>
        </div>
        <Link href="/creator-studio">
          <Button variant="peacock" size="lg" className="font-bold">
            Enter Creator Studio
          </Button>
        </Link>
      </div>
    );
  }

  // If already submitted and pending
  if (existingStatus?.application && existingStatus.application.status === 'PENDING' && step !== 6) {
    const isVocal = existingStatus.application.creationIntent === 'VOCAL_SHOWCASE';
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6 rounded-3xl p-8 bg-white/80 dark:bg-zinc-900/60 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase">
              Audition Status: Under Review
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                isVocal
                  ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
                  : 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30'
              }`}
            >
              {isVocal ? '🎤 Vocal Showcase Path' : '🌟 100% Original Music'}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white">
            Your Creator Audition is Being Evaluated
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Submitted for stage name <span className="text-zinc-900 dark:text-white font-semibold">{existingStatus.application.stageName}</span> on{' '}
            {new Date(existingStatus.application.createdAt).toLocaleDateString()}.
            Our automated AI Plagiarism Sentinel and A&R content team are inspecting your audition tape for acoustic fidelity, pitch stability, and copyright compliance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-500/30 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Talent5 Creator Audition Gateway</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-zinc-900 dark:text-white tracking-tight">
          Apply to Become an Approved Desi Creator
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
          Choose whether you are releasing 100% original music or showcasing your vocal talent. Our AI Sentinel model evaluates your audition accordingly.
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {[
          { num: 1, label: 'Track Intent' },
          { num: 2, label: 'Identity' },
          { num: 3, label: 'Artistry' },
          { num: 4, label: 'Audition' },
          { num: 5, label: 'Rights' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s.num
                  ? 'bg-teal-600 text-white shadow-md'
                  : step > s.num
                  ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-zinc-500 dark:text-zinc-400 border border-black/10 dark:border-white/10'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`text-[11px] sm:text-xs font-medium hidden md:inline ${
                step === s.num
                  ? 'text-zinc-900 dark:text-white font-bold'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {s.label}
            </span>
            {s.num < 5 && <div className="w-3 sm:w-6 h-0.5 bg-black/10 dark:bg-white/10" />}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-zinc-900/70 border border-black/10 dark:border-white/10 shadow-2xl backdrop-blur-md">
        {error && (
          <div className="p-3 mb-6 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========================================================= */}
          {/* STEP 1: CHOOSE YOUR CREATOR TRACK / PATH (INTENT) */}
          {/* ========================================================= */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-black/10 dark:border-white/10 pb-3">
                <h3 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
                  1. Select Your Creator Path
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Please choose how you want to audition. Talent5 uses an AI Plagiarism & Vocal Sentinel model to audit applications — selecting the right path ensures your audio is evaluated accurately.
                </p>
              </div>

              {/* 2 DISTINCT COLUMNS FOR APPLICANTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* COLUMN 1: 100% ORIGINAL MUSIC (EVERYTHING NEW) */}
                <div
                  onClick={() => setCreationIntent('ORIGINAL_CREATION')}
                  className={`cursor-pointer rounded-3xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between ${
                    creationIntent === 'ORIGINAL_CREATION'
                      ? 'bg-gradient-to-b from-teal-500/10 via-teal-500/5 to-transparent border-teal-500 shadow-xl shadow-teal-500/10 ring-2 ring-teal-500/30'
                      : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/10 dark:border-white/10 hover:border-teal-500/40'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-300 flex items-center justify-center border border-teal-500/30">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                            Path A • Everything New
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          creationIntent === 'ORIGINAL_CREATION'
                            ? 'border-teal-500 bg-teal-500 text-white'
                            : 'border-black/20 dark:border-white/20 bg-black/5 dark:bg-black/40'
                        }`}
                      >
                        {creationIntent === 'ORIGINAL_CREATION' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                        100% Original Music Creator
                      </h4>
                      <p className="text-xs text-teal-600 dark:text-teal-300 font-semibold mt-0.5">
                        Composers • Songwriters • Music Producers
                      </p>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      You create everything from scratch. You write original lyrics, compose original melodies, or produce new beats and full musical compositions.
                    </p>

                    <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-2 text-[11px]">
                      <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>AI Plagiarism Checker Policy:</span>
                      </div>
                      <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 list-disc list-inside text-[11px] leading-relaxed">
                        <li>AI scans against 100+ commercial catalog tracks.</li>
                        <li>Requires 0% copyright matches & unique melodic progression.</li>
                        <li>Eligible for Master Rights streaming royalties and awards.</li>
                        <li className="text-amber-600 dark:text-amber-300 font-medium">
                          ⚠️ Copying melodies from released songs will trigger a plagiarism warning.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Master Rights:</span>
                    <span className="text-teal-600 dark:text-teal-300 font-bold">100% Exclusive Ownership</span>
                  </div>
                </div>

                {/* COLUMN 2: VOCAL & SINGING SHOWCASE */}
                <div
                  onClick={() => setCreationIntent('VOCAL_SHOWCASE')}
                  className={`cursor-pointer rounded-3xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between ${
                    creationIntent === 'VOCAL_SHOWCASE'
                      ? 'bg-gradient-to-b from-purple-500/10 via-purple-500/5 to-transparent border-purple-500 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/30'
                      : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/10 dark:border-white/10 hover:border-purple-500/40'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-500/30">
                          <Mic2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            Path B • Voice & Vocals
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          creationIntent === 'VOCAL_SHOWCASE'
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : 'border-black/20 dark:border-white/20 bg-black/5 dark:bg-black/40'
                        }`}
                      >
                        {creationIntent === 'VOCAL_SHOWCASE' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                        Vocal & Singing Showcase
                      </h4>
                      <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold mt-0.5">
                        Vocalists • Singers • Acoustic Performers
                      </p>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      You want to showcase your singing talent, vocal tone, emotional range, and live voice (performing either an original song or a live acoustic cover of a released song).
                    </p>

                    <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-2 text-[11px]">
                      <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <FileMusic className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>AI Plagiarism Checker Policy:</span>
                      </div>
                      <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 list-disc list-inside text-[11px] leading-relaxed">
                        <li>Covers of released songs are completely allowed!</li>
                        <li>AI identifies the song and verifies authentic live human singing.</li>
                        <li>Evaluates pitch stability, breath control & dynamic range.</li>
                        <li className="text-rose-600 dark:text-rose-300 font-medium">
                          🚫 No lip-syncing or playing the studio recording as your voice.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Opportunity:</span>
                    <span className="text-purple-600 dark:text-purple-300 font-bold">Playback & Vocal Collabs</span>
                  </div>
                </div>
              </div>

              {/* Selection Summary Callout */}
              <div
                className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
                  creationIntent === 'ORIGINAL_CREATION'
                    ? 'bg-teal-500/10 border-teal-500/20 text-teal-900 dark:text-teal-200'
                    : 'bg-purple-500/10 border-purple-500/20 text-purple-900 dark:text-purple-200'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-black/[0.04] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  {creationIntent === 'ORIGINAL_CREATION' ? (
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-300" />
                  ) : (
                    <Mic2 className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                  )}
                </div>
                <div>
                  <strong className="block text-zinc-900 dark:text-white font-semibold">
                    {creationIntent === 'ORIGINAL_CREATION'
                      ? 'You are applying as: 100% Original Music Creator (Everything New)'
                      : 'You are applying as: Vocal & Singing Showcase'}
                  </strong>
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-300">
                    {creationIntent === 'ORIGINAL_CREATION'
                      ? 'The AI model will check that your composition has 0% plagiarism against existing released songs.'
                      : 'The AI model will allow cover renditions, identify the song, and focus on verifying your live human singing talent.'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="peacock"
                  size="md"
                  onClick={() => setStep(2)}
                  className="gap-2 font-bold px-6"
                >
                  Continue to Personal Identity <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 2: IDENTITY */}
          {/* ========================================================= */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white border-b border-black/10 dark:border-white/10 pb-2">
                2. Personal & Stage Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Legal Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kabir Sen"
                    className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Creator / Stage Name
                  </label>
                  <input
                    type="text"
                    required
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="e.g. Kabir Sen Music or Pooja Vocals"
                    className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Creator Bio
                </label>
                <textarea
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your musical journey, vocal style, instruments, and musical influences..."
                  className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Jaipur"
                    className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Rajasthan"
                    className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" size="md" onClick={() => setStep(1)} className="gap-2 text-zinc-700 dark:text-zinc-300">
                  <ArrowLeft className="w-4 h-4" /> Back to Track Selection
                </Button>
                <Button
                  type="button"
                  variant="peacock"
                  size="md"
                  onClick={() => {
                    if (!fullName || !stageName || !bio || !city || !state) {
                      setError('Please fill out all identity fields before continuing.');
                      return;
                    }
                    setError(null);
                    setStep(3);
                  }}
                  className="gap-2 font-bold"
                >
                  Continue to Artistry <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3: ARTISTRY & CLASSIFICATION */}
          {/* ========================================================= */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white border-b border-black/10 dark:border-white/10 pb-2">
                3. Musical Classification
              </h3>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Primary Discipline
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-teal-500 cursor-pointer shadow-xs"
                >
                  <option value="SINGER">Singer-Songwriter (Vocalist / Composer)</option>
                  <option value="RAPPER">Rapper / Hip-Hop MC</option>
                  <option value="FOLK">Regional Folk Innovator</option>
                  <option value="CLASSICAL">Classical Indian Vocalist</option>
                  <option value="INSTRUMENTAL">Instrumental Performer (Sitar, Tabla, Flute, Violin)</option>
                  <option value="PRODUCER">Music Producer / Beatmaker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Languages You Sing/Perform In
                </label>
                <input
                  type="text"
                  value={selectedLanguages.join(', ')}
                  onChange={(e) => setSelectedLanguages(e.target.value.split(',').map((s) => s.trim()))}
                  placeholder="e.g. Hindi, Telugu, Punjabi, Urdu"
                  className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Separate multiple languages with commas.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Genres
                </label>
                <input
                  type="text"
                  value={selectedGenres.join(', ')}
                  onChange={(e) => setSelectedGenres(e.target.value.split(',').map((s) => s.trim()))}
                  placeholder="e.g. Sufi & Ghazal, Acoustic & Unplugged, Bollywood"
                  className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Performance Experience
                </label>
                <textarea
                  rows={2}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 3 years performing acoustic live gigs, sang college competitions, released independent singles..."
                  className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" size="md" onClick={() => setStep(2)} className="gap-2 text-zinc-700 dark:text-zinc-300">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  type="button"
                  variant="peacock"
                  size="md"
                  onClick={() => setStep(4)}
                  className="gap-2 font-bold"
                >
                  Continue to Audition <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: AUDITION & PORTFOLIO */}
          {/* ========================================================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-black/10 dark:border-white/10 pb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white">
                  4. Sample Audition & Media Link
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    creationIntent === 'VOCAL_SHOWCASE'
                      ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30'
                      : 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30'
                  }`}
                >
                  {creationIntent === 'VOCAL_SHOWCASE' ? '🎤 Vocal Showcase Path' : '🌟 100% Original Music'}
                </span>
              </div>

              {/* Conditional Song Reference Field for Vocal Showcase */}
              {creationIntent === 'VOCAL_SHOWCASE' ? (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                  <label className="block text-xs font-bold text-purple-800 dark:text-purple-300">
                    Song You Are Performing (Cover Title & Original Artist)
                  </label>
                  <input
                    type="text"
                    value={performedSongReference}
                    onChange={(e) => setPerformedSongReference(e.target.value)}
                    placeholder="e.g. Kesariya (Arijit Singh / Pritam) or Tum Bin Mann Kaha (Kabir Sen)"
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-purple-500/30 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 placeholder-zinc-400 dark:placeholder-zinc-500"
                  />
                  <p className="text-[11px] text-purple-800/80 dark:text-purple-200/80">
                    If this is a cover of a released song, mention the title and artist here. Our AI Plagiarism Sentinel will recognize the composition and evaluate your live singing technique without flagging a false copyright violation.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-2">
                  <label className="block text-xs font-bold text-teal-800 dark:text-teal-300">
                    Original Composition & Production Details
                  </label>
                  <textarea
                    rows={2}
                    value={originalCompositionInfo}
                    onChange={(e) => setOriginalCompositionInfo(e.target.value)}
                    placeholder="e.g. Original acoustic melody in D Minor composed by me, lyrics written in Hindi/Punjabi, recorded with live acoustic guitar..."
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950 border border-teal-500/30 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-teal-500 placeholder-zinc-400 dark:placeholder-zinc-500"
                  />
                  <p className="text-[11px] text-teal-800/80 dark:text-teal-200/80">
                    Confirm your original composition. The AI model will verify 0% plagiarism against our catalog and fingerprint databases.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Sample Performance Audio / Video URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={samplePerformanceUrl}
                  onChange={(e) => setSamplePerformanceUrl(e.target.value)}
                  placeholder="https://cdn.freesound.org/... or YouTube/Drive public link"
                  className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Provide a direct MP3/WAV audio link or public video link for AI acoustic inspection and human A&R auditioning.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Portfolio / Instagram / YouTube Profile
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://instagram.com/yourname or https://youtube.com/@channel"
                  className="w-full px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" size="md" onClick={() => setStep(3)} className="gap-2 text-zinc-700 dark:text-zinc-300">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  type="button"
                  variant="peacock"
                  size="md"
                  onClick={() => {
                    if (!samplePerformanceUrl) {
                      setError('Please provide a sample performance URL for your audition.');
                      return;
                    }
                    setError(null);
                    setStep(5);
                  }}
                  className="gap-2 font-bold"
                >
                  Continue to Declarations <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 5: RIGHTS & LEGAL DECLARATIONS */}
          {/* ========================================================= */}
          {step === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold font-display text-zinc-900 dark:text-white border-b border-black/10 dark:border-white/10 pb-2">
                5. Rights & Copyright Compliance Declarations
              </h3>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Talent5 Rights-First Commitment</span>
                </div>
                <p className="leading-relaxed">
                  Talent5 is a strictly legitimate music platform. We do not accept pirated master files or uncredited commercial tracks. Our automated AI Plagiarism Sentinel protects artists against copyright theft and ensures rewards are distributed honestly.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={ownershipDeclaration}
                    onChange={(e) => setOwnershipDeclaration(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <strong className="text-zinc-900 dark:text-white">
                      {creationIntent === 'ORIGINAL_CREATION'
                        ? '100% Original Master Ownership Declaration: '
                        : 'Authentic Vocal Performance Declaration: '}
                    </strong>
                    {creationIntent === 'ORIGINAL_CREATION'
                      ? 'I declare that all lyrics, melodies, vocals, and musical compositions submitted are 100% original works created and owned by me, and do not infringe on any third-party copyright.'
                      : 'I declare that the singing and vocals submitted in this audition are performed live by me as an authentic human vocalist, and are not a lip-synced or cloned playback of another artist’s master recording.'}
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={copyrightDeclaration}
                    onChange={(e) => setCopyrightDeclaration(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                  />
                  <span className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <strong className="text-zinc-900 dark:text-white">Copyright & Anti-Fraud Compliance: </strong>
                    I understand that artificial engagement, like bot farms, or uploading uncredited copyrighted audio will result in immediate suspension, fraud deductions, and forfeiture of wallet balances.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-6 border-t border-black/10 dark:border-white/10">
                <Button type="button" variant="ghost" size="md" onClick={() => setStep(4)} className="gap-2 text-zinc-700 dark:text-zinc-300">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  type="submit"
                  variant="peacock"
                  size="lg"
                  disabled={!ownershipDeclaration || !copyrightDeclaration || submitting}
                  isLoading={submitting}
                  className="font-bold px-8"
                >
                  Submit Creator Application
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 6: CONFIRMATION */}
          {/* ========================================================= */}
          {step === 6 && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-white">
                  Audition Submitted Successfully!
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 text-teal-700 dark:text-teal-300">
                  <span>Selected Track:</span>
                  <strong className="text-zinc-900 dark:text-white">
                    {creationIntent === 'VOCAL_SHOWCASE'
                      ? '🎤 Vocal & Singing Showcase'
                      : '🌟 100% Original Music (Everything New)'}
                  </strong>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed pt-2">
                  Thank you, <span className="text-teal-600 dark:text-teal-400 font-semibold">{stageName}</span>. Your audition has been logged and our automated AI Plagiarism Sentinel has initiated acoustic inspection. Talent5 moderators will review your report within 24-48 hours.
                </p>
              </div>
              <Link href="/">
                <Button variant="primary" size="md">
                  Return to Home
                </Button>
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
