#!/usr/bin/env bash
# Phase 0 pilot gate — localhost + env (prod deploy URL is human step).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Phase 0 — pilot hello ==="
echo ""

FAIL=0

run_step() {
  local name="$1"
  shift
  echo "→ $name"
  if "$@"; then
    echo "  ✓ $name"
  else
    echo "  ✗ $name"
    FAIL=1
  fi
  echo ""
}

run_step "validate:database-env" npm run validate:database-env
run_step "check:database-connectivity" npm run check:database-connectivity
run_step "storefront:release-preflight" npm run storefront:release-preflight

PORT="${STOREFRONT_DEV_PORT:-3000}"
if curl -sf -o /dev/null "http://127.0.0.1:${PORT}/s/hello" 2>/dev/null; then
  run_step "storefront:local-smoke" npm run storefront:local-smoke
  echo "→ server cart API"
  if curl -sf -X POST "http://127.0.0.1:${PORT}/api/storefront/cart" \
    -H "Content-Type: application/json" \
    -d "{\"storeSlug\":\"hello\",\"cart\":{},\"merge\":true}" | grep -q '"ok":true'; then
    echo "  ✓ POST /api/storefront/cart"
  else
    echo "  ✗ server cart — restart with npm run dev:safe (AUTH_SECRET injection)"
    FAIL=1
  fi
  echo ""
  run_step "storefront:seed-phase2-hello (QA demo)" npm run storefront:seed-phase2-hello || true
  run_step "storefront:stripe-connect-smoke" npm run storefront:stripe-connect-smoke || true
else
  echo "→ storefront:local-smoke (skipped — start npm run dev:safe)"
  echo ""
fi

run_step "vercel crons profile (Tier A)" npm run vercel:crons:production

echo "→ storefront:diagnose-deploy (informational)"
npm run storefront:diagnose-deploy || true
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "✓ Phase 0 automated checks passed (local)."
  echo ""
  echo "Human steps remaining:"
  echo "  1. Vercel → copy Production URL → npm run storefront:bind-deploy-url -- <url>"
  echo "  2. npm run storefront:post-deploy"
  echo "  3. MANUAL_QA on /s/hello (checkout, promo, blackout)"
  echo "  4. Vercel env: Turnstile + STOREFRONT_REDIRECTS_ENABLED + week1-complete"
  exit 0
fi

echo "✗ Phase 0 has failing automated checks."
exit 1
