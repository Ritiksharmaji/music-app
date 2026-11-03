import { useNavigation } from '@react-navigation/native';
import { Pause, Play, SkipForward } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveUrl } from '../config';
import { MINI_PLAYER_HEIGHT } from '../layout';
import { useProgress } from '../player/useProgress';
import { usePlayerStore } from '../stores/usePlayerStore';
import { colors } from '../theme';

const MiniPlayer = () => {
  const navigation = useNavigation<any>();
  const { currentSong, isPlaying, togglePlay, playNext } = usePlayerStore();
  const { position, duration } = useProgress(1000);

  if (!currentSong) return null;

  return (
    <Pressable style={styles.container} onPress={() => navigation.navigate('NowPlaying')}>
      <View style={styles.row}>
        <Image source={{ uri: resolveUrl(currentSong.imageUrl) }} style={styles.artwork} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>
        <Pressable onPress={togglePlay} hitSlop={10} style={styles.button} accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause color={colors.text} size={24} fill={colors.text} /> : <Play color={colors.text} size={24} fill={colors.text} />}
        </Pressable>
        <Pressable onPress={playNext} hitSlop={10} style={styles.button} accessibilityLabel='Next'>
          <SkipForward color={colors.text} size={22} fill={colors.text} />
        </Pressable>
      </View>
      <View style={styles.track}>
        <View style={[styles.progress, { width: `${duration ? Math.min(100, (position / duration) * 100) : 0}%` }]} />
      </View>
    </Pressable>
  );
};
export default MiniPlayer;

const styles = StyleSheet.create({
  container: {
    height: MINI_PLAYER_HEIGHT,
    marginHorizontal: 8,
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: colors.card,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 10 },
  artwork: { width: 44, height: 44, borderRadius: 4, backgroundColor: colors.surface },
  info: { flex: 1 },
  title: { color: colors.text, fontWeight: '600', fontSize: 14 },
  artist: { color: colors.muted, fontSize: 12, marginTop: 2 },
  button: { padding: 6 },
  track: { position: 'absolute', left: 8, right: 8, bottom: 2, height: 2, backgroundColor: '#52525b', borderRadius: 1 },
  progress: { height: 2, backgroundColor: colors.text, borderRadius: 1 },
});
