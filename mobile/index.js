/**
 * @format
 */

import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { name as appName } from './app.json';
import { PlaybackService } from './src/player/trackPlayer';

AppRegistry.registerComponent(appName, () => App);
// lock screen, notification and headphone controls
TrackPlayer.registerPlaybackService(() => PlaybackService);
