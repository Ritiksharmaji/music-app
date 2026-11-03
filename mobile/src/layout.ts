import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from './stores/usePlayerStore';

export const TAB_BAR_HEIGHT = 56;
export const MINI_PLAYER_HEIGHT = 60;
export const VIDEO_DOCK_HEIGHT = 200; // YouTube requires an embedded player of at least 200x200

// height of the docked YouTube player, so scroll views can leave room for it
export const useVideoDockPadding = () => {
  const isYouTube = usePlayerStore(state => state.currentSong?.source === 'youtube');
  return isYouTube ? VIDEO_DOCK_HEIGHT + 16 : 0;
};

export const useTabBarHeight = () => TAB_BAR_HEIGHT + useSafeAreaInsets().bottom;
