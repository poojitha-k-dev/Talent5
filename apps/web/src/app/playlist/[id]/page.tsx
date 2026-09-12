'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, ListMusic, Trash2, Clock, Globe, Lock } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Song, Playlist } from '@talent5/types';
import { formatDuration } from '@talent5/utils';
import { Button } from '@/components/ui/Button';

export default function PlaylistDetailPage({ params }: { params: { id: string } }) {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { user, token } = useAuth();

  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/playlists/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setPlaylist(json.data.playlist);
        setSongs(json.data.songs || []);
      }
    } catch (e) {
      console.error('Playlist load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [params.id]);

  const handleRemoveSong = async (songId: string) => {
    if (!token || !playlist) return;
    try {
      const res = await fetch(`/api/v1/playlists/${playlist.id}?songId=${songId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== songId));
      }
    } catch (e) {
      console.error('Remove song error', e);
    }
  };

  if (loading || !playlist) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-400">Loading Playlist...</p>
      </div>
    );
  }

  const isOwner = user && user.id === playlist.userId;
  const totalDuration = songs.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Playlist Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-end gap-8 border border-white/10">
        <div className="w-56 h-56 rounded-2xl overflow-hidden shadow-card flex-shrink-0 bg-midnight-900 border border-white/10 relative">
          <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-amber-400">
            {playlist.visibility === 'PUBLIC' ? (
              <Globe className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Curated Playlist
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
            {playlist.name}
          </h1>

          {playlist.description && (
            <p className="text-sm text-gray-300 max-w-xl">{playlist.description}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Curated by <span className="text-white font-semibold">{playlist.curatorName}</span></span>
            <span>•</span>
            <span>{songs.length} Tracks</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {formatDuration(totalDuration)}
            </span>
          </div>

          {songs.length > 0 && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => playSong(songs[0], songs)}
                className="gap-2 font-bold text-midnight-950"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" /> Play All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tracklist Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display text-white">Playlist Tracks</h2>
        {songs.length === 0 ? (
          <div className="text-center py-16 bg-midnight-900/40 rounded-3xl border border-white/5">
            <ListMusic className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white mb-1">No tracks in this playlist yet</h3>
            <p className="text-xs text-gray-400 mb-4">
              Browse the catalog and add your favorite songs here.
            </p>
            <Link href="/music">
              <Button variant="outline" size="sm">
                Browse Music
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5 bg-midnight-900/50 rounded-2xl p-2 border border-white/5">
            {songs.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="w-6 text-center text-xs text-gray-500 font-mono">
                      {idx + 1}
                    </span>
                    <button
                      onClick={() => {
                        if (isCurrent) togglePlay();
                        else playSong(song, songs);
                      }}
                      className="p-2 rounded-full bg-midnight-800 text-amber-400 hover:bg-amber-500 hover:text-midnight-950 transition-colors flex-shrink-0"
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/music/${song.slug || song.id}`}
                        className="text-sm font-semibold text-white hover:text-amber-400 truncate block"
                      >
                        {song.title}
                      </Link>
                      <Link
                        href={`/artist/${song.artistId}`}
                        className="text-xs text-gray-400 hover:text-gray-200 truncate block"
                      >
                        {song.artistName}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-gray-400">
                    <span className="hidden sm:inline">{song.languageName}</span>
                    <span className="font-mono">{formatDuration(song.durationSeconds)}</span>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveSong(song.id)}
                        title="Remove from playlist"
                        className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
