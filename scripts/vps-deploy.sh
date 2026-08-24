#!/usr/bin/env bash
# Runs ON the VPS (streamed by GitHub Actions, or: ssh saloneo-vps 'bash -s' < scripts/vps-deploy.sh).
# Pulls main, builds, reloads pm2, checks /health; on failure rebuilds the previous commit.
set -euo pipefail
cd /opt/saloneo
PREV=$(git rev-parse HEAD)

build() {
  set -a; . ./.env; set +a
  npm ci --omit=dev --silent
  (cd beauty-flow-backend && NODE_ENV=development npm ci --silent && npm run build)
  (cd beauty-flow && NODE_ENV=development npm ci --silent \
    && VITE_API_URL="$FRONTEND_URL/api" VITE_SOCKET_URL="$FRONTEND_URL" VITE_SITE_URL="$FRONTEND_URL" npm run build)
  rm -rf beauty-flow-backend/dist/public && cp -r beauty-flow/dist beauty-flow-backend/dist/public
}

healthy() {
  for _ in $(seq 1 20); do
    sleep 3
    curl -sf http://127.0.0.1:10000/health >/dev/null && return 0
  done
  return 1
}

cp .env /root/saloneo.env.bak            # .env is NOT in git — keep it across the reset
git fetch -q origin main
git reset -q --hard origin/main
cp /root/saloneo.env.bak .env
echo "==> Building $(git rev-parse --short HEAD)"
build
pm2 reload saloneo --update-env >/dev/null
if healthy; then
  echo "==> DEPLOYED $(git rev-parse --short HEAD)"
  exit 0
fi

echo "==> HEALTH CHECK FAILED — rolling back to $(git rev-parse --short "$PREV")"
git reset -q --hard "$PREV"
cp /root/saloneo.env.bak .env
build
pm2 reload saloneo --update-env >/dev/null
healthy && echo "==> ROLLED BACK to $(git rev-parse --short HEAD)"
exit 1
