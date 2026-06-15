#!/usr/bin/env bash
# One-command staging deploy orchestration for KitchenOS paid pilot.
# Requires: Node 22, vercel CLI (logged in), filled .env.staging or .env.staging.local
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"

if [[ ! -f .env.staging.local && ! -f .env.staging ]]; then
  echo "ERROR: Create .env.staging.local (copy secrets from template) or .env.staging" >&2
  echo "  cp .env.staging.template .env.staging.local" >&2
  exit 1
fi

# Prefer real secrets in .env.staging.local over empty template .env.staging
ENV_FILE="${ENV_FILE:-}"
if [[ -z "$ENV_FILE" ]]; then
  if [[ -f .env.staging.local ]]; then
    ENV_FILE=.env.staging.local
  else
    ENV_FILE=.env.staging
  fi
fi

echo "=== KitchenOS Staging Deploy ==="
echo "Env merge: .env.staging + .env.staging.local (primary: $ENV_FILE)"

echo "[1/9] Node version"
NODE_MAJOR="$("$NODE" -p "process.versions.node.split('.')[0]")"
if [[ "$NODE_MAJOR" != "22" ]]; then
  echo "ERROR: Node 22.x required (got $($NODE -v))" >&2
  exit 1
fi
echo "OK Node $($NODE -v)"

echo "[2/9] Staging env gate"
eval "$("$NODE" scripts/ops/export-staging-env.mjs)"
if ! "$NPM" run verify:staging-env; then
  echo "TIP: copy real values into .env.staging.local (not empty .env.staging template)" >&2
  echo "  Or local DB pilot: npm run verify:staging-env -- --local-pilot" >&2
  echo "ERROR: fix staging env before deploy (Upstash, pilot nav, CRON_SECRET, …)" >&2
  exit 1
fi

echo "[3/9] Code preflight"
bash scripts/ops/pilot-preflight.sh

echo "[4/9] Database migrations"
npx prisma migrate deploy

echo "[5/9] Workspace backfill status"
"$NPM" run workspace:backfill:status

echo "[6/9] Vercel deploy"
if ! command -v vercel >/dev/null 2>&1; then
  echo "ERROR: vercel CLI not found. Run: npm i -g vercel && vercel login" >&2
  exit 1
fi

# Deploy preview/staging; capture deployment URL from CLI output
DEPLOY_LOG="$(mktemp)"
trap 'rm -f "$DEPLOY_LOG"' EXIT

set +e
vercel deploy --yes 2>&1 | tee "$DEPLOY_LOG"
DEPLOY_EXIT=${PIPESTATUS[0]}
set -e

if [[ "$DEPLOY_EXIT" -ne 0 ]]; then
  echo "ERROR: vercel deploy failed (exit $DEPLOY_EXIT)" >&2
  exit 1
fi

DEPLOY_URL="$(grep -Eo 'https://[a-zA-Z0-9._-]+\.vercel\.app' "$DEPLOY_LOG" | tail -1 || true)"
if [[ -z "$DEPLOY_URL" ]]; then
  echo "WARN: Could not parse deployment URL from vercel output."
  echo "Set manually: npm run pilot:deploy:gate -- --url=https://YOUR-PREVIEW.vercel.app"
  exit 1
fi

echo "Deployed to: $DEPLOY_URL"
echo "STAGING_URL=$DEPLOY_URL" > .staging-deploy-url

echo "[7/9] Patch staging URL in env file"
"$NODE" -e "
const fs = require('fs');
const path = process.argv[1];
const url = process.argv[2];
let s = fs.readFileSync(path, 'utf8');
const key = 'NEXT_PUBLIC_APP_URL';
const line = key + '=' + url;
if (s.match(new RegExp('^' + key + '=', 'm'))) {
  s = s.replace(new RegExp('^' + key + '=.*$', 'm'), line);
} else {
  s += '\\n' + line + '\\n';
}
fs.writeFileSync(path, s);
" "$ENV_FILE" "$DEPLOY_URL"

echo "[8/9] Health wait + probe"
export STAGING_URL="$DEPLOY_URL"
bash scripts/ops/verify-staging.sh || {
  echo "WARN: verify-staging failed — run pilot:deploy:gate after Vercel finishes propagating"
  "$NPM" run pilot:deploy:gate -- "--url=$DEPLOY_URL" || true
}

echo "[9/9] Sync Vercel cron manifest (staging profile)"
"$NPM" run vercel:crons:staging || "$NPM" run vercel:crons:production

echo ""
echo "=== Deploy Complete ==="
echo "Staging URL: $DEPLOY_URL"
echo "Next:"
echo "  npm run vercel:staging-push -- --apply   # if env not yet on Vercel"
echo "  export PLAYWRIGHT_BASE_URL=$DEPLOY_URL && npm run test:e2e:pilot"
echo "  docs/PILOT_GOLDEN_PATH_CHECKLIST.md (manual)"
