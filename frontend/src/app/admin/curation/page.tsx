'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ListMusic,
  Plus,
  Trash2,
  Search,
  ExternalLink,
  Layers,
  CheckCircle2,
  X,
  Music,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Playlist {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_url: string | null;
  visibility: string;
  songCount: string | number;
  ownerName: string;
  ownerEmail: string;
  created_at: string;
}

export default function AdminCurationPage() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverUrl: '',
    visibility: 'PUBLIC',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add song to playlist state
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [songIdToAdd, setSongIdToAdd] = useState('');

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/curation/playlists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlaylists(data.data);
      }
    } catch (err) {
      console.error('Failed to load playlists', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPlaylists();
  }, [token]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/curation/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setFormData({ name: '', description: '', coverUrl: '', visibility: 'PUBLIC' });
        fetchPlaylists();
      } else {
        alert(data.message || 'Failed to create playlist');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating playlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylist || !songIdToAdd) return;
    try {
      const res = await fetch(`/api/v1/admin/curation/playlists/${selectedPlaylist.id}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songId: songIdToAdd.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Track appended to editorial playlist!');
        setSongIdToAdd('');
        setSelectedPlaylist(null);
        fetchPlaylists();
      } else {
        alert(data.message || 'Failed to add song');
      }
    } catch (err: any) {
      alert(err.message || 'Error adding song');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-midnight-900/80 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">
              Homepage CMS & Editorial Playlists
            </h1>
          </div>
          <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
            Curate official platform playlists, organize seasonal selections, and feature spotlight tracks across the Talent5 homepage.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white font-semibold rounded-xl text-xs shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>New Editorial Playlist</span>
        </button>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((pl) => (
          <div key={pl.id} className="p-5 rounded-2xl bg-midnight-900/40 border border-white/5 space-y-4 hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="w-12 h-12 rounded-xl bg-midnight-950 border border-white/10 flex items-center justify-center text-teal-400 flex-shrink-0">
                <ListMusic className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {pl.visibility}
              </span>
            </div>

            <div>
              <h3 className="font-display font-bold text-white text-base">{pl.name}</h3>
              <p className="text-xs text-gray-400 line-clamp-2 mt-1">{pl.description || 'Editorial playlist curated by Talent5 music team.'}</p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-3 border-t border-white/5">
              <span>{pl.songCount} Tracks</span>
              <button
                onClick={() => setSelectedPlaylist(pl)}
                className="text-teal-400 hover:text-teal-300 font-semibold"
              >
                + Add Track
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-950 border border-teal-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-white text-base">New Editorial Playlist</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-mono">Playlist Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Desi Classical Gems 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Description</label>
                <textarea
                  rows={2}
                  placeholder="Curated selection of pure acoustic vocals..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-mono">Cover Artwork URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-1.5 bg-teal-500 hover:bg-teal-600 text-black font-semibold rounded-xl text-xs shadow-lg shadow-teal-500/20"
                >
                  {isSubmitting ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Track Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-950 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-white text-base">
                Add Track to {selectedPlaylist.name}
              </h3>
              <button onClick={() => setSelectedPlaylist(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSong} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-mono">Catalog Song UUID *</label>
                <input
                  type="text"
                  required
                  placeholder="Paste Song ID from Catalog Dashboard..."
                  value={songIdToAdd}
                  onChange={(e) => setSongIdToAdd(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedPlaylist(null)}
                  className="px-4 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-teal-500 hover:bg-teal-600 text-black font-semibold rounded-xl text-xs"
                >
                  Add Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
