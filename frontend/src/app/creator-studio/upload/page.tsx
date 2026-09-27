'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Music,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  Eye,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Save,
  Send,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { FileUploadZone } from '@/components/ui/FileUploadZone';
import { formatDuration } from '@talent5/utils';

export default function CreatorUploadWizardPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  // Wizard Step (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Metadata dropdowns
  const [languages, setLanguages] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);

  // Step 1: Audio
  const [audioFileKey, setAudioFileKey] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioFileName, setAudioFileName] = useState<string>('');
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  // Step 2: Song Details
  const [title, setTitle] = useState<string>('');
  const [composer, setComposer] = useState<string>('');
  const [category, setCategory] = useState<string>('SINGER');
  const [languageId, setLanguageId] = useState<string>('1');
  const [genreId, setGenreId] = useState<string>('1');
  const [mood, setMood] = useState<string>('Acoustic');
  const [description, setDescription] = useState<string>('');

  // Step 3: Cover
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [coverFileKey, setCoverFileKey] = useState<string>('');

  // Step 4: Lyrics
  const [lyricsType, setLyricsType] = useState<'plain' | 'timed'>('plain');
  const [lyricsText, setLyricsText] = useState<string>('');
  const [timedLines, setTimedLines] = useState<{ timeSeconds: number; text: string }[]>([
    { timeSeconds: 0, text: '' },
  ]);

  // Step 5: Rights
  const [originalOwnershipDecl, setOriginalOwnershipDecl] = useState<boolean>(false);
  const [noAIVoiceCloneDecl, setNoAIVoiceCloneDecl] = useState<boolean>(false);
  const [termsAgreementDecl, setTermsAgreementDecl] = useState<boolean>(false);

  // Submission Status
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/catalog/home')
      .then((r) => r.json())
      .then((d) => {
        if (d.data) {
          setLanguages(d.data.languages || []);
          setGenres(d.data.genres || []);
        }
      })
      .catch(console.error);
  }, []);

  const handleNext = () => {
    setError(null);
    if (currentStep === 1 && !audioUrl) {
      setError('Please upload your master audio file before proceeding.');
      return;
    }
    if (currentStep === 2 && !title.trim()) {
      setError('Please enter a track title.');
      return;
    }
    if (currentStep === 5) {
      if (!originalOwnershipDecl || !noAIVoiceCloneDecl || !termsAgreementDecl) {
        setError('You must confirm all three rights and master declarations.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handlePrev = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveOrSubmit = async (isDraft: boolean) => {
    if (!token) return;
    setError(null);
    setSubmitting(true);

    try {
      // Build timed lyrics array if timed selected
      const formattedTimedLines =
        lyricsType === 'timed'
          ? timedLines
              .filter((l) => l.text.trim())
              .map((l, idx) => ({
                sequenceOrder: idx + 1,
                startTimeMs: Math.round(l.timeSeconds * 1000),
                endTimeMs: Math.round((l.timeSeconds + 8) * 1000),
                text: l.text.trim(),
              }))
          : null;

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        languageId,
        genreId,
        mood,
        audioUrl: audioUrl.trim(),
        storageKey: audioFileKey || null,
        durationSeconds,
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
        composer: composer.trim() || user?.fullName || 'Creator',
        lyricsText: lyricsText.trim() || null,
        lyricsTimedData: formattedTimedLines,
        ownershipDeclaration: originalOwnershipDecl,
        rightsDeclaration: {
          originalMaster: originalOwnershipDecl,
          zeroAIVoiceClones: noAIVoiceCloneDecl,
          platformTermsAgreed: termsAgreementDecl,
          timestamp: new Date().toISOString(),
        },
        isDraft,
      };

      const res = await fetch('/api/v1/creators/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to submit track.');
      }

      if (isDraft) {
        alert('Draft saved successfully! You can resume and edit your submission anytime.');
      } else {
        alert('Original track submitted for moderation review! Our team will inspect audio quality and rights clearance.');
      }

      router.push('/creator-studio');
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to complete submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Audio Master', icon: Music },
    { num: 2, title: 'Song Details', icon: FileText },
    { num: 3, title: 'Cover Artwork', icon: ImageIcon },
    { num: 4, title: 'Lyrics & Timing', icon: Sparkles },
    { num: 5, title: 'Rights Declaration', icon: ShieldCheck },
    { num: 6, title: 'Preview & Submit', icon: Eye },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <Link
        href="/creator-studio"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Creator Studio
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-4xl font-black font-display text-slate-900 dark:text-white">
          Creator Upload Studio
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Publish your original songs to thousands of Indian music listeners. Follow the 6-step release workflow.
        </p>
      </div>

      {/* Step Progress Navigation Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-2 rounded-2xl bg-white/50 dark:bg-midnight-900/50 border border-black/5 dark:border-white/10">
        {steps.map((s) => {
          const isComplete = currentStep > s.num;
          const isCurrent = currentStep === s.num;
          const Icon = s.icon;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (isComplete || isCurrent) setCurrentStep(s.num);
              }}
              className={`flex flex-col items-center py-2 px-1 rounded-xl text-[11px] font-semibold transition-all ${
                isCurrent
                  ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow font-bold'
                  : isComplete
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : 'text-gray-400 hover:text-white opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-1 mb-0.5">
                {isComplete ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                <span>Step {s.num}</span>
              </div>
              <span className="truncate max-w-[90px] text-[10px] hidden sm:block">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          STEP 1: AUDIO MASTER
      ──────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-midnight-900/70 border border-black/5 dark:border-white/10 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Step 1: Upload Your Master Recording
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Provide your uncompressed or high-bitrate master audio. Supported formats: MP3, WAV, M4A, FLAC (Max 100MB).
            </p>
          </div>

          <FileUploadZone
            accept="audio"
            label="Original Audio File"
            token={token || undefined}
            onFileUploaded={(result) => {
              setAudioFileKey(result.key);
              setAudioUrl(result.url);
              setAudioFileName(result.fileName);
              if (result.durationSeconds) setDurationSeconds(result.durationSeconds);
              if (!title) {
                // Auto-fill title from clean filename
                const clean = result.fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                setTitle(clean.charAt(0).toUpperCase() + clean.slice(1));
              }
            }}
            onClear={() => {
              setAudioFileKey('');
              setAudioUrl('');
              setAudioFileName('');
              setDurationSeconds(0);
            }}
          />

          {audioUrl && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block">
                Audio Stream Preview:
              </span>
              <audio controls src={audioUrl} className="w-full h-10 rounded-lg" />
              {durationSeconds > 0 && (
                <p className="text-[11px] font-mono text-gray-400">
                  Detected Duration: {formatDuration(durationSeconds)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          STEP 2: SONG DETAILS
      ──────────────────────────────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-midnight-900/70 border border-black/5 dark:border-white/10 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Step 2: Track Information & Metadata
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Accurate categorization ensures your song reaches the right regional audience and playlists.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Track Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maya Nadhi (Acoustic Version)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Composer / Artist Name
                </label>
                <input
                  type="text"
                  placeholder={user?.fullName || 'e.g. Arun Chillara'}
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="SINGER">Singer-Songwriter</option>
                  <option value="FOLK">Folk Innovation</option>
                  <option value="CLASSICAL">Classical Fusion</option>
                  <option value="RAPPER">Rap / Hip-Hop</option>
                  <option value="INSTRUMENTAL">Acoustic / Instrumental</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Primary Language <span className="text-rose-500">*</span>
                </label>
                <select
                  value={languageId}
                  onChange={(e) => setLanguageId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  {languages.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Genre <span className="text-rose-500">*</span>
                </label>
                <select
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  {genres.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Mood / Sonic Vibe
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Acoustic">Acoustic & Soulful</option>
                  <option value="Devotional">Devotional & Sacred</option>
                  <option value="Romantic">Romantic & Melodic</option>
                  <option value="Energetic">Energetic & Festive</option>
                  <option value="Melancholic">Melancholic & Reflective</option>
                  <option value="Chill">Chill & Lo-Fi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Story Behind The Song (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="What inspired this vocal composition? Share with listeners..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          STEP 3: COVER ARTWORK
      ──────────────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-midnight-900/70 border border-black/5 dark:border-white/10 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Step 3: Cover Artwork
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              High-resolution cover art makes your release stand out. Recommend square 1:1 image (Min 800x800, JPG/PNG/WEBP).
            </p>
          </div>

          <FileUploadZone
            accept="image"
            label="Track Cover Art"
            token={token || undefined}
            onFileUploaded={(result) => {
              setCoverFileKey(result.key);
              setCoverUrl(result.url);
            }}
            onClear={() => {
              setCoverFileKey('');
              setCoverUrl('');
            }}
          />

          {coverUrl && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <img
                src={coverUrl}
                alt="Artwork preview"
                className="w-20 h-20 rounded-xl object-cover border border-amber-500/30"
              />
              <div className="text-xs space-y-1">
                <span className="font-bold text-amber-600 dark:text-amber-400">Cover Artwork Ready</span>
                <p className="text-gray-400">This image will appear in catalog search, hero cards, and the player bar.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          STEP 4: LYRICS & TIMED SYNC
      ──────────────────────────────────────────────────────────── */}
      {currentStep === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-midnight-900/70 border border-black/5 dark:border-white/10 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Step 4: Lyrics & Synchronization
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Help listeners follow along with native lyrics and transliterations. Synchronized lyrics significantly improve community engagement.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setLyricsType('plain')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                lyricsType === 'plain'
                  ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Paste Full Lyrics
            </button>
            <button
              type="button"
              onClick={() => setLyricsType('timed')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                lyricsType === 'timed'
                  ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Add Timed Synchronized Lines
            </button>
          </div>

          {lyricsType === 'plain' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Full Song Lyrics (Pallavi, Charanam, or Verses)
              </label>
              <textarea
                rows={10}
                placeholder="Paste lyrics in native script (Kannada, Telugu, Bengali, Devanagari...) or English transliteration..."
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                Specify the start timestamp (seconds) and vocal line:
              </p>
              {timedLines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 w-6 font-mono">#{idx + 1}</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Sec"
                    value={line.timeSeconds}
                    onChange={(e) => {
                      const updated = [...timedLines];
                      updated[idx].timeSeconds = parseFloat(e.target.value) || 0;
                      setTimedLines(updated);
                    }}
                    className="w-20 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Lyric verse line..."
                    value={line.text}
                    onChange={(e) => {
                      const updated = [...timedLines];
                      updated[idx].text = e.target.value;
                      setTimedLines(updated);
                    }}
                    className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
                  />
                  {timedLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setTimedLines(timedLines.filter((_, i) => i !== idx))}
                      className="text-xs text-gray-400 hover:text-rose-500 px-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setTimedLines([
                    ...timedLines,
                    {
                      timeSeconds:
                        timedLines.length > 0
                          ? timedLines[timedLines.length - 1].timeSeconds + 10
                          : 0,
                      text: '',
                    },
                  ])
                }
              >
                + Add Next Line
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          STEP 5: RIGHTS & PLATFORM DECLARATIONS
      ──────────────────────────────────────────────────────────── */}
      {currentStep === 5 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-midnight-900/70 border border-black/5 dark:border-white/10 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span>Step 5: Rights Clearance & Platform Declarations</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Talent5 enforces strict rights transparency to ensure fair royalty attribution for all vocalists.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/50 dark:bg-midnight-950/60 border border-black/5 dark:border-white/10 cursor-pointer hover:border-amber-500/30 transition-colors">
              <input
                type="checkbox"
                checked={originalOwnershipDecl}
                onChange={(e) => setOriginalOwnershipDecl(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">
                  100% Original Master Ownership
                </span>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  I declare that I own or control 100% of the rights to this sound recording and musical work, or have valid licensing rights to distribute this track on Talent5.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/50 dark:bg-midnight-950/60 border border-black/5 dark:border-white/10 cursor-pointer hover:border-amber-500/30 transition-colors">
              <input
                type="checkbox"
                checked={noAIVoiceCloneDecl}
                onChange={(e) => setNoAIVoiceCloneDecl(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">
                  Pure Human Vocal Guarantee (Zero AI Voice Clones)
                </span>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  I confirm this vocal performance was recorded by a real human singer and does not use unauthorized synthetic voice models or AI deepfake clones.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/50 dark:bg-midnight-950/60 border border-black/5 dark:border-white/10 cursor-pointer hover:border-amber-500/30 transition-colors">
              <input
                type="checkbox"
                checked={termsAgreementDecl}
                onChange={(e) => setTermsAgreementDecl(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
              />
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white">
                  Community Standards & Terms Agreement
                </span>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  I agree to the Talent5 Terms of Service, anti-fraud engagement guidelines, and platform moderation rules.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          STEP 6: PREVIEW & FINAL SUBMISSION
      ──────────────────────────────────────────────────────────── */}
      {currentStep === 6 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-midnight-900/70 border border-black/5 dark:border-white/10 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Step 6: Release Preview
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Review your release details before saving a draft or submitting for moderation review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-white/50 dark:bg-midnight-950/60 border border-black/5 dark:border-white/10">
            <img
              src={coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
              alt="Track Artwork"
              className="w-36 h-36 rounded-2xl object-cover border border-amber-500/30 shadow-lg"
            />

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {languages.find((l) => l.id.toString() === languageId)?.name || 'Regional'} • {category}
                </span>
                <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white mt-1">
                  {title || 'Untitled Track'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By {composer || user?.fullName || 'Creator'} • Mood: {mood}
                </p>
              </div>

              {audioUrl && (
                <audio controls src={audioUrl} className="w-full h-10 rounded-lg pt-1" />
              )}

              {description && (
                <p className="text-xs text-gray-600 dark:text-gray-300 italic">
                  "{description}"
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/5 dark:border-white/10">
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleSaveOrSubmit(true)}
              disabled={submitting}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={() => handleSaveOrSubmit(false)}
              disabled={submitting}
              className="gap-2 font-bold text-midnight-950 px-8 shadow-saffronGlow"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit for Review'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Wizard Bottom Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/10">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrev}
          disabled={currentStep === 1 || submitting}
          className="gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </Button>

        {currentStep < 6 && (
          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            className="gap-1.5 font-bold text-midnight-950 shadow-saffronGlow"
          >
            Next Step <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
