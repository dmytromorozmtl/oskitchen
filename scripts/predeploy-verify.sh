#!/usr/bin/env bash
# Pre-deploy gate: build + fast tests + production HTTP smoke.
set -euo pipefail
cd "$(dirname "$0")/.."

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"

echo "=== KitchenOS pre-deploy verify ==="

echo "→ Clean build artifacts"
STAMP="$(date +%s)"
if [[ -d .next ]]; then
  PREDEPLOY_TRASH_DIR="../.kitchenos-predeploy-trash.${STAMP}"
  mkdir -p "$PREDEPLOY_TRASH_DIR"
  mv .next "$PREDEPLOY_TRASH_DIR/" 2>/dev/null || true
fi
if [[ -d .vercel/output ]]; then
  chmod -R u+w .vercel/output 2>/dev/null || true
  PREDEPLOY_TRASH_DIR="${PREDEPLOY_TRASH_DIR:-../.kitchenos-predeploy-trash.${STAMP}}"
  mkdir -p "$PREDEPLOY_TRASH_DIR"
  mv .vercel/output "$PREDEPLOY_TRASH_DIR/" 2>/dev/null || true
fi

if [[ "${SKIP_TYPECHECK:-}" == "1" ]]; then
  echo "→ Typecheck (skipped — SKIP_TYPECHECK=1)"
else
  echo "→ Typecheck"
  npm run typecheck || {
    echo "⚠ typecheck failed — fix or SKIP_TYPECHECK=1 for smoke-only gate"
    exit 1
  }
fi

echo "→ Unit tests"
npm run test:unit

echo "→ Workspace service scope audit"
npm run workspace:audit:services:strict

echo "→ Production cron reconciliation"
npm run validate:production-crons

echo "→ Production tenant HTTP smoke"
npm run smoke:production-tenant

if [[ -f .env.e2e.local ]]; then
  echo "→ Production workspace E2E (authed)"
  set -a
  # shellcheck disable=SC1091
  source .env.e2e.local
  set +a
  export PLAYWRIGHT_BASE_URL="https://os-kitchen.com"
  npx playwright test e2e/workspace-post-not-null-smoke.spec.ts --project=setup --project=chromium-authed
else
  echo "⚠ Skip authed E2E — run: npm run e2e:bootstrap"
fi

echo "→ Production build"
npm run build
node scripts/predeploy-build-state.mjs write predeploy-verify

echo ""
echo "✅ Pre-deploy verify passed. Safe to push / deploy Vercel."
