<h1 align="center">Realtime Spotify Application ✨</h1>

![Demo App](/frontend/public/screenshot-for-readme.png)

[Watch Full Tutorial on Youtube](https://youtu.be/4sbklcQ0EXc)

About This Course:

-   🎸 Listen to music, play next and previous songs
-   🔈 Update the volume with a slider
-   🎧 Admin dashboard to create albums and songs
-   💬 Real-time Chat App integrated into Spotify
-   👨🏼‍💼 Online/Offline status
-   👀 See what other users are listening to in real-time
-   📊 Aggregate data for the analytics page
-   🚀 And a lot more...

### Documentation

-   📘 [system-flow.md](system-flow.md): step-by-step admin and user guide with screenshots (signing up, playing music, uploading songs)
-   🏗️ [system-design.md](system-design.md): architecture, data model, API, key flows, security and scaling

### What's different in this fork

-   🔐 Email and password login (JWT + bcrypt) instead of Clerk
-   ☁️ Uploads stored in a private **AWS S3** bucket (served through presigned URLs) instead of Cloudinary
-   🇮🇳 Spotify-style category filters with full-length songs from YouTube: Bollywood, Hollywood, Punjabi, Bhojpuri, Haryanvi, Rajasthani, Telugu, Tamil, Kannada, Malayalam, Marathi, Gujarati, Bengali and Odia

### Setup .env file in _backend_ folder

```bash
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/spotify-clone
ADMIN_EMAIL=you@example.com
NODE_ENV=development

JWT_SECRET=...            # openssl rand -hex 32

AWS_PROFILE=...           # AWS credentials profile with access to the bucket
AWS_REGION=ap-south-1
AWS_S3_BUCKET=...

YOUTUBE_API_KEY=...       # Google Cloud key with YouTube Data API v3 enabled
```

The frontend needs no `.env` file.

### Run locally

```bash
npm install --prefix backend && npm run dev --prefix backend     # http://localhost:5001
npm install --prefix frontend && npm run dev --prefix frontend   # http://localhost:3000
```

See [system-flow.md](system-flow.md#part-0--run-the-app-locally) for details.
