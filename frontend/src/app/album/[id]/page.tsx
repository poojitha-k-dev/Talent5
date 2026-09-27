'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Disc, Clock, Calendar, Music } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { Song, Album } from '@talent5/types';
import { formatDuration, formatDate } from '@talent5/utils';
import { Button } from '@/components/ui/Button';

export default function AlbumDetailPage({ params }: { params: { id: string } }) {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/catalog/albums/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setAlbum(json.data.album);
          setTracks(json.data.tracks || []);
        }
      } catch (e) {
        console.error('Album load error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbum();
  }, [params.id]);

  if (loading || !album) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-400">Loading Album...</p>
      </div>
    );
  }

  const totalDuration = tracks.reduce((acc, t) => acc + (t.durationSeconds || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Album Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-end gap-8 border border-white/10">
        <div className="w-56 h-56 rounded-2xl overflow-hidden shadow-card flex-shrink-0 bg-midnight-900 border border-white/10">
          <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 space-y-3 text-left">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            {album.type} • {album.languageName}
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
            {album.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>By</span>
            <Link
              href={`/artist/${album.artistId}`}
              className="text-amber-400 font-bold hover:underline"
            >
              {album.artistName}
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(album.releaseDate)}
            </span>
            <span>•</span>
            <span>{tracks.length} Songs</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {formatDuration(totalDuration)}
            </span>
          </div>

          {tracks.length > 0 && (
            <div className="pt-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => playSong(tracks[0], tracks)}
                className="gap-2 font-bold text-midnight-950"
              >
                <Play className="w-5 h-5 fill-current ml-0.5" /> Play Album
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tracklist Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display text-white">Tracklist</h2>
        <div className="divide-y divide-white/5 bg-midnight-900/50 rounded-2xl p-2 border border-white/5">
          {tracks.map((track, idx) => {
            const isCurrent = currentSong?.id === track.id;
            return (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="w-6 text-center text-xs text-gray-500 font-mono">{idx + 1}</span>
                  <button
                    onClick={() => {
                      if (isCurrent) togglePlay();
                      else playSong(track, tracks);
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
                      href={`/song/${track.id}`}
                      className="text-sm font-semibold text-white hover:text-amber-400 truncate block"
                    >
                      {track.title}
                    </Link>
                    <p className="text-xs text-gray-400">{track.artistName}</p>
                  </div>
                </div>

                <span className="text-xs text-gray-400 font-mono">
                  {formatDuration(track.durationSeconds)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
