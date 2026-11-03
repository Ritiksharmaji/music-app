import { BottomTabBar, BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Library, MessageCircle, Search, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MiniPlayer from '../components/MiniPlayer';
import { TAB_BAR_HEIGHT } from '../layout';
import AlbumScreen from '../screens/AlbumScreen';
import AuthScreen from '../screens/AuthScreen';
import CategoryScreen from '../screens/CategoryScreen';
import ChatScreen from '../screens/ChatScreen';
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import MessagesScreen from '../screens/MessagesScreen';
import NowPlayingScreen from '../screens/NowPlayingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import { useAuthStore } from '../stores/useAuthStore';
import { colors } from '../theme';

const Root = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const LibraryStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, card: colors.background, primary: colors.accent },
};

const stackOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

// screens pushed inside a tab keep the tab bar and mini player visible
const HomeTab = () => (
  <HomeStack.Navigator screenOptions={stackOptions}>
    <HomeStack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
    <HomeStack.Screen name='Category' component={CategoryScreen} options={({ route }: any) => ({ title: route.params.title })} />
    <HomeStack.Screen name='Album' component={AlbumScreen} options={{ title: '' }} />
  </HomeStack.Navigator>
);

const LibraryTab = () => (
  <LibraryStack.Navigator screenOptions={stackOptions}>
    <LibraryStack.Screen name='Library' component={LibraryScreen} options={{ headerShown: false }} />
    <LibraryStack.Screen name='Album' component={AlbumScreen} options={{ title: '' }} />
  </LibraryStack.Navigator>
);

const MessagesTab = () => (
  <MessagesStack.Navigator screenOptions={stackOptions}>
    <MessagesStack.Screen name='Messages' component={MessagesScreen} options={{ headerShown: false }} />
    <MessagesStack.Screen name='Chat' component={ChatScreen} options={({ route }: any) => ({ title: route.params.title })} />
  </MessagesStack.Navigator>
);

// the mini player sits directly above the tab bar
const TabBarWithMiniPlayer = (props: BottomTabBarProps) => (
  <>
    <MiniPlayer />
    <BottomTabBar {...props} />
  </>
);

type IconProps = { color: string };
const HomeIcon = ({ color }: IconProps) => <Home color={color} size={24} />;
const SearchIcon = ({ color }: IconProps) => <Search color={color} size={24} />;
const LibraryIcon = ({ color }: IconProps) => <Library color={color} size={24} />;
const MessagesIcon = ({ color }: IconProps) => <MessageCircle color={color} size={24} />;
const ProfileIcon = ({ color }: IconProps) => <User color={color} size={24} />;

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tabs.Navigator
      tabBar={TabBarWithMiniPlayer}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.subtle,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen name='HomeTab' component={HomeTab} options={{ title: 'Home', tabBarIcon: HomeIcon }} />
      <Tabs.Screen name='Search' component={SearchScreen} options={{ tabBarIcon: SearchIcon }} />
      <Tabs.Screen name='LibraryTab' component={LibraryTab} options={{ title: 'Library', tabBarIcon: LibraryIcon }} />
      <Tabs.Screen name='MessagesTab' component={MessagesTab} options={{ title: 'Messages', tabBarIcon: MessagesIcon }} />
      <Tabs.Screen name='Profile' component={ProfileScreen} options={{ tabBarIcon: ProfileIcon }} />
    </Tabs.Navigator>
  );
};

const RootNavigator = () => {
  const user = useAuthStore(state => state.user);
  return (
    <NavigationContainer theme={theme}>
      <Root.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        {user ? (
          <>
            <Root.Screen name='Tabs' component={TabNavigator} />
            {/* a regular screen (not a native modal) so the YouTube player overlay can draw above it */}
            <Root.Screen
              name='NowPlaying'
              component={NowPlayingScreen}
              options={{ animation: 'slide_from_bottom', gestureEnabled: true, gestureDirection: 'vertical' }}
            />
          </>
        ) : (
          <>
            <Root.Screen name='Login' component={AuthScreen} />
            <Root.Screen name='Signup' component={AuthScreen} />
          </>
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
};
export default RootNavigator;
