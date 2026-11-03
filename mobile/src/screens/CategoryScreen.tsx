import { useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';
import { SongRow } from '../components/SongCard';
import { useVideoDockPadding } from '../layout';
import { useMusicStore } from '../stores/useMusicStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { colors } from '../theme';

const CategoryScreen = ({ route }: any) => {
  const { id, songs: passedSongs } = route.params;
  const { categorySongs, fetchCategory } = useMusicStore();
  const playQueue = usePlayerStore(state => state.playQueue);
  const bottomPadding = useVideoDockPadding();

  useEffect(() => {
    if (!passedSongs) fetchCategory(id);
  }, [id, passedSongs, fetchCategory]);

  const songs = passedSongs || categorySongs[id];
  if (!songs) return <ActivityIndicator color={colors.accent} style={styles.loader} />;

  return (
    <FlatList
      style={styles.list}
      data={songs}
      keyExtractor={song => song._id}
      ListHeaderComponent={<Text style={styles.count}>{songs.length} songs</Text>}
      renderItem={({ item, index }) => <SongRow song={item} index={index} onPress={() => playQueue(songs, index)} />}
      contentContainerStyle={{ paddingBottom: bottomPadding + 16 }}
    />
  );
};
export default CategoryScreen;

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, backgroundColor: colors.background },
  count: { color: colors.muted, paddingHorizontal: 16, paddingVertical: 8 },
});
