#!/usr/bin/env bash
# Production deploy: local Next.js build → Vercel prebuilt package → deploy.
# Do NOT use `vercel deploy --prod` without --prebuilt (remote next build OOMs on Vercel).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

run_with_log_tail() {
  local lines="$1"
  shift

  local logfile
  mkdir -p "$ROOT/.deploy-logs"
  logfile="$ROOT/.deploy-logs/$(date +%s)-$$-$RANDOM.log"

  set +e
  "$@" >"$logfile" 2>&1
  local code=$?
  set -e

  tail -n "$lines" "$logfile"

  if [[ "$code" -ne 0 ]]; then
    echo "❌ Command failed. Full log: $logfile"
    return "$code"
  fi

  rm -f "$logfile"
}

echo "========================================="
echo " KITCHENOS — PREBUILT PRODUCTION DEPLOY"
echo " $(date)"
echo "========================================="

pkill -f 'next/dist/bin/next build' 2>/dev/null || true
pkill -f 'vercel build' 2>/dev/null || true

if [[ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  source "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  nvm use 22 >/dev/null 2>&1 || true
fi

echo ""
echo "[1/6] Node version..."
node -v
case "$(node -v)" in
  v22.*) ;;
  *)
    echo "WARN: package.json expects Node 22; continuing anyway."
    ;;
esac

echo ""
echo "[2/6] Cleaning build artifacts..."
REUSE_PREDEPLOY_BUILD=0
if [[ "${FORCE_LOCAL_REBUILD:-0}" != "1" ]] && node scripts/predeploy-build-state.mjs check >/dev/null 2>&1; then
  REUSE_PREDEPLOY_BUILD=1
  echo "✅ Preserving fresh pre-deploy .next build for production deploy"
fi
# Never rm -rf .vercel/output (macOS dirs like "static 5" hang). mv aside only; keep project.json.
STAMP="$(date +%s)"
if [[ "$REUSE_PREDEPLOY_BUILD" -eq 0 ]] && [[ -d .next ]]; then
  mv .next ".next.trash.${STAMP}" 2>/dev/null || true
fi
if [[ -d .vercel/output ]]; then
  if [[ "$REUSE_PREDEPLOY_BUILD" -eq 1 ]]; then
    # Avoid chmod -R on iCloud (can hang 20+ min on partial output trees).
    mv .vercel/output ".vercel/output.bak.${STAMP}" 2>/dev/null || true
  else
    chmod -R u+w .vercel/output 2>/dev/null || true
    find .vercel/output -maxdepth 3 -type d \( -name 'static *' -o -name 'server *' \) -exec rm -rf {} + 2>/dev/null || true
    mv .vercel/output ".vercel/output.bak.${STAMP}" 2>/dev/null || true
  fi
fi
rm -rf .vercel/output-stale-* 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
# Old deploy moves accumulate 10k+ generated .ts under .next.trash.* and slow tsc to a crawl.
# On Desktop/iCloud these can take forever to delete in-place, so move them aside first.
TRASH_REMOVED=0
TRASH_QUARANTINE=""
for d in .next.trash.* .next.deploy-trash.* .next-stale-* .vercel/output.bak.* .vercel.deploy-trash.*; do
  [[ -e "$d" ]] || continue
  if [[ -z "$TRASH_QUARANTINE" ]]; then
    TRASH_QUARANTINE="$ROOT/../.kitchenos-deploy-trash.${STAMP}"
    mkdir -p "$TRASH_QUARANTINE"
  fi
  mv "$d" "$TRASH_QUARANTINE/" 2>/dev/null && TRASH_REMOVED=$((TRASH_REMOVED + 1)) || true
done
if [[ "$TRASH_REMOVED" -gt 0 ]]; then
  echo "✅ Moved ${TRASH_REMOVED} stale build trash dir(s) to ${TRASH_QUARANTINE}"
fi
echo "✅ Cleaned"

echo ""
echo "[3/6] OpenAPI manifest + tests..."
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=16384}"
node scripts/generate-openapi-manifest.cjs
if [[ "${DEPLOY_SKIP_VITEST:-0}" == "1" ]]; then
  echo "❌ DEPLOY_SKIP_VITEST=1 is no longer supported — tests must pass before production deploy."
  echo "   Run: npm test && npm run deploy:prod"
  exit 1
fi
echo "  → materialize disk-backed test paths (iCloud / Desktop flake guard)..."
node ./node_modules/tsx/dist/cli.mjs scripts/materialize-vitest-disk-paths.ts
echo "  → unit tests (vitest) — required gate before deploy..."
run_with_log_tail 8 node ./node_modules/vitest/vitest.mjs run
echo "  (TypeScript is checked during next build — standalone tsc is too slow on Desktop/iCloud.)"

echo ""
echo "[4/6] Local production build..."
set -a
# shellcheck source=/dev/null
source .env.production.local 2>/dev/null || true
# shellcheck source=/dev/null
source .env.staging.local 2>/dev/null || true
set +a
# Vercel env pull can write KEY="" — treat whitespace-only as unset so defaults apply.
for _kos_var in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
  if [[ -z "${!_kos_var//[[:space:]]/}" ]]; then
    unset "$_kos_var"
  fi
done
if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" || -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]] && [[ -f .env.local ]]; then
  # shellcheck source=/dev/null
  source .env.local
fi
# Env pulls must not shrink the heap budget for local next build (OOM at ~4GB otherwise).
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=16384}"
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://os-kitchen.com}"
export NEXT_PUBLIC_APP_ENV="${NEXT_PUBLIC_APP_ENV:-production}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-sb_publishable_dD4M3pNzWjB-8Ae4-ZIKKw_U8MXvFm4}"
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://eycxwxxyrzdhhqcnxifz.supabase.co}"
export NEXT_TELEMETRY_DISABLED=1
export NEXT_WEBPACK_CACHE="${NEXT_WEBPACK_CACHE:-0}"
if [[ -x "./node_modules/.bin/vercel" ]]; then
  VERCEL_BIN="./node_modules/.bin/vercel"
elif [[ -x "/tmp/vercel-cli-kos/node_modules/.bin/vercel" ]]; then
  VERCEL_BIN="/tmp/vercel-cli-kos/node_modules/.bin/vercel"
else
  VERCEL_BIN="npx"
  VERCEL_ARGS=(--yes vercel@latest)
fi

# Some local Vercel pulls on macOS/Desktop hydrate production secret keys as empty
# strings even though Vercel production envs exist. For local readiness/build only,
# synthesize non-secret placeholders when the remote env manifest confirms presence.
VERCEL_ENV_LS=""
set +e
if [[ -n "${VERCEL_BIN:-}" && "${VERCEL_BIN}" != "npx" ]]; then
  VERCEL_ENV_LS="$("${VERCEL_BIN}" env ls production 2>/dev/null)"
else
  VERCEL_ENV_LS="$(npx "${VERCEL_ARGS[@]}" env ls production 2>/dev/null)"
fi
set -e
has_vercel_env_key() {
  local key="$1"
  printf '%s\n' "$VERCEL_ENV_LS" | grep -Eq "^[[:space:]]*${key}[[:space:]]"
}
if { [[ -z "${RATE_LIMIT_ADAPTER:-}" ]] || [[ "${RATE_LIMIT_ADAPTER:-}" == "memory" ]]; } && {
  { [[ -n "${UPSTASH_REDIS_REST_URL:-}" ]] && [[ -n "${UPSTASH_REDIS_REST_TOKEN:-}" ]]; } ||
  has_vercel_env_key "UPSTASH_REDIS_REST_URL" ||
  has_vercel_env_key "UPSTASH_REDIS_REST_TOKEN";
}; then
  export RATE_LIMIT_ADAPTER="upstash"
fi
if [[ -z "${UPSTASH_REDIS_REST_URL:-}" ]] && has_vercel_env_key "UPSTASH_REDIS_REST_URL"; then
  export UPSTASH_REDIS_REST_URL="https://placeholder.invalid"
fi
if [[ -z "${UPSTASH_REDIS_REST_TOKEN:-}" ]] && has_vercel_env_key "UPSTASH_REDIS_REST_TOKEN"; then
  export UPSTASH_REDIS_REST_TOKEN="placeholder-token"
fi
if [[ -z "${CRON_SECRET:-}" ]] && has_vercel_env_key "CRON_SECRET"; then
  export CRON_SECRET="placeholder-cron-secret"
fi
echo "  → startup readiness preflight..."
NODE_ENV=production STARTUP_READINESS_FATAL=1 node ./node_modules/tsx/dist/cli.mjs scripts/validate-startup-readiness.ts --production
echo "  → production cron reconciliation..."
node ./node_modules/tsx/dist/cli.mjs scripts/validate-production-crons.ts
if [[ "$REUSE_PREDEPLOY_BUILD" -eq 1 ]]; then
  echo "  → reusing verified local Next.js build"
else
  node ./node_modules/prisma/build/index.js generate
  node scripts/ensure-prisma-client-default.cjs
  NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=16384}" node ./node_modules/next/dist/bin/next build
  node scripts/predeploy-build-state.mjs write deploy-prebuilt-prod
fi

if [[ ! -f .next/BUILD_ID ]]; then
  echo "❌ Build failed — .next/BUILD_ID missing"
  exit 1
fi
echo "✅ Build ID: $(cat .next/BUILD_ID)"
cp package.json .next/package.json

if [[ ! -f .next/server/app/dashboard/food-safety/page.js ]]; then
  echo "❌ Local build missing app/dashboard/food-safety/page.js — aborting"
  exit 1
fi

echo ""
echo "[5/6] Vercel prebuilt package + deploy..."
# Local prebuilt: skip `npm ci` (already have node_modules + .next). Remote npm ci on iCloud
# Desktop can hang for 60+ min on duplicate `node_modules/@pkg 2` folders.
VERCEL_JSON_BACKUP=""
if [[ -f vercel.json ]]; then
  VERCEL_JSON_BACKUP="$(mktemp "${TMPDIR:-/tmp}/vercel-json-backup.XXXXXX")"
  cp vercel.json "$VERCEL_JSON_BACKUP"
  node <<'NODE'
const fs = require("fs");
const path = "vercel.json";
const config = JSON.parse(fs.readFileSync(path, "utf8"));
config.installCommand =
  process.env.PREBUILT_LOCAL_INSTALL_CMD ??
  "node ./node_modules/prisma/build/index.js generate";
fs.writeFileSync(path, JSON.stringify(config, null, 2) + "\n");
console.log("✅ vercel.json installCommand → prebuilt-local (no npm ci)");
NODE
fi
restore_vercel_json() {
  if [[ -n "$VERCEL_JSON_BACKUP" && -f "$VERCEL_JSON_BACKUP" ]]; then
    mv "$VERCEL_JSON_BACKUP" vercel.json
  fi
}
trap restore_vercel_json EXIT

if [[ -n "${VERCEL_BIN:-}" && "${VERCEL_BIN}" != "npx" ]]; then
  "${VERCEL_BIN}" build --prod --yes
else
  npx "${VERCEL_ARGS[@]}" build --prod --yes
fi
restore_vercel_json
trap - EXIT

if [[ ! -e .vercel/output/functions/_middleware.func ]]; then
  echo "❌ Prebuilt output missing _middleware.func — aborting deploy (incomplete vercel build)"
  exit 1
fi
echo "✅ Prebuilt includes _middleware"

if ! compgen -G ".vercel/output/static/_next/static/chunks/app/dashboard/food-safety/page-*.js" > /dev/null; then
  echo "❌ Prebuilt output missing /dashboard/food-safety — aborting deploy"
  exit 1
fi
echo "✅ Prebuilt includes /dashboard/food-safety"

for attempt in 1 2 3; do
  set +e
  if [[ -n "${VERCEL_BIN:-}" && "${VERCEL_BIN}" != "npx" ]]; then
    "${VERCEL_BIN}" deploy --prebuilt --prod --yes
  else
    npx "${VERCEL_ARGS[@]}" deploy --prebuilt --prod --yes
  fi
  deploy_code=$?
  set -e
  if [[ "$deploy_code" -eq 0 ]]; then
    break
  fi
  if [[ "$attempt" -eq 3 ]]; then
    echo "❌ Deploy failed after 3 attempts"
    exit 1
  fi
  echo "Deploy attempt ${attempt} failed — retry in 15s…"
  sleep 15
done

echo ""
echo "[6/6] Production health check..."
sleep 15
HEALTH_OK=0
for i in $(seq 1 20); do
  if node ./node_modules/tsx/dist/cli.mjs scripts/verify-health-endpoint.ts https://os-kitchen.com/api/health; then
    echo "✅ Production ready (attempt ${i})"
    HEALTH_OK=1
    break
  fi
  echo "  attempt ${i}: health not ready yet — waiting 10s…"
  sleep 10
done

if [[ "$HEALTH_OK" -ne 1 ]]; then
  echo "❌ Production health check never reached status=ok"
  exit 1
fi

echo ""
echo "========================================="
echo " DEPLOY COMPLETE — https://os-kitchen.com"
echo "========================================="
