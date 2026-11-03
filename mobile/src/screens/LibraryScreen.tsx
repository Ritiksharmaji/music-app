import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resolveUrl } from '../config';
import { useVideoDockPadding } from '../layout';
import { useMusicStore } from '../stores/useMusicStore';
import { colors } from '../theme';

// albums (playlists) created by the admin
const LibraryScreen = ({ navigation }: any) => {
  const albums = useMusicStore(state => state.albums);
  const bottomPadding = useVideoDockPadding();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.heading}>Your Library</Text>
      <FlatList
        data={albums}
        keyExtractor={album => album._id}
        contentContainerStyle={{ paddingBottom: bottomPadding + 16 }}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Album', { id: item._id, title: item.title })}
          >
            <Image source={{ uri: resolveUrl(item.imageUrl) }} style={styles.image} />
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>Album • {item.artist}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};
export default LibraryScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  heading: { color: colors.text, fontSize: 26, fontWeight: '800', padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  pressed: { backgroundColor: colors.surface },
  image: { width: 64, height: 64, borderRadius: 4, backgroundColor: colors.card },
  title: { color: colors.text, fontSize: 16, fontWeight: '600' },
  meta: { color: colors.muted, marginTop: 2 },
});
