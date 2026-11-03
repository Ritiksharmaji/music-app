import { Play } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SongRow } from '../components/SongCard';
import { resolveUrl } from '../config';
import { useVideoDockPadding } from '../layout';
import { useMusicStore } from '../stores/useMusicStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { colors } from '../theme';

const AlbumScreen = ({ route }: any) => {
  const { currentAlbum, fetchAlbum } = useMusicStore();
  const playQueue = usePlayerStore(state => state.playQueue);
  const bottomPadding = useVideoDockPadding();

  useEffect(() => {
    fetchAlbum(route.params.id);
  }, [route.params.id, fetchAlbum]);

  if (!currentAlbum || currentAlbum._id !== route.params.id) {
    return <ActivityIndicator color={colors.accent} style={styles.loader} />;
  }

  const songs = currentAlbum.songs;
  return (
    <FlatList
      style={styles.list}
      data={songs}
      keyExtractor={song => song._id}
      contentContainerStyle={{ paddingBottom: bottomPadding + 16 }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Image source={{ uri: resolveUrl(currentAlbum.imageUrl) }} style={styles.cover} />
          <Text style={styles.title}>{currentAlbum.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {currentAlbum.artist} • {songs.length} songs • {currentAlbum.releaseYear}
            </Text>
            <Pressable style={styles.play} onPress={() => playQueue(songs, 0)} accessibilityLabel='Play album'>
              <Play color={colors.accentText} fill={colors.accentText} size={24} />
            </Pressable>
          </View>
        </View>
      }
      renderItem={({ item, index }) => <SongRow song={item} index={index} onPress={() => playQueue(songs, index)} />}
    />
  );
};
export default AlbumScreen;

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, alignItems: 'center' },
  cover: { width: 220, height: 220, borderRadius: 6, backgroundColor: colors.card },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 16, alignSelf: 'flex-start' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: 8 },
  meta: { color: colors.muted, flex: 1 },
  play: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
