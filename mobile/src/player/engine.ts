import TrackPlayer from 'react-native-track-player';
import { usePlayerStore } from '../stores/usePlayerStore';

// One API for progress / seeking across both players. The YouTube WebView pushes its
// progress to us (see YouTubePlayerOverlay), so reads are synchronous.
export type WebViewHandle = { injectJavaScript: (script: string) => void };

let youtube: WebViewHandle | null = null;
let youtubeProgress = { position: 0, duration: 0 };

const isYouTube = () => usePlayerStore.getState().currentSong?.source === 'youtube';

export const playerEngine = {
  registerYouTube: (webView: WebViewHandle | null) => {
    youtube = webView;
  },

  // run a command on window.player inside the YouTube WebView
  youtubeCommand: (command: string) => {
    youtube?.injectJavaScript(`window.player && window.player.${command}; true;`);
  },

  setYouTubeProgress: (progress: { position: number; duration: number }) => {
    youtubeProgress = progress;
  },

  getProgress: async (): Promise<{ position: number; duration: number }> => {
    if (isYouTube()) return youtubeProgress;
    try {
      const { position, duration } = await TrackPlayer.getProgress();
      return { position, duration };
    } catch {
      return { position: 0, duration: 0 };
    }
  },

  seek: async (seconds: number) => {
    if (isYouTube()) playerEngine.youtubeCommand(`seek(${Math.floor(seconds)})`);
    else await TrackPlayer.seekTo(seconds);
  },
};
