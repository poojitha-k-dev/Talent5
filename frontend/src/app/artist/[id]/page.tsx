'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Heart,
  UserCheck,
  UserPlus,
  Share2,
  Music,
  Disc,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Song, Album, Artist } from '@talent5/types';
import { formatCompactNumber, formatDuration } from '@talent5/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ArtistProfilePage({ params }: { params: { id: string } }) {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { user, token } = useAuth();

  const [artist, setArtist] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [desiContent, setDesiContent] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'music' | 'albums' | 'desi' | 'about'>('music');
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/catalog/artists/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          const artistObj = json.data?.artist || json.data || null;
          setArtist(artistObj);
          setSongs(json.data?.songs || []);
          setAlbums(json.data?.albums || []);
          setDesiContent(json.data?.desiContent || []);
          if (artistObj) {
            setFollowersCount(parseInt(artistObj.followersCount || artistObj.followers_count || '0', 10));
          }
        }
      } catch (e) {
        console.error('Artist fetch error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [params.id]);

  const handleFollow = async () => {
    if (!artist) return;
    if (!user || !token) {
      alert('Please log in to follow this artist!');
      return;
    }

    try {
      const res = await fetch('/api/v1/social/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: 'ARTIST',
          targetId: artist.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing);
        setFollowersCount((prev) => (data.isFollowing ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (e) {
      console.error('Follow error', e);
    }
  };

  if (loading || !artist) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-400 font-display">Loading Artist Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Artist Header & Cover Hero */}
      <div className="relative w-full h-80 sm:h-96 overflow-hidden bg-midnight-900 border-b border-white/10">
        {artist.coverUrl && (
          <img
            src={artist.coverUrl}
            alt={artist.name}
            className="w-full h-full object-cover opacity-60 filter blur-[1px]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-midnight-950 shadow-2xl flex-shrink-0 bg-midnight-900 relative">
            <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {artist.isVerified && <Badge type="verified" label="Verified Artist" />}
              {artist.isApprovedCreator && (
                <Badge type="approvedCreator" label="Approved Desi Creator" />
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">
              {artist.name}
            </h1>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-gray-300">
              <span className="text-amber-400 font-bold">
                {formatCompactNumber(followersCount)} Followers
              </span>
              <span>•</span>
              <span>{formatCompactNumber(artist.totalPlays)} Total Streams</span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              {songs.length > 0 && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => playSong(songs[0], songs)}
                  className="gap-2 font-bold text-midnight-950"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" /> Play Top Tracks
                </Button>
              )}

              <Button
                variant={isFollowing ? 'secondary' : 'outline'}
                size="md"
                onClick={handleFollow}
                className="gap-2"
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 text-teal-400" /> Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Follow
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 2. Tabs */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-3">
          {[
            { id: 'music', label: 'Top Music', icon: Music },
            { id: 'albums', label: `Albums (${albums.length})`, icon: Disc },
            { id: 'desi', label: `Desi Originals (${desiContent.length})`, icon: Sparkles },
            { id: 'about', label: 'About', icon: Info },
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

        {/* 3. Tab Contents */}
        {activeTab === 'music' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-display text-white">Popular Releases</h2>
            <div className="divide-y divide-white/5 bg-midnight-900/50 rounded-2xl p-2 border border-white/5">
              {songs.map((song, idx) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
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
                            else playSong(song, songs);
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
                          href={`/song/${song.id}`}
                          className="text-sm font-semibold text-white hover:text-amber-400 truncate block transition-colors"
                        >
                          {song.title}
                        </Link>
                        <p className="text-xs text-gray-400">{song.languageName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-gray-400">
                      <span>{formatCompactNumber(song.playCount)} plays</span>
                      <span className="flex items-center gap-1 text-rose-400">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        {formatCompactNumber(song.validLikesCount || 0)}
                      </span>
                      <span>{formatDuration(song.durationSeconds)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'albums' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-display text-white">Discography</h2>
            {albums.length === 0 ? (
              <p className="text-xs text-gray-400 py-10 text-center">No albums published yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {albums.map((album) => (
                  <Link
                    key={album.id}
                    href={`/album/${album.id}`}
                    className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-midnight-800 mb-3">
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 truncate">
                      {album.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {album.releaseDate ? new Date(album.releaseDate).getFullYear() : '2026'} • {album.type}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'desi' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-display text-white">Desi Original Creations</h2>
            {desiContent.length === 0 ? (
              <p className="text-xs text-gray-400 py-10 text-center">
                No Desi video performances uploaded yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {desiContent.map((item) => (
                  <div
                    key={item.id}
                    className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-white/10"
                  >
                    <div className="relative aspect-video bg-midnight-900">
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          playSong({
                            id: item.songId,
                            title: item.title,
                            slug: item.id,
                            artistId: artist.id,
                            artistName: artist.name,
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
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <div className="w-12 h-12 rounded-full bg-teal-500 text-midnight-950 flex items-center justify-center shadow-peacockGlow">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </button>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{formatCompactNumber(item.viewsCount)} views</span>
                        <span className="text-teal-400 font-semibold">
                          {formatCompactNumber(item.validLikesCount)} Valid Likes
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6 max-w-3xl">
            <h2 className="text-xl font-bold font-display text-white">Biography</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {artist.bio ||
                `${artist.name} is an active music creator on Talent5 contributing authentic Indian regional music.`}
            </p>

            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-gray-400">
              <div>
                <p className="text-gray-500">Artist ID</p>
                <p className="font-mono text-white mt-0.5">{artist.id.substring(0, 8)}...</p>
              </div>
              <div>
                <p className="text-gray-500">Total Followers</p>
                <p className="font-bold text-amber-400 mt-0.5">
                  {formatCompactNumber(followersCount)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Total Plays</p>
                <p className="font-bold text-white mt-0.5">
                  {formatCompactNumber(artist.totalPlays)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
