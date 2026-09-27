'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Library,
  Heart,
  Bookmark,
  ListMusic,
  UserCheck,
  Plus,
  Clock,
  Music,
  Lock,
  Globe,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Song, Playlist, Artist } from '@talent5/types';
import { SongRow } from '@/components/ui/SongRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArtistCard } from '@/components/ui/ArtistCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { SongRowSkeleton } from '@/components/ui/SkeletonLoader';

export default function LibraryPage() {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<'liked' | 'saved' | 'playlists' | 'artists' | 'history'>('liked');
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [savedSongs, setSavedSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([]);
  const [listeningHistory, setListeningHistory] = useState<Song[]>([]);
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
        setSavedSongs(json.data.savedSongs || []);
        setPlaylists(json.data.playlists || []);
        setFollowedArtists(json.data.followedArtists || []);
        setListeningHistory(json.data.listeningHistory || []);
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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <EmptyState
          icon={Library}
          title="Sign in to your Library"
          description="Access your saved tracks, favorite vocal recordings, playlists, and listening history across all devices."
          actionLabel="Sign In"
          actionHref="/login"
        />
      </div>
    );
  }

  const tabs = [
    { id: 'liked', label: `Liked (${likedSongs.length})`, icon: Heart },
    { id: 'saved', label: `Saved (${savedSongs.length})`, icon: Bookmark },
    { id: 'playlists', label: `Playlists (${playlists.length})`, icon: ListMusic },
    { id: 'artists', label: `Following (${followedArtists.length})`, icon: UserCheck },
    { id: 'history', label: `History (${listeningHistory.length})`, icon: Clock },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/20">
              <Library className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Personal Collection
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display text-slate-900 dark:text-white">
            My Library
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 font-bold text-midnight-950 shadow-saffronGlow"
        >
          <Plus className="w-4 h-4" /> New Playlist
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-black/5 dark:border-white/10 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-midnight-950 shadow-saffronGlow font-bold'
                  : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10'
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
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <SongRowSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div>
          {/* Liked Songs Tab */}
          {activeTab === 'liked' && (
            <div>
              {likedSongs.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="No Liked Songs Yet"
                  description="Tap the heart icon on any song to like it, save it to your collection, and support the vocalist."
                  actionLabel="Discover Music"
                  actionHref="/discover"
                />
              ) : (
                <div className="space-y-2">
                  {likedSongs.map((song, idx) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={idx}
                      isLiked={true}
                      playlistContext={likedSongs}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Songs Tab */}
          {activeTab === 'saved' && (
            <div>
              {savedSongs.length === 0 ? (
                <EmptyState
                  icon={Bookmark}
                  title="No Saved Songs Yet"
                  description="Bookmark recordings to quickly revisit your personal highlights anytime."
                  actionLabel="Explore Catalog"
                  actionHref="/discover"
                />
              ) : (
                <div className="space-y-2">
                  {savedSongs.map((song, idx) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={idx}
                      isSaved={true}
                      playlistContext={savedSongs}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Playlists Tab */}
          {activeTab === 'playlists' && (
            <div>
              {playlists.length === 0 ? (
                <EmptyState
                  icon={ListMusic}
                  title="Create Your First Playlist"
                  description="Organize your favorite devotional, classical, or indie tracks into custom listening sessions."
                  actionLabel="Create Playlist"
                  onAction={() => setIsCreateModalOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {playlists.map((pl) => (
                    <Link
                      key={pl.id}
                      href={`/playlist/${pl.id}`}
                      className="group flex flex-col p-3 rounded-2xl bg-white/60 dark:bg-midnight-900/60 border border-black/5 dark:border-white/5 hover:border-amber-500/30 transition-all shadow-sm"
                    >
                      <div className="aspect-square w-full rounded-xl bg-midnight-950/20 mb-3 overflow-hidden">
                        <img
                          src={pl.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
                          alt={pl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {pl.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {pl.songCount || 0} songs • {pl.visibility}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Followed Artists Tab */}
          {activeTab === 'artists' && (
            <div>
              {followedArtists.length === 0 ? (
                <EmptyState
                  icon={UserCheck}
                  title="No Followed Artists Yet"
                  description="Follow rising vocalists and independent masters to stay updated on their latest releases."
                  actionLabel="Explore Artists"
                  actionHref="/new-talent"
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {followedArtists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} isFollowing={true} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Listening History Tab */}
          {activeTab === 'history' && (
            <div>
              {listeningHistory.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="Listening History Is Empty"
                  description="Start streaming music to see your recent plays and qualified listening telemetry here."
                  actionLabel="Start Listening"
                  actionHref="/discover"
                />
              ) : (
                <div className="space-y-2">
                  {listeningHistory.map((song, idx) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={idx}
                      playlistContext={listeningHistory}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Playlist */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Playlist"
      >
        <form onSubmit={handleCreatePlaylist} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Playlist Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Bhajans or Desi Chill"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What's the theme of this playlist?"
              value={playlistDesc}
              onChange={(e) => setPlaylistDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-midnight-950 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Visibility
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={playlistVisibility === 'PUBLIC'}
                  onChange={() => setPlaylistVisibility('PUBLIC')}
                  className="text-amber-500"
                />
                <span>Public (Visible to community)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={playlistVisibility === 'PRIVATE'}
                  onChange={() => setPlaylistVisibility('PRIVATE')}
                  className="text-amber-500"
                />
                <span>Private (Only you)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={creating || !playlistName.trim()}
              className="font-bold text-midnight-950"
            >
              {creating ? 'Creating...' : 'Create Playlist'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
