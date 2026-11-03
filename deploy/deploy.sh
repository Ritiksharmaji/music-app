#!/usr/bin/env bash
# Build the web app, upload backend + deploy files, and (re)start the containers.
# Usage: deploy/deploy.sh   (server .env must already exist at /opt/music-app/deploy/.env)
set -euo pipefail

HOST="${DEPLOY_HOST:-ubuntu@13.207.89.19}"
KEY="${DEPLOY_KEY:-$HOME/.ssh/music-app-lightsail.pem}"
ADMIN_URL="${VITE_ADMIN_URL:-https://music-admin.onekampus.com/admin}"
SSH="ssh -i $KEY"

cd "$(dirname "$0")/.."

echo "› building web app"
VITE_ADMIN_URL="$ADMIN_URL" npm run build --prefix frontend

echo "› uploading"
$SSH "$HOST" "mkdir -p /opt/music-app/frontend/dist"
# .env, data/ (database, certificates, caches) and tmp/ on the server are never touched
rsync -az --delete -e "$SSH" \
	--exclude node_modules --exclude .env --exclude data --exclude tmp --exclude cache \
	backend deploy "$HOST:/opt/music-app/"
rsync -az --delete -e "$SSH" frontend/dist/ "$HOST:/opt/music-app/frontend/dist/"

echo "› starting containers"
$SSH "$HOST" "cd /opt/music-app/deploy && docker compose up -d --build && docker compose ps"
