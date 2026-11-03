import { useEffect, useRef } from 'react';
import TrackPlayer, { Event, useTrackPlayerEvents } from 'react-native-track-player';
import { usePlayerStore } from '../stores/usePlayerStore';
import { loadSong, setupTrackPlayer } from './trackPlayer';

// Drives react-native-track-player for our own (S3 / seeded) songs.
const PlaybackController = () => {
  const currentSong = usePlayerStore(state => state.currentSong);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const loadedId = useRef<string | null>(null);
  const isUpload = !!currentSong && currentSong.source !== 'youtube';

  useEffect(() => {
    setupTrackPlayer().catch(error => console.warn('Track player setup failed', error));
  }, []);

  // load a new song (or stop when a YouTube song takes over)
  useEffect(() => {
    if (!currentSong || !isUpload) {
      loadedId.current = null;
      TrackPlayer.reset().catch(() => {});
      return;
    }
    if (loadedId.current === currentSong._id) return;
    loadedId.current = currentSong._id;

    loadSong(currentSong)
      .then(() => {
        // the user may have moved on while the URL was loading
        if (loadedId.current === currentSong._id && usePlayerStore.getState().isPlaying) TrackPlayer.play();
      })
      .catch(error => {
        console.warn('Could not play', currentSong.title, error);
        usePlayerStore.getState().playNext();
      });
  }, [currentSong, isUpload]);

  useEffect(() => {
    if (!isUpload) return;
    if (isPlaying) TrackPlayer.play().catch(() => {});
    else TrackPlayer.pause().catch(() => {});
  }, [isPlaying, isUpload]);

  useTrackPlayerEvents([Event.PlaybackQueueEnded], () => {
    if (usePlayerStore.getState().currentSong?.source !== 'youtube') usePlayerStore.getState().playNext();
  });

  return null;
};
export default PlaybackController;
