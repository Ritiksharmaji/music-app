import { LogOut } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import { useAuthStore } from '../stores/useAuthStore';
import { useMusicStore } from '../stores/useMusicStore';
import { colors } from '../theme';

const ProfileScreen = () => {
  const { user, isAdmin, logout } = useAuthStore();
  const { librarySongs, rows } = useMusicStore();
  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Avatar uri={user.imageUrl} name={user.fullName} size={96} />
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {isAdmin && <Text style={styles.badge}>Admin · manage songs on the web dashboard</Text>}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{librarySongs.length}</Text>
          <Text style={styles.statLabel}>Our uploads</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{rows.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>

      <Pressable style={styles.logout} onPress={logout}>
        <LogOut color={colors.text} size={18} />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </SafeAreaView>
  );
};
export default ProfileScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { alignItems: 'center', marginTop: 32, gap: 6 },
  name: { color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 12 },
  email: { color: colors.muted },
  badge: { color: colors.accent, marginTop: 6, fontSize: 12 },
  stats: { flexDirection: 'row', justifyContent: 'center', gap: 48, marginTop: 32 },
  stat: { alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 'auto',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 999,
    height: 48,
  },
  logoutText: { color: colors.text, fontWeight: '700' },
});
