import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveUrl } from '../config';
import { usePlayerStore } from '../stores/usePlayerStore';
import { colors } from '../theme';
import { Song } from '../types';

// square card for horizontal rows
const SongCard = ({ song, onPress }: { song: Song; onPress: () => void }) => {
  const isCurrent = usePlayerStore(state => state.currentSong?._id === song._id);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={{ uri: resolveUrl(song.imageUrl) }} style={styles.image} />
      <Text style={[styles.title, isCurrent && styles.current]} numberOfLines={1}>
        {song.title}
      </Text>
      <Text style={styles.artist} numberOfLines={1}>
        {song.artist}
      </Text>
    </Pressable>
  );
};
export default SongCard;

export const SongRow = ({ song, index, onPress }: { song: Song; index?: number; onPress: () => void }) => {
  const isCurrent = usePlayerStore(state => state.currentSong?._id === song._id);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      {index !== undefined && <Text style={styles.index}>{index + 1}</Text>}
      <Image source={{ uri: resolveUrl(song.imageUrl) }} style={styles.rowImage} />
      <View style={styles.rowInfo}>
        <Text style={[styles.rowTitle, isCurrent && styles.current]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>
    </Pressable>
  );
};

const CARD = 140;

const styles = StyleSheet.create({
  card: { width: CARD, marginRight: 12 },
  pressed: { opacity: 0.7 },
  image: { width: CARD, height: CARD, borderRadius: 6, backgroundColor: colors.card },
  title: { color: colors.text, fontWeight: '600', fontSize: 13, marginTop: 8 },
  current: { color: colors.accent },
  artist: { color: colors.muted, fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, gap: 12 },
  rowPressed: { backgroundColor: colors.surface },
  index: { color: colors.muted, width: 20, textAlign: 'right' },
  rowImage: { width: 48, height: 48, borderRadius: 4, backgroundColor: colors.card },
  rowInfo: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 15 },
});
