
// Dev: the iOS simulator reaches the Mac on localhost. Android (emulator or USB phone)
// also uses localhost after `npm run android:reverse` forwards the ports over adb.
// Over Wi-Fi without USB, set DEV_HOST to your Mac's LAN IP (e.g. '192.168.1.20').
const DEV_HOST = 'localhost';

// Production: the backend serves the API, sockets and static files from one origin.
const PROD_ORIGIN = 'https://your-domain.com';

export const API_ORIGIN = __DEV__ ? `http://${DEV_HOST}:5001` : PROD_ORIGIN;
export const API_URL = `${API_ORIGIN}/api`;

// Relative song/image paths ("/songs/1.mp3", "/api/media/...") are served by the web
// frontend in dev (Vite serves /public and proxies /api to the backend).
export const ASSET_ORIGIN = __DEV__ ? `http://${DEV_HOST}:3000` : PROD_ORIGIN;

export const resolveUrl = (url?: string) => (url?.startsWith('/') ? `${ASSET_ORIGIN}${url}` : url ?? '');
