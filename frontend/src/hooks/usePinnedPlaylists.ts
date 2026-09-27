'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePinnedPlaylists(userId?: string | null) {
  const storageKey = userId ? `talent5_pinned_playlists_${userId}` : 'talent5_pinned_playlists_guest';
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPinnedIds(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load pinned playlists', e);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  const togglePin = useCallback(
    (playlistId: string) => {
      setPinnedIds((prev) => {
        const next = prev.includes(playlistId)
          ? prev.filter((id) => id !== playlistId)
          : [...prev, playlistId];
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save pinned playlists', e);
        }
        return next;
      });
    },
    [storageKey]
  );

  const isPinned = useCallback(
    (playlistId: string) => {
      return pinnedIds.includes(playlistId);
    },
    [pinnedIds]
  );

  return {
    pinnedIds,
    togglePin,
    isPinned,
    isLoaded,
  };
}
