import { ComponentType, RefAttributes, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { WebViewMessageEvent, WebViewProps } from 'react-native-webview';
import { API_URL } from '../config';
import { MINI_PLAYER_HEIGHT, VIDEO_DOCK_HEIGHT, useTabBarHeight } from '../layout';
import { usePlayerStore } from '../stores/usePlayerStore';
import { colors } from '../theme';
import { WebViewHandle, playerEngine } from './engine';

// react-native-webview's class typing resolves its props to `never` (WebView<undefined>)
const PlayerWebView = WebView as unknown as ComponentType<WebViewProps & RefAttributes<WebViewHandle>>;

export const nowPlayingVideoHeight = (screenWidth: number) => Math.max(200, Math.round(((screenWidth - 32) * 9) / 16));
export const NOW_PLAYING_VIDEO_TOP = 72;

// YouTube IFrame API states
const ENDED = 0;
const PLAYING = 1;
const PAUSED = 2;

// YouTube's terms require the embedded player to stay visible while it plays, so catalog
// songs play in this video player: docked above the mini player, or in the artwork
// area of the Now Playing screen. It is mounted once so switching screens never reloads it.
// The page it loads is served by our backend (/api/discover/player).
const YouTubePlayerOverlay = () => {
  const webViewRef = useRef<WebViewHandle>(null);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tabBarHeight = useTabBarHeight();

  const currentSong = usePlayerStore(state => state.currentSong);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const nowPlayingOpen = usePlayerStore(state => state.nowPlayingOpen);
  const youtubeId = currentSong?.source === 'youtube' ? currentSong.youtubeId : undefined;

  // mount the WebView with the first YouTube song and keep it afterwards
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (youtubeId) setMounted(true);
  }, [youtubeId]);

  useEffect(() => {
    playerEngine.registerYouTube(webViewRef.current);
    return () => playerEngine.registerYouTube(null);
  }, [mounted]);

  // load a new video
  useEffect(() => {
    if (!ready || !youtubeId) return;
    playerEngine.setYouTubeProgress({ position: 0, duration: currentSong?.duration || 0 });
    playerEngine.youtubeCommand(`load(${JSON.stringify(youtubeId)}, ${usePlayerStore.getState().isPlaying})`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, youtubeId]);

  // play / pause (and pause when an uploaded song takes over)
  useEffect(() => {
    if (!ready) return;
    playerEngine.youtubeCommand(youtubeId && isPlaying ? 'play()' : 'pause()');
  }, [ready, youtubeId, isPlaying]);

  const onMessage = useCallback((event: WebViewMessageEvent) => {
    const { type, data } = JSON.parse(event.nativeEvent.data);
    if (type === 'ready') return setReady(true);
    if (type === 'progress') return playerEngine.setYouTubeProgress(data);

    const player = usePlayerStore.getState();
    // we pause YouTube ourselves when an uploaded song starts; ignore that
    if (player.currentSong?.source !== 'youtube') return;
    if (type === 'error') {
      console.warn('[youtube] error', data, player.currentSong.title);
      player.playNext(); // removed or not embeddable in this region
    }
    if (type === 'state') {
      if (data === ENDED) player.playNext();
      if (data === PLAYING) player.setPlaying(true);
      if (data === PAUSED) player.setPlaying(false);
    }
  }, []);

  if (!mounted) return null;

  const frame = nowPlayingOpen
    ? { top: insets.top + NOW_PLAYING_VIDEO_TOP, left: 16, width: width - 32, height: nowPlayingVideoHeight(width) }
    : { bottom: tabBarHeight + MINI_PLAYER_HEIGHT + 8, left: 8, width: width - 16, height: VIDEO_DOCK_HEIGHT };

  return (
    <View pointerEvents={youtubeId ? 'auto' : 'none'} style={[styles.container, frame, !youtubeId && styles.hidden]}>
      <PlayerWebView
        ref={webViewRef}
        source={{ uri: `${API_URL}/discover/player` }}
        onMessage={onMessage}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={false}
        scrollEnabled={false}
        bounces={false}
        style={styles.webView}
      />
    </View>
  );
};
export default YouTubePlayerOverlay;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 50,
    elevation: 50,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hidden: { opacity: 0, left: -10000 },
  webView: { flex: 1, backgroundColor: colors.background },
});
