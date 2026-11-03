import { useEffect, useState } from 'react';
import { usePlayerStore } from '../stores/usePlayerStore';
import { playerEngine } from './engine';

// polls whichever player is active
export const useProgress = (intervalMs = 500) => {
  const currentSong = usePlayerStore(state => state.currentSong);
  const [progress, setProgress] = useState({ position: 0, duration: currentSong?.duration || 0 });

  useEffect(() => {
    let active = true;
    setProgress({ position: 0, duration: currentSong?.duration || 0 });
    const tick = async () => {
      const next = await playerEngine.getProgress();
      if (active && next.duration) setProgress(next);
    };
    const timer = setInterval(tick, intervalMs);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [currentSong, intervalMs]);

  return progress;
};

export const formatTime = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};
