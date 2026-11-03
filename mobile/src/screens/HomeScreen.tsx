import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Chips from '../components/Chips';
import SongCard, { SongRow } from '../components/SongCard';
import { useVideoDockPadding } from '../layout';
import { useMusicStore } from '../stores/useMusicStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { colors } from '../theme';
import { Song } from '../types';

const UPLOADS = 'uploads';

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const HomeScreen = ({ navigation }: any) => {
  const { rows, librarySongs, categorySongs, isLoading, error, fetchHome, fetchCategory } = useMusicStore();
  const playQueue = usePlayerStore(state => state.playQueue);
  const [active, setActive] = useState('all');
  const bottomPadding = useVideoDockPadding();

  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  useEffect(() => {
    if (active !== 'all' && active !== UPLOADS) fetchCategory(active);
  }, [active, fetchCategory]);

  const chips = useMemo(
    () => [{ id: 'all', name: 'All' }, { id: UPLOADS, name: 'Uploaded by us' }, ...rows.map(({ id, name }) => ({ id, name }))],
    [rows],
  );

  const openCategory = (id: string, title: string, songs: Song[]) =>
    navigation.navigate('Category', { id, title, songs: id === UPLOADS ? songs : undefined });

  const header = (
    <View>
      <Text style={styles.greeting}>{greeting()}</Text>
      <Chips chips={chips} active={active} onSelect={setActive} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );

  // a single category: vertical list of all its songs
  if (active !== 'all') {
    const row = rows.find(r => r.id === active);
    const songs = active === UPLOADS ? librarySongs : categorySongs[active] || row?.songs || [];
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <FlatList
          data={songs}
          keyExtractor={song => song._id}
          ListHeaderComponent={header}
          renderItem={({ item, index }) => <SongRow song={item} onPress={() => playQueue(songs, index)} />}
          contentContainerStyle={{ paddingBottom: bottomPadding + 16 }}
        />
      </SafeAreaView>
    );
  }

  const sections = [
    { id: UPLOADS, name: 'Uploaded by us', group: 'Our library', songs: librarySongs },
    ...rows,
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPadding + 16 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchHome} tintColor={colors.text} />}
      >
        {header}
        {isLoading && !rows.length && <ActivityIndicator color={colors.accent} style={styles.loader} />}
        {sections.map((section, i) => (
          <View key={section.id} style={styles.section}>
            {section.group !== sections[i - 1]?.group && <Text style={styles.group}>{section.group}</Text>}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.name}</Text>
              <Pressable onPress={() => openCategory(section.id, section.name, section.songs)} hitSlop={8}>
                <Text style={styles.showAll}>Show all</Text>
              </Pressable>
            </View>
            <FlatList
              horizontal
              data={section.songs}
              keyExtractor={song => song._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rowContent}
              renderItem={({ item, index }) => <SongCard song={item} onPress={() => playQueue(section.songs, index)} />}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
export default HomeScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  greeting: { color: colors.text, fontSize: 26, fontWeight: '800', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  error: { color: colors.danger, paddingHorizontal: 16, marginBottom: 8 },
  loader: { marginTop: 40 },
  section: { marginTop: 18 },
  group: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  showAll: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  rowContent: { paddingHorizontal: 16 },
});
