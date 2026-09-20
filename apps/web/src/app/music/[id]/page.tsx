'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Heart,
  Share2,
  FileText,
  ShieldCheck,
  Calendar,
  Clock,
  Send,
  User,
  Music,
  Disc,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Song, RightsRecord, Lyrics, Comment } from '@talent5/types';
import { formatCompactNumber, formatDuration, formatDate } from '@talent5/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function SongDetailPage({ params }: { params: { id: string } }) {
  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    setIsLyricsOpen,
    activeLyricIndex,
    currentLyricsLines,
    seek,
  } = useAudio();
  const { user, token } = useAuth();

  const [song, setSong] = useState<Song | null>(null);
  const [rights, setRights] = useState<RightsRecord | null>(null);
  const [lyrics, setLyrics] = useState<Lyrics | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);
  const [lyricsMode, setLyricsMode] = useState<'stream' | 'full'>('stream');
  const [isExpandedFullLyrics, setIsExpandedFullLyrics] = useState<boolean>(false);

  useEffect(() => {
    const fetchSongData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/catalog/songs/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setSong(json.data.song);
          setRights(json.data.rights);
          setLyrics(json.data.lyrics);
          setComments(json.data.comments || []);
          setRecommendations(json.data.recommendations || []);
          setLikeCount(Number(json.data.song.validLikesCount || 0));
        }
      } catch (e) {
        console.error('Song load error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSongData();
  }, [params.id]);

  const isCurrentSong = currentSong?.id === song?.id;

  const handleLike = async () => {
    if (!song) return;
    if (!user || !token) {
      alert('Please log in to like this track and support the artist!');
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
          targetType: 'SONG',
          targetId: song.id,
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

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !song) return;
    if (!user || !token) {
      alert('Please log in to join the discussion!');
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
          targetType: 'SONG',
          targetId: song.id,
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

  if (loading || !song) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-400">Loading Song Master...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Track Hero Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-end gap-8 relative overflow-hidden border border-white/10">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-card flex-shrink-0 bg-midnight-900 border border-white/10">
          <img src={song.artworkUrl} alt={song.title} className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3">
            <Badge type="rightsVerified" label="Rights Verified" />
          </div>
        </div>

        <div className="flex-1 space-y-4 text-left w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {song.languageName}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-midnight-800 text-gray-300 border border-white/10">
              {song.genreName}
            </span>
            {song.mood && (
              <span className="text-xs text-gray-400">Mood: {song.mood}</span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
            {song.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>By</span>
            <Link
              href={`/artist/${song.artistId}`}
              className="text-amber-400 hover:text-amber-300 font-bold hover:underline"
            >
              {song.artistName}
            </Link>
            {song.albumTitle && (
              <>
                <span>• Album:</span>
                <Link
                  href={`/album/${song.albumId}`}
                  className="text-gray-300 hover:text-white hover:underline"
                >
                  {song.albumTitle}
                </Link>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(song.releaseDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {formatDuration(song.durationSeconds)}
            </span>
            <span>•</span>
            <span>{formatCompactNumber(song.playCount)} Streams</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">{formatCompactNumber(likeCount)} Valid Likes</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                if (isCurrentSong) togglePlay();
                else playSong(song);
              }}
              className="gap-2 font-bold text-midnight-950"
            >
              {isCurrentSong && isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current ml-0.5" /> Play Track
                </>
              )}
            </Button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all ${
                isLiked
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-midnight-800 hover:bg-midnight-700 text-gray-300 border-white/10 hover:border-white/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-rose-500' : ''}`} />
              <span>{isLiked ? 'Liked' : 'Like'}</span>
            </button>

            {lyrics && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  if (!currentSong || currentSong.id !== song.id) {
                    playSong(song);
                  }
                  setIsLyricsOpen(true);
                }}
                className="gap-2 font-bold text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Synced Lyrics</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Grid: Rights & Copyright Metadata + Lyrics Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rights Card */}
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold font-display text-white">
              Rights & Licensing Metadata
            </h3>
          </div>

          {rights ? (
            <div className="space-y-3 text-xs text-slate-200">
              <div>
                <p className="text-slate-400 font-medium">Rights Holder</p>
                <p className="font-bold text-white text-sm">{rights.rightsHolder}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-400 font-medium">Ownership</p>
                  <p className="font-bold text-amber-400">{rights.ownershipType}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">License Type</p>
                  <p className="font-bold text-white">{rights.licenseType}</p>
                </div>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Territory</p>
                <p className="font-bold text-white">{rights.territory}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Permitted Rights</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {rights.streamingAllowed && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] border border-emerald-500/30">
                      Streaming
                    </span>
                  )}
                  {rights.monetizationAllowed && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[11px] border border-amber-500/30">
                      Monetization
                    </span>
                  )}
                  {rights.ugcAllowed && (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold text-[11px] border border-teal-500/30">
                      UGC Content
                    </span>
                  )}
                  {rights.karaokeAllowed && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold text-[11px] border border-blue-500/30">
                      Singing Mode
                    </span>
                  )}
                </div>
              </div>
              {rights.notes && (
                <p className="text-xs text-slate-300 italic pt-2 border-t border-white/10">
                  "{rights.notes}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Public domain / Open cultural catalog license.</p>
          )}
        </div>

        {/* Lyrics Preview & Synchronized Stream Card */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold font-display text-white">Song Lyrics</h3>
                {lyrics && (
                  <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                    <button
                      onClick={() => setLyricsMode('stream')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                        lyricsMode === 'stream'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Synchronized ({lyrics.lines?.length || 0} lines)
                    </button>
                    <button
                      onClick={() => setLyricsMode('full')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                        lyricsMode === 'full'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Total Lyrics
                    </button>
                  </div>
                )}
              </div>
              {lyrics && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!currentSong || currentSong.id !== song.id) {
                        playSong(song);
                      }
                      setIsLyricsOpen(true);
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    <span>Full Teleprompter</span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>

            {lyrics ? (
              lyricsMode === 'stream' && lyrics.lines && lyrics.lines.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-300/80 mb-2">
                    <span>Click any line to jump audio to that exact moment:</span>
                    {isCurrentSong && isPlaying && (
                      <span className="flex items-center gap-1.5 text-amber-400 font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        Live Synchronized
                      </span>
                    )}
                  </div>
                  <div className="bg-midnight-950/80 border border-white/10 p-4 rounded-2xl max-h-96 overflow-y-auto space-y-2 divide-y divide-white/5">
                    {lyrics.lines.map((line: any, idx: number) => {
                      const isActive = isCurrentSong && idx === activeLyricIndex;
                      return (
                        <div
                          key={line.id || idx}
                          onClick={() => {
                            if (!isCurrentSong) {
                              playSong(song);
                            }
                            seek(line.startTimeMs / 1000);
                          }}
                          className={`pt-2 cursor-pointer transition-all duration-200 px-3 py-2 rounded-xl flex items-start justify-between gap-4 ${
                            isActive
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                              : 'text-slate-200 hover:bg-white/5 hover:text-white font-medium'
                          }`}
                        >
                          <span className="text-sm sm:text-base leading-relaxed">{line.text}</span>
                          <span className="text-[11px] font-mono text-slate-400 flex-shrink-0 mt-0.5">
                            {formatDuration(Math.floor(line.startTimeMs / 1000))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-midnight-950/70 border border-white/10 p-5 rounded-2xl transition-all">
                    <pre
                      className={`font-sans text-sm sm:text-base text-slate-100 font-medium leading-relaxed whitespace-pre-line select-text ${
                        isExpandedFullLyrics ? '' : 'line-clamp-10'
                      }`}
                    >
                      {lyrics.fullText}
                    </pre>
                  </div>
                  <button
                    onClick={() => setIsExpandedFullLyrics(!isExpandedFullLyrics)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {isExpandedFullLyrics ? '▲ Collapse Total Lyrics' : '▼ View Entire Total Song Lyrics'}
                  </button>
                </div>
              )
            ) : (
              <p className="text-xs text-slate-400 py-6">
                Synchronized lyrics are undergoing review by Talent5 editors for this track.
              </p>
            )}
          </div>

          {lyrics && (
            <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
              <span className="font-medium">
                Total Synchronized Lines: <strong className="text-amber-400 font-bold">{lyrics.lines?.length || 0}</strong>
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/karaoke?song=${song.id}`}
                  className="px-3 py-1.5 rounded-lg font-bold text-amber-300 border border-amber-500/30 hover:bg-amber-500/15 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Karaoke Studio</span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!currentSong || currentSong.id !== song.id) {
                      playSong(song);
                    }
                    setIsLyricsOpen(true);
                  }}
                  className="font-bold text-amber-300 border-amber-500/30 hover:bg-amber-500/15"
                >
                  Teleprompter Mode
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Social Discussion / Comments Section */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
        <h3 className="text-lg font-bold font-display text-white">
          Community Discussion ({comments.length})
        </h3>

        {/* Comment Input */}
        <form onSubmit={handlePostComment} className="flex gap-3">
          <input
            type="text"
            placeholder={
              user ? 'Share your thoughts on this performance...' : 'Log in to join the conversation'
            }
            value={newComment}
            disabled={!user || commentSubmitting}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-midnight-900 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!user || !newComment.trim()}
            isLoading={commentSubmitting}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* Comments Feed */}
        <div className="space-y-4 divide-y divide-white/5">
          {comments.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">
              No comments yet. Be the first to share your reaction!
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="pt-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-midnight-800 flex items-center justify-center text-gray-400 overflow-hidden flex-shrink-0">
                  {c.userAvatar ? (
                    <img src={c.userAvatar} alt={c.userName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{c.userName}</span>
                    <span className="text-[10px] text-gray-500">@{c.username}</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Recommendations / Up Next */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display text-white">You Might Also Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                onClick={() => playSong(rec)}
                className="glass-panel glass-panel-hover rounded-xl p-3 cursor-pointer group"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-midnight-800 mb-2 relative">
                  <img src={rec.artworkUrl} alt={rec.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-8 h-8 text-amber-400 fill-current" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-white truncate">{rec.title}</p>
                <p className="text-[11px] text-gray-400 truncate">{rec.artistName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
