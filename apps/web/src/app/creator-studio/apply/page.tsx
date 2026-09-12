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
          originalCompositionInfo,
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
      setStep(5); // Completion step
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-teal-400 mx-auto" />
        <h2 className="text-2xl font-bold font-display text-white">Join the Desi Creator Program</h2>
        <p className="text-sm text-gray-400">
          Please log in to submit your audition, publish original music, and earn verified rewards.
        </p>
      </div>
    );
  }

  // If already an approved creator
  if (existingStatus?.isCreator) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-white">
            You Are an Approved Desi Creator!
          </h2>
          <p className="text-sm text-gray-300">
            Your stage profile <span className="text-teal-400 font-bold">{existingStatus.profile?.stageName}</span> is verified and eligible for validated engagement rewards.
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
  if (existingStatus?.application && existingStatus.application.status === 'PENDING' && step !== 5) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6 glass-panel rounded-3xl p-8 border border-white/10">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
            Audition Status: Under Review
          </span>
          <h2 className="text-2xl font-bold font-display text-white">
            Your Creator Audition is Being Evaluated
          </h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Submitted for stage name <span className="text-white font-semibold">{existingStatus.application.stageName}</span> on{' '}
            {new Date(existingStatus.application.createdAt).toLocaleDateString()}.
            Our content team evaluates audition links for audio quality and original composition rights within 24-48 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Talent5 Creator Application</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          Apply to Become an Approved Desi Creator
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
          Publish your original tracks, protect your master rights, compete in tournaments, and earn verified engagement rewards.
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center justify-center gap-3">
        {[
          { num: 1, label: 'Identity' },
          { num: 2, label: 'Artistry' },
          { num: 3, label: 'Audition' },
          { num: 4, label: 'Rights' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s.num
                  ? 'bg-teal-500 text-midnight-950 shadow-peacockGlow'
                  : step > s.num
                  ? 'bg-midnight-700 text-teal-300 border border-teal-500/40'
                  : 'bg-midnight-800 text-gray-500 border border-white/10'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${step === s.num ? 'text-white' : 'text-gray-500'}`}>
              {s.label}
            </span>
            {s.num < 4 && <div className="w-6 sm:w-10 h-0.5 bg-white/10" />}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
        {error && (
          <div className="p-3 mb-6 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display text-white border-b border-white/10 pb-2">
                1. Personal & Stage Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Legal Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kabir Sen"
                    className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Creator / Stage Name</label>
                  <input
                    type="text"
                    required
                    value={stageName}
                    onChange={(e) => setStageName(e.target.value)}
                    placeholder="e.g. Kabir Sen Music"
                    className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Creator Bio</label>
                <textarea
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your musical journey, vocal style, and musical influences..."
                  className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Jaipur"
                    className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Rajasthan"
                    className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
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
                    setStep(2);
                  }}
                  className="gap-2 font-bold"
                >
                  Continue to Artistry <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: ARTISTRY & CLASSIFICATION */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display text-white border-b border-white/10 pb-2">
                2. Musical Classification
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Primary Discipline</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500 cursor-pointer"
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
                <label className="block text-xs font-medium text-gray-300 mb-1">Languages You Sing/Perform In</label>
                <input
                  type="text"
                  value={selectedLanguages.join(', ')}
                  onChange={(e) => setSelectedLanguages(e.target.value.split(',').map((s) => s.trim()))}
                  placeholder="e.g. Hindi, Telugu, Urdu"
                  className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">Separate multiple languages with commas.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Genres</label>
                <input
                  type="text"
                  value={selectedGenres.join(', ')}
                  onChange={(e) => setSelectedGenres(e.target.value.split(',').map((s) => s.trim()))}
                  placeholder="e.g. Sufi & Ghazal, Acoustic & Unplugged"
                  className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Performance Experience</label>
                <textarea
                  rows={2}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 4 years performing acoustic gigs, released 2 independent singles..."
                  className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" size="md" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  type="button"
                  variant="peacock"
                  size="md"
                  onClick={() => setStep(3)}
                  className="gap-2 font-bold"
                >
                  Continue to Audition <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: AUDITION & PORTFOLIO */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-display text-white border-b border-white/10 pb-2">
                3. Sample Audition & Media
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Sample Performance Audio / Video URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={samplePerformanceUrl}
                  onChange={(e) => setSamplePerformanceUrl(e.target.value)}
                  placeholder="https://cdn.freesound.org/... or YouTube/Drive link"
                  className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Provide a direct link to an original acoustic performance, rap cipher, or vocal track.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Portfolio / Website Link</label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourname.music"
                  className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Original Composition Details</label>
                <textarea
                  rows={2}
                  value={originalCompositionInfo}
                  onChange={(e) => setOriginalCompositionInfo(e.target.value)}
                  placeholder="Describe your original songwriting, instruments used, or beat production process..."
                  className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" size="md" onClick={() => setStep(2)} className="gap-2">
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
                    setStep(4);
                  }}
                  className="gap-2 font-bold"
                >
                  Continue to Declarations <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: RIGHTS & LEGAL DECLARATIONS */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold font-display text-white border-b border-white/10 pb-2">
                4. Rights & Copyright Compliance Declarations
              </h3>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Talent5 Rights-First Commitment</span>
                </div>
                <p>
                  Talent5 is a strictly legitimate music platform. We do not accept pirated tracks, copyrighted commercial karaoke backing files, or unlicensed samples. All creator rewards are paid strictly for 100% verified original master and publishing compositions.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={ownershipDeclaration}
                    onChange={(e) => setOwnershipDeclaration(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-teal-500 focus:ring-teal-500 accent-teal-500"
                  />
                  <span className="text-xs text-gray-300">
                    <strong className="text-white">100% Original Master Ownership:</strong> I declare that all musical performances, vocals, lyrics, and compositions submitted are original works owned by me or properly licensed for commercial streaming and monetization.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={copyrightDeclaration}
                    onChange={(e) => setCopyrightDeclaration(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-teal-500 focus:ring-teal-500 accent-teal-500"
                  />
                  <span className="text-xs text-gray-300">
                    <strong className="text-white">Copyright & Anti-Fraud Compliance:</strong> I understand that artificial engagement, like farms, or uploading uncredited copyrighted material will result in immediate suspension, fraud deductions, and forfeiture of wallet balances.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-6 border-t border-white/10">
                <Button type="button" variant="ghost" size="md" onClick={() => setStep(3)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  type="submit"
                  variant="peacock"
                  size="lg"
                  disabled={!ownershipDeclaration || !copyrightDeclaration || submitting}
                  isLoading={submitting}
                  className="font-bold text-midnight-950 px-8"
                >
                  Submit Creator Application
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION */}
          {step === 5 && (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-display text-white">
                  Application Submitted Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto">
                  Thank you, <span className="text-teal-400 font-semibold">{stageName}</span>. Your application is now in our moderation queue. You will receive an in-app notice when verified.
                </p>
              </div>
              <Link href="/home">
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
