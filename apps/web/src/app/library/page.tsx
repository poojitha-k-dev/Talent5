'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Library,
  Heart,
  ListMusic,
  UserCheck,
  Plus,
  Play,
  Pause,
  Lock,
  Globe,
  Music,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Song, Playlist, Artist } from '@talent5/types';
import { formatCompactNumber, formatDuration } from '@talent5/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function LibraryPage() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'liked' | 'playlists' | 'artists'>('liked');
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Create Playlist Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [playlistName, setPlaylistName] = useState<string>('');
  const [playlistDesc, setPlaylistDesc] = useState<string>('');
  const [playlistVisibility, setPlaylistVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [creating, setCreating] = useState<boolean>(false);

  const fetchLibrary = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/library', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setLikedSongs(json.data.likedSongs || []);
        setPlaylists(json.data.playlists || []);
        setFollowedArtists(json.data.followedArtists || []);
      }
    } catch (e) {
      console.error('Library load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [token]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim() || !token) return;

    setCreating(true);
    try {
      const res = await fetch('/api/v1/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: playlistName.trim(),
          description: playlistDesc.trim(),
          visibility: playlistVisibility,
        }),
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setPlaylistName('');
        setPlaylistDesc('');
        fetchLibrary();
      }
    } catch (e) {
      console.error('Playlist creation error', e);
    } finally {
      setCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-midnight-900 border border-white/10 flex items-center justify-center text-amber-500 shadow-card">
          <Library className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white">Your Personal Music Library</h2>
        <p className="text-sm text-gray-400 max-w-md">
          Sign in to save liked songs, create custom Desi playlists, and follow your favorite independent artists.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Library className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Personal Collection
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Your Library</h1>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 font-bold text-midnight-950"
        >
          <Plus className="w-4 h-4" /> New Playlist
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-3">
        {[
          { id: 'liked', label: `Liked Songs (${likedSongs.length})`, icon: Heart },
          { id: 'playlists', label: `Playlists (${playlists.length})`, icon: ListMusic },
          { id: 'artists', label: `Followed Artists (${followedArtists.length})`, icon: UserCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-2 text-sm font-semibold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-gray-400">Loading Library...</p>
        </div>
      ) : (
        <div>
          {/* Liked Songs Tab */}
          {activeTab === 'liked' && (
            <div className="space-y-4">
              {likedSongs.length === 0 ? (
                <div className="text-center py-16 bg-midnight-900/30 rounded-3xl border border-white/5">
                  <Heart className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-white mb-1">No Liked Songs Yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                    Tap the heart icon on any song to save it to your library and reward the creator.
                  </p>
                  <Link href="/home">
                    <Button variant="outline" size="sm">
                      Discover Songs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/5 bg-midnight-900/50 rounded-2xl p-2 border border-white/5">
                  {likedSongs.map((song, idx) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div
                        key={song.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="w-5 text-center text-xs text-gray-500 font-mono">
                            {idx + 1}
                          </span>
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-midnight-800 flex-shrink-0">
                            <img
                              src={song.artworkUrl}
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => {
                                if (isCurrent) togglePlay();
                                else playSong(song, likedSongs);
                              }}
                              className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                                isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-full bg-amber-500 text-midnight-950 flex items-center justify-center">
                                {isCurrent && isPlaying ? (
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                )}
                              </div>
                            </button>
                          </div>

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
                          <span>{formatDuration(song.durationSeconds)}</span>
                          <Heart className="w-4 h-4 text-rose-500 fill-current" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Playlists Tab */}
          {activeTab === 'playlists' && (
            <div className="space-y-4">
              {playlists.length === 0 ? (
                <div className="text-center py-16 bg-midnight-900/30 rounded-3xl border border-white/5">
                  <ListMusic className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-white mb-1">Create Your First Playlist</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                    Organize your favorite regional songs and Desi performances into personal mixtapes.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create Playlist
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {playlists.map((pl) => (
                    <Link
                      key={pl.id}
                      href={`/playlist/${pl.id}`}
                      className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-midnight-800 mb-3 relative">
                        <img
                          src={pl.coverUrl}
                          alt={pl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-gray-300">
                          {pl.visibility === 'PUBLIC' ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 truncate">
                        {pl.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{pl.songCount} Songs</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Followed Artists Tab */}
          {activeTab === 'artists' && (
            <div className="space-y-4">
              {followedArtists.length === 0 ? (
                <div className="text-center py-16 bg-midnight-900/30 rounded-3xl border border-white/5">
                  <UserCheck className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-white mb-1">No Followed Artists</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                    Follow artists to receive notifications about their new releases and live tournaments.
                  </p>
                  <Link href="/home">
                    <Button variant="outline" size="sm">
                      Discover Artists
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {followedArtists.map((artist) => (
                    <Link
                      key={artist.id}
                      href={`/artist/${artist.id}`}
                      className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col items-center text-center group"
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border border-white/10 group-hover:border-amber-500 transition-colors">
                        <img
                          src={artist.avatarUrl}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-bold text-white group-hover:text-amber-400">
                        {artist.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatCompactNumber(artist.followersCount)} Followers
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Playlist Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Playlist"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePlaylist} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Playlist Name</label>
            <input
              type="text"
              required
              placeholder="e.g. My Soulful Desi Mornings"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="w-full px-4 py-2.5 bg-midnight-800 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="A curated mix of acoustic ragas and street beats..."
              value={playlistDesc}
              onChange={(e) => setPlaylistDesc(e.target.value)}
              className="w-full px-4 py-2.5 bg-midnight-800 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlaylistVisibility('PUBLIC')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  playlistVisibility === 'PUBLIC'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-midnight-800 text-gray-400 border-white/10'
                }`}
              >
                <Globe className="w-4 h-4" /> Public (Sharable)
              </button>
              <button
                type="button"
                onClick={() => setPlaylistVisibility('PRIVATE')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  playlistVisibility === 'PRIVATE'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-midnight-800 text-gray-400 border-white/10'
                }`}
              >
                <Lock className="w-4 h-4" /> Private (Only You)
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full font-bold text-midnight-950"
            isLoading={creating}
          >
            Create Playlist
          </Button>
        </form>
      </Modal>
    </div>
  );
}
