'use client';

import React from 'react';
import { X, Play, Trash2, Music } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { formatDuration } from '@talent5/utils';

export const QueueDrawer: React.FC = () => {
  const { isQueueOpen, setIsQueueOpen, queue, queueIndex, playSong, removeFromQueue } = useAudio();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-midnight-950 border-l border-white/10 h-full flex flex-col p-6 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold font-display text-white">Play Queue</h3>
            <span className="text-xs text-gray-400">({queue.length} tracks)</span>
          </div>
          <button
            onClick={() => setIsQueueOpen(false)}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {queue.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-sm">Your play queue is currently empty.</p>
              <p className="text-xs text-gray-500 mt-1">Play any song to fill the queue.</p>
            </div>
          ) : (
            queue.map((song, idx) => {
              const isCurrent = idx === queueIndex;
              return (
                <div
                  key={`${song.id}-${idx}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <div
                    onClick={() => playSong(song)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-midnight-800 flex-shrink-0 relative group">
                      {song.artworkUrl ? (
                        <img
                          src={song.artworkUrl}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-5 h-5 text-gray-500 m-auto mt-2.5" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-4 h-4 text-amber-400 fill-current" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate text-white">{song.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {song.artistName || 'Talent5 Artist'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-xs text-gray-500">
                      {formatDuration(song.durationSeconds)}
                    </span>
                    <button
                      onClick={() => removeFromQueue(idx)}
                      title="Remove from queue"
                      className="text-gray-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
