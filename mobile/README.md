# Music — React Native app

The mobile app (iOS + Android) for the music platform. It is built with the **React Native CLI** (not Expo) and talks to the same backend as the web app.

| Feature | How |
|---|---|
| Email/password login | `POST /api/auth/login`; JWT stored in the iOS Keychain / Android Keystore (`react-native-keychain`) |
| Home with category chips | "Uploaded by us" + 14 YouTube categories from `/api/discover/home` |
| Search | Across our uploads and every category (all ~690 songs) |
| Library | Albums created by the admin |
| Our uploads (S3) | `react-native-track-player`: full length, background audio, lock-screen controls |
| Catalog songs (YouTube) | Our own player page (`/api/discover/player`) in a visible WebView, as YouTube's terms require |
| Now Playing | Full-screen player with seek / previous / next |
| Messages | Online status, what friends are playing, real-time chat (Socket.IO) |

> Admin uploads stay on the web dashboard.

## Run it

Prerequisites: Node 20+, Xcode + CocoaPods (iOS), Android Studio SDK + JDK 17 (Android).

1. Start the backend **and** the web frontend from the repo root. The app loads seeded songs and S3 media through the web dev server on port 3000:
   ```bash
   npm run dev --prefix backend
   ```
   ```bash
   npm run dev --prefix frontend
   ```
2. Install dependencies:
   ```bash
   cd mobile && npm install
   ```
   ```bash
   cd ios && bundle install && bundle exec pod install && cd ..
   ```
3. Start Metro, then run on a simulator or emulator:
   ```bash
   npm start
   ```
   ```bash
   npm run ios
   ```
   ```bash
   npm run android
   ```

### Server address

`src/config.ts` picks the backend address:

| Where | Address |
|---|---|
| iOS simulator | `http://localhost:5001` (API), `:3000` (media) |
| Android emulator | `http://10.0.2.2:5001` / `:3000` |
| Physical phone | set `DEV_HOST` to your Mac's LAN IP |
| Release build | `PROD_ORIGIN` (your deployed domain) |

## Code map

```
src/
  api/client.ts            axios instance + auth header
  stores/                  zustand: auth, music, player, chat
  player/
    PlaybackController.tsx drives react-native-track-player for uploads
    YouTubePlayerOverlay.tsx  the visible YouTube WebView (docked / Now Playing)
    engine.ts              one progress/seek API over both players
    trackPlayer.ts         setup, track loading, lock-screen service
  navigation/RootNavigator.tsx  auth stack / tabs (Home, Search, Library, Messages, Profile) / Now Playing
  screens/                 one file per screen
  components/              mini player, song cards, chips, avatar
```

## Known limits

- YouTube songs stop when the app goes to the background. YouTube's terms forbid background or audio-only playback, and the stores reject apps that do it. Uploaded songs keep playing.
- The YouTube player must stay visible (at least 200 px), so it docks above the mini player while a catalog song plays.
