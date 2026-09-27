'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Song, LyricLine, LyricSyncStatus } from '@talent5/types';

/**
 * Finds the actively sung lyric index based on actual playback position.
 * Returns -1 during instrumental intros, interludes, or outros.
 */
export function findActiveLyricIndex(
  currentMs: number,
  lines: LyricLine[],
  isSynced: boolean
): number {
  if (!isSynced || !lines || lines.length === 0) return -1;

  // Instrumental intro before first lyric starts
  if (currentMs < lines[0].startTimeMs) return -1;

  // Instrumental outro after last lyric completes
  if (currentMs >= lines[lines.length - 1].endTimeMs) return -1;

  // Direct interval match
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (currentMs >= line.startTimeMs && currentMs < line.endTimeMs) {
      return i;
    }
  }

  // During instrumental gaps between sung lines, do not falsely highlight previous line
  return -1;
}

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Song[];
  queueIndex: number;
  isQueueOpen: boolean;
  isLyricsOpen: boolean;
  isExpandedOpen: boolean;
  activeLyricIndex: number;
  currentLyricsLines: LyricLine[];
  currentLyricsSyncStatus: LyricSyncStatus;
  currentLyricsFullText: string;
  playSong: (song: Song, customQueue?: Song[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  setIsQueueOpen: (open: boolean) => void;
  setIsLyricsOpen: (open: boolean) => void;
  setIsExpandedOpen: (open: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);

  // Drawers & Modals
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isExpandedOpen, setIsExpandedOpen] = useState<boolean>(false);

  // Lyrics sync tracking
  const [currentLyricsLines, setCurrentLyricsLines] = useState<LyricLine[]>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(-1);
  const [currentLyricsSyncStatus, setCurrentLyricsSyncStatus] = useState<LyricSyncStatus>('UNSYNCED');
  const [currentLyricsFullText, setCurrentLyricsFullText] = useState<string>('');

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronized refs to prevent stale closure reads in event callbacks
  const currentSongRef = useRef<Song | null>(null);
  const queueRef = useRef<Song[]>([]);
  const queueIndexRef = useRef<number>(0);
  const repeatModeRef = useRef<'off' | 'all' | 'one'>('off');
  const isShuffleRef = useRef<boolean>(false);
  const currentLyricsLinesRef = useRef<LyricLine[]>([]);
  const activeLyricIndexRef = useRef<number>(-1);
  const currentLyricsSyncStatusRef = useRef<LyricSyncStatus>('UNSYNCED');
  const qualifiedStreamLoggedRef = useRef<Record<string, boolean>>({});

  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { currentLyricsLinesRef.current = currentLyricsLines; }, [currentLyricsLines]);
  useEffect(() => { activeLyricIndexRef.current = activeLyricIndex; }, [activeLyricIndex]);
  useEffect(() => { currentLyricsSyncStatusRef.current = currentLyricsSyncStatus; }, [currentLyricsSyncStatus]);

  const playSong = useCallback((song: Song, customQueue?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (customQueue && customQueue.length > 0) {
      setQueue(customQueue);
      queueRef.current = customQueue;
      const idx = customQueue.findIndex((s) => s.id === song.id);
      const newIdx = idx !== -1 ? idx : 0;
      setQueueIndex(newIdx);
      queueIndexRef.current = newIdx;
    } else if (queueRef.current.length === 0) {
      setQueue([song]);
      queueRef.current = [song];
      setQueueIndex(0);
      queueIndexRef.current = 0;
    }

    setCurrentSong(song);
    currentSongRef.current = song;

    // Immediately display song duration if present from metadata
    if (song.durationSeconds && song.durationSeconds > 0) {
      setDuration(song.durationSeconds);
    }
    setCurrentTime(0);

    const targetUrl = song.audioUrl.startsWith('http')
      ? song.audioUrl
      : `${window.location.origin}${song.audioUrl.startsWith('/') ? '' : '/'}${song.audioUrl}`;

    if (audio.src !== targetUrl) {
      audio.src = targetUrl;
    }

    audio.currentTime = 0;
    audio.volume = isMuted ? 0 : volume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('Playback error notice:', err);
          }
        });
    }
  }, [isMuted, volume]);

  const nextTrack = useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) return;

    let nextIdx = queueIndexRef.current + 1;
    if (isShuffleRef.current) {
      nextIdx = Math.floor(Math.random() * q.length);
    } else if (nextIdx >= q.length) {
      if (repeatModeRef.current === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIdx);
    queueIndexRef.current = nextIdx;
    const nextSong = q[nextIdx];
    if (nextSong) {
      playSong(nextSong);
    }
  }, [playSong]);

  const handleEnded = useCallback(() => {
    if (repeatModeRef.current === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((err) => {
          if (err.name !== 'AbortError') console.warn(err);
        });
      }
      return;
    }
    nextTrack();
  }, [nextTrack]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSongRef.current) return;

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            if (err.name !== 'AbortError') {
              console.warn('Play error:', err);
            }
          });
      }
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = seconds;
      setCurrentTime(seconds);

      const isSynced = currentLyricsSyncStatusRef.current === 'SYNCED';
      const lines = currentLyricsLinesRef.current;
      const lineIdx = findActiveLyricIndex(seconds * 1000, lines, isSynced);
      activeLyricIndexRef.current = lineIdx;
      setActiveLyricIndex(lineIdx);
    } catch (e) {
      console.warn('Seek error:', e);
    }
  }, []);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const q = queueRef.current;
    if (q.length === 0) return;
    const prevIdx = queueIndexRef.current > 0 ? queueIndexRef.current - 1 : q.length - 1;
    setQueueIndex(prevIdx);
    queueIndexRef.current = prevIdx;
    const prevSong = q[prevIdx];
    if (prevSong) {
      playSong(prevSong);
    }
  }, [currentTime, playSong]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.volume = nextMute ? 0 : volume;
    }
  }, [isMuted, volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Event handlers on the declarative HTML5 <audio> tag
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    setCurrentTime(audio.currentTime);

    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }

    const isSynced = currentLyricsSyncStatusRef.current === 'SYNCED';
    const lines = currentLyricsLinesRef.current;
    const lineIdx = findActiveLyricIndex(audio.currentTime * 1000, lines, isSynced);
    if (lineIdx !== activeLyricIndexRef.current) {
      activeLyricIndexRef.current = lineIdx;
      setActiveLyricIndex(lineIdx);
    }
  };

  // High-frequency playback sync timer (every 100ms) for ultra-smooth lyrics highlight
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const audio = audioRef.current;
      if (!audio || audio.paused) return;

      const cTime = audio.currentTime;
      setCurrentTime(cTime);

      // 30-second qualified stream telemetry detection
      const cSong = currentSongRef.current;
      if (cSong && cTime >= 30 && !qualifiedStreamLoggedRef.current[cSong.id]) {
        qualifiedStreamLoggedRef.current[cSong.id] = true;
        fetch('/api/v1/telemetry/play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            songId: cSong.id,
            durationPlayedSeconds: Math.round(cTime),
          }),
        }).catch(() => {});
      }

      const isSynced = currentLyricsSyncStatusRef.current === 'SYNCED';
      const lines = currentLyricsLinesRef.current;
      const lineIdx = findActiveLyricIndex(cTime * 1000, lines, isSynced);
      if (lineIdx !== activeLyricIndexRef.current) {
        activeLyricIndexRef.current = lineIdx;
        setActiveLyricIndex(lineIdx);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }
  };

  const handleDurationChange = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }
  };

  // Load lyrics when current song changes
  useEffect(() => {
    if (!currentSong) {
      setCurrentLyricsLines([]);
      currentLyricsLinesRef.current = [];
      setActiveLyricIndex(-1);
      activeLyricIndexRef.current = -1;
      setCurrentLyricsSyncStatus('UNSYNCED');
      currentLyricsSyncStatusRef.current = 'UNSYNCED';
      setCurrentLyricsFullText('');
      return;
    }

    let isMounted = true;
    const fetchLyrics = async () => {
      try {
        const res = await fetch(`/api/v1/lyrics/${currentSong.id}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.data) {
            const isSynced = data.data.syncStatus === 'SYNCED' || (data.data.isSynced && data.data.syncStatus !== 'UNSYNCED');
            const syncStatus: LyricSyncStatus = data.data.syncStatus || (isSynced ? 'SYNCED' : 'UNSYNCED');
            setCurrentLyricsSyncStatus(syncStatus);
            currentLyricsSyncStatusRef.current = syncStatus;
            setCurrentLyricsFullText(data.data.fullText || '');

            const fetchedLines: LyricLine[] = data.data.lines || [];
            setCurrentLyricsLines(fetchedLines);
            currentLyricsLinesRef.current = fetchedLines;

            // Immediately calculate initial active line
            const audio = audioRef.current;
            const currentMs = audio ? audio.currentTime * 1000 : 0;
            const initialIdx = isSynced ? findActiveLyricIndex(currentMs, fetchedLines, true) : -1;
            activeLyricIndexRef.current = initialIdx;
            setActiveLyricIndex(initialIdx);
          }
        }
      } catch {
        // No lyrics or offline
      }
    };

    fetchLyrics();
    return () => { isMounted = false; };
  }, [currentSong]);

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        duration,
        currentTime,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
        isQueueOpen,
        isLyricsOpen,
        isExpandedOpen,
        activeLyricIndex,
        currentLyricsLines,
        currentLyricsSyncStatus,
        currentLyricsFullText,
        playSong,
        togglePlay,
        seek,
        nextTrack,
        prevTrack,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        addToQueue,
        removeFromQueue,
        setIsQueueOpen,
        setIsLyricsOpen,
        setIsExpandedOpen,
      }}
    >
      <audio
        ref={audioRef}
        id="talent5-global-audio"
        preload="auto"
        className="hidden"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onError={(e) => {
          const audio = e.currentTarget;
          console.warn('Audio playback notice:', audio.error);
          setIsPlaying(false);
        }}
      />
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
