import * as Keychain from 'react-native-keychain';
import { create } from 'zustand';
import { api, errorMessage, setApiToken } from '../api/client';
import { AuthUser } from '../types';

const KEYCHAIN_SERVICE = 'music-app-token';

const saveToken = async (token: string | null) => {
  setApiToken(token);
  if (token) await Keychain.setGenericPassword('token', token, { service: KEYCHAIN_SERVICE });
  else await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
};

interface AuthStore {
  user: AuthUser | null;
  isAdmin: boolean;
  isCheckingAuth: boolean;
  isLoading: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAdmin: false,
  isCheckingAuth: true,
  isLoading: false,
  error: null,

  checkAuth: async () => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
      if (!credentials) return;
      setApiToken(credentials.password);
      const response = await api.get('/auth/me');
      set({ user: response.data });
      checkAdmin(set);
    } catch {
      await saveToken(null);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      await saveToken(response.data.token);
      set({ user: response.data.user });
      checkAdmin(set);
    } catch (error) {
      set({ error: errorMessage(error, 'Login failed') });
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (fullName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/signup', { fullName, email, password });
      await saveToken(response.data.token);
      set({ user: response.data.user });
    } catch (error) {
      set({ error: errorMessage(error, 'Sign up failed') });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await saveToken(null);
    set({ user: null, isAdmin: false, error: null });
  },

  clearError: () => get().error && set({ error: null }),
}));

const checkAdmin = async (set: (state: Partial<AuthStore>) => void) => {
  try {
    const response = await api.get('/admin/check');
    set({ isAdmin: response.data.admin });
  } catch {
    set({ isAdmin: false });
  }
};
