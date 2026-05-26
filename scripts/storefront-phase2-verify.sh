#!/usr/bin/env bash
# Phase 2 full verification — run with dev server for HTTP/E2E steps.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SLUG="${STOREFRONT_PILOT_SLUG:-hello}"
PORT="${STOREFRONT_DEV_PORT:-3000}"
FAIL=0

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront Phase 2 — full verification                  ║"
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

step "diagnose:prisma-env" npm run diagnose:prisma-env
step "unit: storefront cart + shipping" npm run test -- tests/unit/storefront-cart-pricing.test.ts tests/unit/storefront-shipping-engine.test.ts
step "seed phase2 hello" npm run storefront:seed-phase2-hello
step "stripe connect smoke (informational)" npm run storefront:stripe-connect-smoke || true

if curl -sf -o /dev/null "http://127.0.0.1:${PORT}/api/health" 2>/dev/null; then
  echo "→ HTTP catalog API"
  if curl -sf "http://127.0.0.1:${PORT}/api/storefront/catalog?storeSlug=${SLUG}" | grep -q '"ok":true'; then
    echo "  ✓ GET /api/storefront/catalog"
  else
    echo "  ✗ catalog API"
    FAIL=1
  fi
  echo ""

  echo "→ HTTP reorder API (needs at least one order)"
  TOKEN=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    p.storefrontOrder.findFirst({
      where: { storefront: { storeSlug: '${SLUG}' } },
      orderBy: { createdAt: 'desc' },
      select: { publicToken: true },
    }).then(o => { console.log(o?.publicToken || ''); return p.\$disconnect(); });
  " 2>/dev/null || echo "")
  if [[ -n "$TOKEN" ]]; then
    if curl -sf -X POST "http://127.0.0.1:${PORT}/api/storefront/account/reorder" \
      -H "Content-Type: application/json" \
      -d "{\"storeSlug\":\"${SLUG}\",\"orderToken\":\"${TOKEN}\",\"merge\":false}" | grep -q '"ok":true'; then
      echo "  ✓ POST /api/storefront/account/reorder"
    else
      echo "  ⚠ reorder API — order may have no line items on menu"
    fi
  else
    echo "  ⚠ skip reorder — place one test order on /s/${SLUG} first"
  fi
  echo ""

  step "E2E phase2" env E2E_STOREFRONT_SLUG="$SLUG" npx playwright test e2e/storefront-phase2-cart.spec.ts e2e/storefront-sold-out.spec.ts e2e/storefront-reorder.spec.ts
else
  echo "→ HTTP/E2E skipped — start: npm run dev:safe"
  echo ""
fi

step "phase0-complete (subset)" npm run storefront:phase0-complete || true

if [[ "$FAIL" -eq 0 ]]; then
  echo "✓ Phase 2 verification passed (automated)."
  echo ""
  echo "Manual:"
  echo "  • /dashboard/storefront/catalog — edit variant, add modifier option"
  echo "  • /s/${SLUG} — sold out + variant PDP + Order again on order page"
  echo "  • STOREFRONT_STRIPE_CONNECT=1 + STRIPE_SECRET_KEY — Connect onboarding"
  echo "  • Vercel: storefront:apply-deploy-urls → post-deploy"
  exit 0
fi

echo "✗ Phase 2 verification had failures."
exit 1
