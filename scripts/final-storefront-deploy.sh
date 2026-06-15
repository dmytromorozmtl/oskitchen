#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="/Users/dmytro/.nvm/versions/node/v26.0.0/bin:$PATH"

LOG="/tmp/kos-final-deploy.log"
echo "Logging to $LOG"

{
echo "=== FINAL STOREFRONT DEPLOY $(date) ==="

pkill -f 'vercel build' 2>/dev/null || true
pkill -f 'next/dist/bin/next build' 2>/dev/null || true
sleep 2

rm -rf .next .vercel/output .vercel/output-stale-* 2>/dev/null || true
find .vercel -maxdepth 1 -type d -name 'output*' -exec rm -rf {} + 2>/dev/null || true
echo "✅ Cleaned"

set -a
# shellcheck source=/dev/null
source .env.staging.local 2>/dev/null || true
set +a
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://os-kitchen.com}"
export NEXT_PUBLIC_APP_ENV="${NEXT_PUBLIC_APP_ENV:-production}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-sb_publishable_dD4M3pNzWjB-8Ae4-ZIKKw_U8MXvFm4}"
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://eycxwxxyrzdhhqcnxifz.supabase.co}"
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=16384}"

echo "▶ Building Next.js..."
node ./node_modules/prisma/build/index.js generate
node scripts/ensure-prisma-client-default.cjs
node ./node_modules/next/dist/bin/next build

test -f .next/BUILD_ID
echo "✅ BUILD_ID=$(cat .next/BUILD_ID)"
cp package.json .next/package.json

VERCEL_BIN="./node_modules/.bin/vercel"
if [[ ! -x "$VERCEL_BIN" ]]; then
  VERCEL_BIN="npx"
  VERCEL_ARGS=(--yes vercel@latest)
fi

echo "▶ Vercel build..."
if [[ -x "./node_modules/.bin/vercel" ]]; then
  ./node_modules/.bin/vercel build --prod --yes
else
  npx "${VERCEL_ARGS[@]}" build --prod --yes
fi

echo "▶ Vercel deploy..."
for attempt in 1 2 3; do
  if [[ -x "./node_modules/.bin/vercel" ]]; then
    ./node_modules/.bin/vercel deploy --prebuilt --prod --yes && break
  else
    npx "${VERCEL_ARGS[@]}" deploy --prebuilt --prod --yes && break
  fi
  echo "Deploy attempt $attempt failed, retry..."
  sleep 20
done

echo "▶ Health check..."
HEALTH_OK=0
for i in $(seq 1 20); do
  if node ./node_modules/tsx/dist/cli.mjs scripts/verify-health-endpoint.ts https://os-kitchen.com/api/health; then
    echo "✅ Production ready (attempt $i)"
    HEALTH_OK=1
    break
  fi
  sleep 15
done

if [[ "$HEALTH_OK" -ne 1 ]]; then
  echo "❌ Production health did not reach status=ok"
  exit 1
fi

echo "▶ API verification..."
for ep in theme/save-draft theme/publish theme/restore builder/publish; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "https://os-kitchen.com/api/storefront/$ep" -H "Content-Type: application/json" -d '{}')
  echo "  POST /api/storefront/$ep -> $code"
done

echo "=== DEPLOY FINISHED $(date) ==="
} 2>&1 | tee -a "$LOG"
exit "${PIPESTATUS[0]}"
