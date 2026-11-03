import { useFocusEffect } from '@react-navigation/native';
import { ChevronDown, Pause, Play, SkipBack, SkipForward } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { GestureResponderEvent, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resolveUrl } from '../config';
import { playerEngine } from '../player/engine';
import { formatTime, useProgress } from '../player/useProgress';
import { NOW_PLAYING_VIDEO_TOP, nowPlayingVideoHeight } from '../player/YouTubePlayerOverlay';
import { usePlayerStore } from '../stores/usePlayerStore';
import { colors } from '../theme';

const NowPlayingScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const { currentSong, isPlaying, togglePlay, playNext, playPrevious, setNowPlayingOpen } = usePlayerStore();
  const { position, duration } = useProgress();
  const [barWidth, setBarWidth] = useState(1);

  // the YouTube overlay moves into the artwork area while this screen is open
  useFocusEffect(
    useCallback(() => {
      setNowPlayingOpen(true);
      return () => setNowPlayingOpen(false);
    }, [setNowPlayingOpen]),
  );

  if (!currentSong) {
    navigation.goBack();
    return null;
  }

  const isYouTube = currentSong.source === 'youtube';
  const artworkSize = width - 32;

  const seek = (event: GestureResponderEvent) => {
    if (!duration) return;
    playerEngine.seek((event.nativeEvent.locationX / barWidth) * duration);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel='Close'>
          <ChevronDown color={colors.text} size={28} />
        </Pressable>
        <Text style={styles.topTitle}>Now Playing</Text>
        <View style={styles.topSpacer} />
      </View>

      {isYouTube ? (
        // the video player is drawn here by YouTubePlayerOverlay
        <View style={{ height: nowPlayingVideoHeight(width), marginTop: NOW_PLAYING_VIDEO_TOP - 56 }} />
      ) : (
        <Image
          source={{ uri: resolveUrl(currentSong.imageUrl) }}
          style={[styles.artwork, { width: artworkSize, height: artworkSize }]}
        />
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {currentSong.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentSong.artist}
        </Text>
      </View>

      <Pressable style={styles.barTouch} onPress={seek} onLayout={e => setBarWidth(e.nativeEvent.layout.width)}>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${duration ? Math.min(100, (position / duration) * 100) : 0}%` }]} />
        </View>
      </Pressable>
      <View style={styles.times}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={playPrevious} hitSlop={12} accessibilityLabel='Previous'>
          <SkipBack color={colors.text} fill={colors.text} size={34} />
        </Pressable>
        <Pressable style={styles.playButton} onPress={togglePlay} accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? (
            <Pause color={colors.accentText} fill={colors.accentText} size={34} />
          ) : (
            <Play color={colors.accentText} fill={colors.accentText} size={34} />
          )}
        </Pressable>
        <Pressable onPress={playNext} hitSlop={12} accessibilityLabel='Next'>
          <SkipForward color={colors.text} fill={colors.text} size={34} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
export default NowPlayingScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#121212', paddingHorizontal: 16 },
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topSpacer: { width: 28 },
  topTitle: { color: colors.text, fontWeight: '700', fontSize: 14 },
  artwork: { borderRadius: 8, marginTop: 16, backgroundColor: colors.card },
  info: { marginTop: 28 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  artist: { color: colors.muted, fontSize: 16, marginTop: 4 },
  barTouch: { marginTop: 24, paddingVertical: 10 },
  bar: { height: 4, borderRadius: 2, backgroundColor: '#52525b' },
  barFill: { height: 4, borderRadius: 2, backgroundColor: colors.text },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { color: colors.muted, fontSize: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 24 },
  playButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
});
