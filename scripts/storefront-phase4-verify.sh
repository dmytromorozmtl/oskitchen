#!/usr/bin/env bash
# Phase 4 — automated verify: unit + optional E2E + prod sign-off pointer.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SLUG="${STOREFRONT_PILOT_SLUG:-hello}"
FAIL=0

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront Phase 4 — verify                             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

step() {
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

step "Prisma env" npm run diagnose:prisma-env
step "Storefront unit tests" npm run test:storefront-release

if curl -sf "http://127.0.0.1:3000/api/health" >/dev/null 2>&1; then
  step "Phase 4 E2E (local)" env E2E_STOREFRONT_SLUG="$SLUG" npx playwright test e2e/storefront-phase4.spec.ts
else
  echo "→ Phase 4 E2E skipped (dev server not on :3000)"
  echo ""
fi

echo "── Phase 4 human / staging checklist ──"
echo "  ☐ npm run storefront:seed-phase2-hello (markets + weekday menu)"
echo "  ☐ /s/${SLUG}?market=weekday — separate menu when activeMenuId set"
echo "  ☐ /dashboard/storefront/team — invite by email"
echo "  ☐ /dashboard/storefront/markets — visual editor + activeMenuId"
echo "  ☐ Publish catalog → edge CDN tags (VERCEL_* / CLOUDFLARE_*)"
echo "  ☐ Staging: set LHCI_STRICT=1 on PLAYWRIGHT_BASE_URL"
echo "  ☐ Prod: STOREFRONT_SMOKE_BASE_URL=… npm run storefront:prod-signoff"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "✓ Phase 4 automated verify passed."
  exit 0
fi

echo "✗ Phase 4 verify had failures."
exit 1
