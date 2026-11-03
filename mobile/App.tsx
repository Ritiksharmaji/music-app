import { useEffect } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import PlaybackController from './src/player/PlaybackController';
import YouTubePlayerOverlay from './src/player/YouTubePlayerOverlay';
import { useAuthStore } from './src/stores/useAuthStore';
import { useChatStore } from './src/stores/useChatStore';
import { usePlayerStore } from './src/stores/usePlayerStore';
import { colors } from './src/theme';

function App() {
  const { user, isCheckingAuth, checkAuth } = useAuthStore();
  const { connect, disconnect } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // realtime presence/chat while logged in; stop the music on logout
  useEffect(() => {
    if (!user) {
      usePlayerStore.getState().stop();
      return;
    }
    connect(user._id);
    return () => disconnect();
  }, [user, connect, disconnect]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle='light-content' />
      {isCheckingAuth ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} size='large' />
        </View>
      ) : (
        <View style={styles.flex}>
          <RootNavigator />
          <PlaybackController />
          <YouTubePlayerOverlay />
        </View>
      )}
    </SafeAreaProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
});
