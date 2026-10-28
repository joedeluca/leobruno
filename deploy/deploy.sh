#!/bin/sh
# From the laptop, run in the repo root: sh deploy/deploy.sh
# Builds the committed tree (not your uncommitted edits) in a clean clone, with the
# production site address, then sends it to the box as a new release and flips `current`.
set -eu
BOX=${LEOBRUNO_BOX:-leobruno@176.126.244.73}
ROOT=$(cd "$(dirname "$0")/.." && pwd)
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

echo "▸ clean clone of HEAD"
git clone --quiet --no-hardlinks "$ROOT" "$STAGE/app"
cp "$ROOT/.env.local" "$STAGE/app/.env.local"   # the build reads the public keys from here
cd "$STAGE/app"

echo "▸ build"
npm ci --silent
NEXT_PUBLIC_SITE_URL=https://leobruno.it npm run build
# No prune: next.config.ts needs typescript at start-up, and a dev-only pruning removes it.

echo "▸ send $STAMP"
ssh "$BOX" "mkdir -p /srv/leobruno/releases/$STAMP"
rsync -a --delete .next public node_modules package.json next.config.ts "$BOX:/srv/leobruno/releases/$STAMP/"

echo "▸ flip and restart"
ssh "$BOX" "cd /srv/leobruno && ln -sfn releases/$STAMP current.new && mv -T current.new current && sudo systemctl restart leobruno-web"
sleep 4
ssh "$BOX" "curl -s -o /dev/null -w 'on the box: %{http_code}\n' --max-time 8 http://[::1]:3003/"
