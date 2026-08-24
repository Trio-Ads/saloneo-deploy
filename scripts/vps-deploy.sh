#!/usr/bin/env bash
# Zero-downtime deploy, runs ON the VPS (streamed by GitHub Actions, or ./deploy-vps.sh locally).
# Layout: /srv/saloneo/releases/<timestamp>-<sha>  (fresh clone + build, never touches the running release)
#         /srv/saloneo/current -> releases/<x>      (pm2 runs current/beauty-flow-backend/dist/app.js)
#         /srv/saloneo/shared/.env, shared/uploads  (persistent, symlinked into every release)
set -euo pipefail
BASE=/srv/saloneo
REPO=https://github.com/Trio-Ads/saloneo-deploy.git
APP=beauty-flow-backend/dist/app.js
PREV=$(readlink -f "$BASE/current" 2>/dev/null || true)

mkdir -p "$BASE/releases" "$BASE/shared/uploads"
[ -f "$BASE/shared/.env" ] || { echo "!! $BASE/shared/.env missing"; exit 1; }

REL="$BASE/releases/$(date +%Y%m%d%H%M%S)"
git clone -q --depth 1 --branch main "$REPO" "$REL"
SHA=$(git -C "$REL" rev-parse --short HEAD)
mv "$REL" "$REL-$SHA"; REL="$REL-$SHA"
echo "==> Building $SHA in $REL"

cd "$REL"
ln -s "$BASE/shared/.env" .env
rm -rf beauty-flow-backend/uploads && ln -s "$BASE/shared/uploads" beauty-flow-backend/uploads
set -a; . ./.env; set +a
npm ci --omit=dev --silent
(cd beauty-flow-backend && NODE_ENV=development npm ci --silent && npm run build)
(cd beauty-flow && NODE_ENV=development npm ci --silent \
  && VITE_API_URL="$FRONTEND_URL/api" VITE_SOCKET_URL="$FRONTEND_URL" VITE_SITE_URL="$FRONTEND_URL" npm run build)
rm -rf beauty-flow-backend/dist/public && cp -r beauty-flow/dist beauty-flow-backend/dist/public

activate() {  # $1 = release dir
  ln -sfn "$1" "$BASE/current"
  if pm2 describe saloneo 2>/dev/null | grep -q "$BASE/current/"; then
    pm2 reload saloneo --update-env >/dev/null
  else
    pm2 delete saloneo >/dev/null 2>&1 || true
    pm2 start "$BASE/current/$APP" --name saloneo --cwd "$BASE/current" >/dev/null
    pm2 save >/dev/null
  fi
}
healthy() {
  for _ in $(seq 1 20); do sleep 3; curl -sf http://127.0.0.1:10000/health >/dev/null && return 0; done
  return 1
}

activate "$REL"
if healthy; then
  echo "==> DEPLOYED $SHA"
  ls -1dt "$BASE"/releases/* | tail -n +4 | xargs -r rm -rf   # keep the 3 newest releases
  exit 0
fi

echo "==> HEALTH CHECK FAILED"
if [ -n "$PREV" ] && [ -d "$PREV" ]; then
  activate "$PREV"; healthy && echo "==> ROLLED BACK to $(basename "$PREV")"
fi
exit 1
