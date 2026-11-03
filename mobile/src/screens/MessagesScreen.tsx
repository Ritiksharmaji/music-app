import { Music } from 'lucide-react-native';
import { useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { useVideoDockPadding } from '../layout';
import { useChatStore } from '../stores/useChatStore';
import { colors } from '../theme';

// other users, their online status and what they're listening to right now
const MessagesScreen = ({ navigation }: any) => {
  const { users, onlineUsers, userActivities, isLoading, fetchUsers, setSelectedUser } = useChatStore();
  const bottomPadding = useVideoDockPadding();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.heading}>Messages</Text>
      <FlatList
        data={users}
        keyExtractor={user => user._id}
        contentContainerStyle={{ paddingBottom: bottomPadding + 16 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchUsers} tintColor={colors.text} />}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>No other users yet</Text> : undefined}
        renderItem={({ item }) => {
          const activity = userActivities.get(item._id);
          const isPlaying = activity && activity !== 'Idle';
          return (
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => {
                setSelectedUser(item);
                navigation.navigate('Chat', { title: item.fullName });
              }}
            >
              <Avatar uri={item.imageUrl} name={item.fullName} size={48} online={onlineUsers.has(item._id)} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.fullName}</Text>
                {isPlaying ? (
                  <View style={styles.activity}>
                    <Music color={colors.accent} size={12} />
                    <Text style={styles.playing} numberOfLines={1}>
                      {activity.replace('Playing ', '')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.idle}>{onlineUsers.has(item._id) ? 'Online' : 'Offline'}</Text>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
};
export default MessagesScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  heading: { color: colors.text, fontSize: 26, fontWeight: '800', padding: 16 },
  empty: { color: colors.muted, textAlign: 'center', padding: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  pressed: { backgroundColor: colors.surface },
  info: { flex: 1 },
  name: { color: colors.text, fontSize: 16, fontWeight: '600' },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  playing: { color: colors.accent, fontSize: 13, flex: 1 },
  idle: { color: colors.muted, fontSize: 13, marginTop: 3 },
});
