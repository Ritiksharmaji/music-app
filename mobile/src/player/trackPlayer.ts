import TrackPlayer, { AppKilledPlaybackBehavior, Capability, Event } from 'react-native-track-player';
import { api } from '../api/client';
import { resolveUrl } from '../config';
import { usePlayerStore } from '../stores/usePlayerStore';
import { Song } from '../types';

let setupPromise: Promise<void> | null = null;

export const setupTrackPlayer = () => {
  if (!setupPromise) {
    setupPromise = (async () => {
      try {
        await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
      } catch (error: any) {
        // fast refresh: the native player is already set up
        if (!String(error?.message).includes('already been initialized')) throw error;
      }
      await TrackPlayer.updateOptions({
        capabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious, Capability.SeekTo],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
        android: { appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification },
      });
    })();
  }
  return setupPromise;
};

// S3 uploads are "/api/media/..." paths that redirect to a signed URL; ask for the
// signed URL directly so the native player doesn't have to follow the redirect.
const playableUrl = async (audioUrl: string) => {
  if (!audioUrl.startsWith('/api/media/')) return resolveUrl(audioUrl);
  const response = await api.get(audioUrl.replace(/^\/api/, ''), { params: { format: 'json' } });
  return response.data.url as string;
};

export const loadSong = async (song: Song) => {
  await setupTrackPlayer();
  await TrackPlayer.reset();
  await TrackPlayer.add({
    id: song._id,
    url: await playableUrl(song.audioUrl),
    title: song.title,
    artist: song.artist,
    artwork: resolveUrl(song.imageUrl),
    duration: song.duration || undefined,
  });
};

// lock screen / notification / headphone controls (registered in index.js)
export const PlaybackService = async () => {
  const player = () => usePlayerStore.getState();
  TrackPlayer.addEventListener(Event.RemotePlay, () => player().setPlaying(true));
  TrackPlayer.addEventListener(Event.RemotePause, () => player().setPlaying(false));
  TrackPlayer.addEventListener(Event.RemoteNext, () => player().playNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => player().playPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => TrackPlayer.seekTo(position));
};
