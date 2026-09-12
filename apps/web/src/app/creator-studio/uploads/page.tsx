'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Music,
  Video,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function ContentUploadPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('SINGER');
  const [languageId, setLanguageId] = useState<string>('1');
  const [genreId, setGenreId] = useState<string>('1');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [composer, setComposer] = useState<string>('');
  const [lyricist, setLyricist] = useState<string>('');
  const [producer, setProducer] = useState<string>('');
  const [ownershipDeclaration, setOwnershipDeclaration] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [languages, setLanguages] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/creators/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          languageId,
          genreId,
          audioUrl,
          videoUrl,
          coverUrl,
          composer,
          lyricist,
          producer,
          ownershipDeclaration,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Submission failed');
      }

      alert('Original track submitted successfully for moderation review!');
      router.push('/creator-studio');
    } catch (err: any) {
      setError(err.message || 'Failed to submit track');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/creator-studio"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Creator Studio
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Submit Original Content
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Upload your original acoustic songs, rap cyphers, classical fusion, or music videos.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        {error && (
          <div className="p-3 mb-6 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Track Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Mann Ki Dastak (Acoustic Original)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="SINGER">Singer-Songwriter</option>
                <option value="RAPPER">Rap / Hip-Hop</option>
                <option value="FOLK">Folk Innovation</option>
                <option value="CLASSICAL">Classical Indian</option>
                <option value="INSTRUMENTAL">Instrumental</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Language</label>
              <select
                value={languageId}
                onChange={(e) => setLanguageId(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Genre</label>
              <select
                value={genreId}
                onChange={(e) => setGenreId(e.target.value)}
                className="w-full px-3 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
              >
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Audio File URL (.mp3 / CDN link) <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://cdn.freesound.org/... or storage URL"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Performance Video URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://commondatastorage.googleapis.com/... or mp4 link"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Cover Artwork URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or uploaded cover"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Composer</label>
              <input
                type="text"
                placeholder="Self / Name"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                className="w-full px-4 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Lyricist</label>
              <input
                type="text"
                placeholder="Self / Name"
                value={lyricist}
                onChange={(e) => setLyricist(e.target.value)}
                className="w-full px-4 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Description / Story Behind Track</label>
            <textarea
              rows={3}
              placeholder="The inspiration, ragas used, or street story behind this creation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={ownershipDeclaration}
                onChange={(e) => setOwnershipDeclaration(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-teal-500 accent-teal-500"
              />
              <span className="text-xs text-gray-300">
                <strong className="text-white">100% Original Master Declaration:</strong> I certify that this audio/video track contains only my original vocals, instrumentation, and lyrics. No unauthorized commercial music or karaoke tracks have been sampled.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="peacock"
            size="lg"
            className="w-full font-bold text-midnight-950"
            disabled={!ownershipDeclaration || submitting}
            isLoading={submitting}
          >
            Submit for Rights Verification & Publishing
          </Button>
        </form>
      </div>
    </div>
  );
}
