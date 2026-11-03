import { create } from 'zustand';
import { Song } from '../types';
import { useChatStore } from './useChatStore';

// The queue and play/pause state for both sources. The actual players
// (react-native-track-player for uploads, YouTube iframe for catalog songs)
// react to this store; see PlaybackController and YouTubePlayerOverlay.
interface PlayerStore {
  queue: Song[];
  currentIndex: number;
  currentSong: Song | null;
  isPlaying: boolean;
  nowPlayingOpen: boolean;

  playQueue: (songs: Song[], index: number) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
  stop: () => void;
  setNowPlayingOpen: (open: boolean) => void;
}

const reportActivity = (song: Song | null, isPlaying: boolean) =>
  useChatStore.getState().updateActivity(song && isPlaying ? `Playing ${song.title} by ${song.artist}` : 'Idle');

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  queue: [],
  currentIndex: -1,
  currentSong: null,
  isPlaying: false,
  nowPlayingOpen: false,

  playQueue: (songs, index) => {
    if (!songs[index]) return;
    const { currentSong, isPlaying } = get();
    if (currentSong?._id === songs[index]._id) {
      set({ queue: songs, currentIndex: index, isPlaying: !isPlaying });
      reportActivity(currentSong, !isPlaying);
      return;
    }
    set({ queue: songs, currentIndex: index, currentSong: songs[index], isPlaying: true });
    reportActivity(songs[index], true);
  },

  togglePlay: () => get().setPlaying(!get().isPlaying),

  setPlaying: isPlaying => {
    if (!get().currentSong || get().isPlaying === isPlaying) return;
    set({ isPlaying });
    reportActivity(get().currentSong, isPlaying);
  },

  playNext: () => {
    const { queue, currentIndex } = get();
    const next = queue[currentIndex + 1];
    if (!next) return get().setPlaying(false);
    set({ currentIndex: currentIndex + 1, currentSong: next, isPlaying: true });
    reportActivity(next, true);
  },

  playPrevious: () => {
    const { queue, currentIndex } = get();
    const previous = queue[currentIndex - 1];
    if (!previous) return;
    set({ currentIndex: currentIndex - 1, currentSong: previous, isPlaying: true });
    reportActivity(previous, true);
  },

  stop: () => set({ queue: [], currentIndex: -1, currentSong: null, isPlaying: false }),

  setNowPlayingOpen: nowPlayingOpen => set({ nowPlayingOpen }),
}));
