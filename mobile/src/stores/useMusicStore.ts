import { create } from 'zustand';
import { api, errorMessage } from '../api/client';
import { Album, DiscoverRow, Song } from '../types';

interface MusicStore {
  rows: DiscoverRow[];
  librarySongs: Song[];
  albums: Album[];
  categorySongs: Record<string, Song[]>;
  currentAlbum: Album | null;
  isLoading: boolean;
  error: string | null;

  fetchHome: () => Promise<void>;
  fetchCategory: (id: string) => Promise<void>;
  fetchAlbum: (id: string) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  rows: [],
  librarySongs: [],
  albums: [],
  categorySongs: {},
  currentAlbum: null,
  isLoading: false,
  error: null,

  fetchHome: async () => {
    set({ isLoading: true, error: null });
    try {
      const [rows, library, albums] = await Promise.all([
        api.get('/discover/home'),
        api.get('/songs/library'),
        api.get('/albums'),
      ]);
      set({ rows: rows.data, librarySongs: library.data, albums: albums.data });
    } catch (error) {
      set({ error: errorMessage(error, 'Could not load music') });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategory: async id => {
    if (get().categorySongs[id]) return;
    try {
      const response = await api.get(`/discover/${id}`);
      set(state => ({ categorySongs: { ...state.categorySongs, [id]: response.data.songs } }));
    } catch (error) {
      set({ error: errorMessage(error, 'Could not load category') });
    }
  },

  fetchAlbum: async id => {
    set({ currentAlbum: null });
    try {
      const response = await api.get(`/albums/${id}`);
      set({ currentAlbum: response.data });
    } catch (error) {
      set({ error: errorMessage(error, 'Could not load album') });
    }
  },
}));
