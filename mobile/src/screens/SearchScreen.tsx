import { Search } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SongRow } from '../components/SongCard';
import { useVideoDockPadding } from '../layout';
import { useMusicStore } from '../stores/useMusicStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { colors } from '../theme';
import { Song } from '../types';

// searches our uploads and every catalog category (all cached by the backend)
const SearchScreen = () => {
  const { rows, librarySongs, categorySongs, fetchCategory } = useMusicStore();
  const playQueue = usePlayerStore(state => state.playQueue);
  const [query, setQuery] = useState('');
  const bottomPadding = useVideoDockPadding();

  useEffect(() => {
    rows.forEach(row => fetchCategory(row.id));
  }, [rows, fetchCategory]);

  const allSongs = useMemo(() => {
    const seen = new Set<string>();
    const songs: Song[] = [];
    for (const song of [...librarySongs, ...rows.flatMap(row => categorySongs[row.id] || row.songs)]) {
      if (!seen.has(song._id)) {
        seen.add(song._id);
        songs.push(song);
      }
    }
    return songs;
  }, [librarySongs, rows, categorySongs]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allSongs.filter(song => `${song.title} ${song.artist}`.toLowerCase().includes(q)).slice(0, 100);
  }, [allSongs, query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.heading}>Search</Text>
      <View style={styles.searchBox}>
        <Search color={colors.background} size={20} />
        <TextInput
          style={styles.input}
          placeholder='Songs or artists'
          placeholderTextColor={colors.subtle}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType='search'
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={song => song._id}
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{ paddingBottom: bottomPadding + 16 }}
        ListEmptyComponent={
          <Text style={styles.hint}>
            {query ? 'No songs found' : `Search ${allSongs.length} songs across Bollywood, Hollywood and Indian regional music`}
          </Text>
        }
        renderItem={({ item, index }) => <SongRow song={item} onPress={() => playQueue(results, index)} />}
      />
    </SafeAreaView>
  );
};
export default SearchScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  heading: { color: colors.text, fontSize: 26, fontWeight: '800', padding: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.text,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: { flex: 1, height: 46, fontSize: 16, color: colors.background },
  hint: { color: colors.muted, textAlign: 'center', padding: 32 },
});
