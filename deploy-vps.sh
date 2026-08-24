#!/usr/bin/env bash
# Sync local code to the VPS, build there, reload pm2. Never touches .env or uploads/ on the server.
set -e
HOST=${1:-saloneo-vps}
rsync -az --delete --exclude node_modules --exclude dist --exclude .env --exclude uploads --exclude logs --exclude .git \
  ./ "$HOST":/opt/saloneo/
# macOS sends accented filenames in NFD; Linux + browsers expect NFC (e.g. "Salonéo Logo - Icon.webp") → normalize after sync
ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no "$HOST" 'python3 -c "
import os,unicodedata
for d,_,fs in os.walk(\"/opt/saloneo/beauty-flow/public\"):
    for f in fs:
        c=unicodedata.normalize(\"NFC\",f)
        if c!=f: os.replace(os.path.join(d,f),os.path.join(d,c))"'
ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no "$HOST" 'cd /opt/saloneo && set -a && . ./.env && set +a && npm ci --omit=dev --silent \
  && (cd beauty-flow-backend && NODE_ENV=development npm ci --silent && npm run build) \
  && (cd beauty-flow && NODE_ENV=development npm ci --silent && VITE_API_URL="$FRONTEND_URL/api" VITE_SOCKET_URL="$FRONTEND_URL" VITE_SITE_URL="$FRONTEND_URL" npm run build) \
  && rm -rf beauty-flow-backend/dist/public && cp -r beauty-flow/dist beauty-flow-backend/dist/public \
  && (pm2 reload saloneo 2>/dev/null || pm2 start beauty-flow-backend/dist/app.js --name saloneo --cwd /opt/saloneo) && pm2 save'
