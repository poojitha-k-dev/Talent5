'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Heart,
  Eye,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  User,
  Send,
  Video,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { formatCompactNumber } from '@talent5/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function DesiDetailPage({ params }: { params: { id: string } }) {
  const { user, token } = useAuth();
  const { playSong } = useAudio();

  const [item, setItem] = useState<any>(null);
  const [rights, setRights] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchDesiItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/desi/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setItem(json.data.item);
          setRights(json.data.rights);
          setComments(json.data.comments || []);
          setLikeCount(parseInt(json.data.item.validLikesCount || '0', 10));
        }
      } catch (e) {
        console.error('Desi detail error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDesiItem();
  }, [params.id]);

  const handleLike = async () => {
    if (!item) return;
    if (!user || !token) {
      alert('Please log in to like this performance and support the creator!');
      return;
    }

    try {
      const res = await fetch('/api/v1/social/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: 'DESI_CONTENT',
          targetId: item.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsLiked(!isLiked);
        setLikeCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch (e) {
      console.error('Like error', e);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !item) return;
    if (!user || !token) {
      alert('Please log in to comment!');
      return;
    }

    setCommentSubmitting(true);
    try {
      const res = await fetch('/api/v1/social/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: 'DESI_CONTENT',
          targetId: item.id,
          content: newComment.trim(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setComments((prev) => [json.data, ...prev]);
        setNewComment('');
      }
    } catch (e) {
      console.error('Comment error', e);
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading || !item) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-teal-400">Loading Desi Performance...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        href="/desi"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Desi Hub
      </Link>

      {/* Video / Media Player */}
      <div className="rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl bg-black">
        {item.videoUrl ? (
          <div className="relative aspect-video w-full bg-black">
            <video
              src={item.videoUrl}
              poster={item.coverUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full flex items-center justify-center bg-midnight-950">
            <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover opacity-60" />
            <button
              onClick={() =>
                playSong({
                  id: item.songId,
                  title: item.title,
                  slug: item.id,
                  artistId: item.creatorId,
                  artistName: item.creatorName,
                  durationSeconds: item.durationSeconds || 200,
                  audioUrl: item.audioUrl,
                  artworkUrl: item.coverUrl,
                  languageId: '1',
                  genreId: '1',
                  releaseDate: '2026-01-01',
                  isExplicit: false,
                  playCount: 100,
                  rawLikesCount: item.validLikesCount,
                  validLikesCount: item.validLikesCount,
                  popularityScore: 90,
                  status: 'PUBLISHED',
                  featuredArtists: [],
                  createdAt: new Date().toISOString(),
                })
              }
              className="absolute w-16 h-16 rounded-full bg-teal-500 text-midnight-950 flex items-center justify-center shadow-peacockGlow"
            >
              <Play className="w-8 h-8 fill-current ml-1" />
            </button>
          </div>
        )}

        {/* Video Metadata Bar */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 uppercase">
                  {item.category}
                </span>
                <span className="text-xs text-gray-400">• {item.languageName}</span>
                <Badge type="approvedCreator" label="Approved Creator" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                {item.title}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                By <span className="text-white font-semibold">{item.creatorName}</span> ({item.city}, {item.state})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs font-semibold transition-all ${
                  isLiked
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-midnight-800 text-gray-300 border-white/10 hover:border-teal-500/30'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-teal-400' : ''}`} />
                <span>{likeCount} Valid Likes</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-white/5">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {formatCompactNumber(item.viewsCount)} Views
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Original Desi Composition
            </span>
          </div>
        </div>
      </div>

      {/* Creator Profile Box */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold font-display text-white">About the Creator</h3>
          <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
            {item.creatorBio || `${item.creatorName} is an independent artist publishing through Talent5.`}
          </p>
        </div>

        {item.portfolioUrl && (
          <a
            href={item.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <Button variant="outline" size="sm" className="border-teal-500/30 text-teal-300">
              View Portfolio
            </Button>
          </a>
        )}
      </div>

      {/* Discussion */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
        <h3 className="text-lg font-bold font-display text-white">
          Comments & Reactions ({comments.length})
        </h3>

        <form onSubmit={handleComment} className="flex gap-3">
          <input
            type="text"
            placeholder={user ? 'Leave feedback on this performance...' : 'Sign in to comment'}
            value={newComment}
            disabled={!user || commentSubmitting}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-midnight-900 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
          />
          <Button
            type="submit"
            variant="peacock"
            size="md"
            disabled={!user || !newComment.trim()}
            isLoading={commentSubmitting}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        <div className="space-y-4 divide-y divide-white/5">
          {comments.map((c) => (
            <div key={c.id} className="pt-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-midnight-800 flex items-center justify-center text-gray-400 flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">{c.userName}</p>
                <p className="text-xs text-gray-300 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
