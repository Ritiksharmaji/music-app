# Deployment (AWS Lightsail)

One small server runs everything. Caddy handles HTTPS and forwards all three subdomains to the same app container, which serves the API, Socket.IO and the built web app.

| URL | What |
|---|---|
| https://music.onekampus.com | User app (listen, browse, chat) |
| https://music-admin.onekampus.com | Admin dashboard (opens `/admin`; only `ADMIN_EMAIL` can use it) |
| https://music-api.onekampus.com | API for the mobile app (REST, Socket.IO, media links, YouTube player page) |

```
Internet ──▶ Caddy :443 (Let's Encrypt) ──▶ app :5001 (Node: API + sockets + web app) ──▶ mongo :27017
                                                │
                                                └──▶ S3 bucket (uploads), YouTube API, Jamendo API
```

## AWS resources (onekampus account, ap-south-1)

| Resource | Name | Notes |
|---|---|---|
| Lightsail instance | `music-app` | `micro_3_1` (1 GB RAM, 2 vCPU, 40 GB), Ubuntu 24.04, Docker, 2 GB swap. About $7/month. |
| Static IP | `music-app-ip` → `13.207.89.19` | Free while attached |
| Firewall | ports 22, 80, 443 | |
| SSH key | `music-app-key` | Private key only at `~/.ssh/music-app-lightsail.pem` on the Mac |
| IAM user | `music-app-server` | Inline policy: Put/Get/Delete objects in `spotify-clone-media-084767318696` only. Its access key is only in the server's `.env`. |
| S3 bucket | `spotify-clone-media-084767318696` | Private; media served through presigned URLs |

DNS (GoDaddy, `onekampus.com`): `A` records `music`, `music-admin` and `music-api` → `13.207.89.19`.

## Files

| File | Purpose |
|---|---|
| `Dockerfile` | Backend + pre-built `frontend/dist` (Node 22 Alpine) |
| `docker-compose.yml` | `app`, `mongo` (WiredTiger cache limited to 0.25 GB), `caddy` |
| `Caddyfile` | The three sites; `/admin` on the user site redirects to the admin subdomain |
| `.env.example` | Server settings template. The real `.env` lives only on the server at `/opt/music-app/deploy/.env`. |
| `deploy.sh` | Build the web app, upload, `docker compose up -d --build` |

Server data lives in `/opt/music-app/deploy/data/`: `mongo/` (database), `caddy/` (certificates) and `cache/` (catalog cache). `deploy.sh` never touches it.

## Deploy an update

```bash
deploy/deploy.sh
```

## Everyday commands

SSH in:

```bash
ssh -i ~/.ssh/music-app-lightsail.pem ubuntu@13.207.89.19
```

On the server, in `/opt/music-app/deploy`:

```bash
docker compose ps
```

```bash
docker compose logs -f app
```

```bash
docker compose restart app
```

Back up the database to your Mac:

```bash
ssh -i ~/.ssh/music-app-lightsail.pem ubuntu@13.207.89.19 "docker exec deploy-mongo-1 mongodump --db spotify-clone --archive --gzip" > music-backup.gz
```

## Costs and limits

- About **$7/month** for the server. S3 costs a few cents. YouTube, Jamendo, Let's Encrypt and the static IP are free.
- Good for personal use up to a few hundred users. For more, move MongoDB to Atlas or DocumentDB and run the app on ECS behind a load balancer (see `system-design.md`).
- To stop all charges, delete the Lightsail instance **and** release the static IP.
