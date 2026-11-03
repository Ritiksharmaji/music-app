import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SongRow } from '../components/SongCard';
import SourceLabel from '../components/SourceLabel';
import { useVideoDockPadding } from '../layout';
import { useMusicStore } from '../stores/useMusicStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { colors } from '../theme';

const CategoryScreen = ({ route }: any) => {
  const { id, songs: passedSongs, source } = route.params;
  const { categorySongs, fetchCategory } = useMusicStore();
  const playQueue = usePlayerStore(state => state.playQueue);
  const bottomPadding = useVideoDockPadding();

  useEffect(() => {
    if (!passedSongs) fetchCategory(id);
  }, [id, passedSongs, fetchCategory]);

  const songs = passedSongs || categorySongs[id];
  if (!songs)
    return <ActivityIndicator color={colors.accent} style={styles.loader} />;

  return (
    <FlatList
      style={styles.list}
      data={songs}
      keyExtractor={song => song._id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.count}>{songs.length} songs</Text>
          {source && <SourceLabel source={source} />}
        </View>
      }
      renderItem={({ item, index }) => (
        <SongRow
          song={item}
          index={index}
          onPress={() => playQueue(songs, index)}
        />
      )}
      contentContainerStyle={{ paddingBottom: bottomPadding + 16 }}
    />
  );
};
export default CategoryScreen;

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  count: { color: colors.muted },
});
