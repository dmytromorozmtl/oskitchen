#!/usr/bin/env bash
# Phase 8 — scoped actions, brand routing, audit UI, PDP CDN, RLS template.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SLUG="${STOREFRONT_PILOT_SLUG:-hello}"
FAIL=0

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront Phase 8 — verify                             ║"
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
step "Storefront DB phases" npm run db:apply-storefront-phases
step "DB schema check" npm run db:check-storefront-schema
step "Phase 8 RLS SQL (optional Supabase)" bash -c 'if [[ -f prisma/sql/storefront-phase8-rls.sql ]]; then node ./node_modules/prisma/build/index.js db execute --schema prisma/schema.prisma --file prisma/sql/storefront-phase8-rls.sql || true; fi'
step "Storefront unit tests" npm run test:storefront-release

step "No legacy findUnique(userId) in storefront actions" bash -c '! grep -rE "storefrontSettings\\.findUnique\\(\\s*\\{\\s*where:\\s*\\{\\s*userId" actions/storefront-*.ts services/storefront/storefront-stripe-connect-service.ts 2>/dev/null | grep -q .'

step "Resend verify (optional)" npm run storefront:verify-resend || true

if curl -sf "http://127.0.0.1:3000/api/health" >/dev/null 2>&1; then
  step "Pay-later E2E" env E2E_STOREFRONT_SLUG="$SLUG" npx playwright test e2e/storefront-checkout-pay-later.spec.ts
  if [[ "${STOREFRONT_E2E_STRIPE:-0}" == "1" ]]; then
    step "Stripe E2E" env STOREFRONT_E2E_STRIPE=1 E2E_STOREFRONT_SLUG="$SLUG" npx playwright test e2e/storefront-checkout-stripe.spec.ts
  fi
else
  echo "→ E2E skipped (start: npm run dev:safe)"
  echo ""
fi

echo "── Phase 8 human checklist ──"
echo "  ☐ Prod: STOREFRONT_SMOKE_BASE_URL=… STOREFRONT_CHECK_EMAIL=1 npm run storefront:prod-signoff"
echo "  ☐ /b/{brandSlug} → default storefront"
echo "  ☐ {brand}.{store}.{ROOT_DOMAIN} vanity (DNS wildcard)"
echo "  ☐ Brand custom domain → storefront"
echo "  ☐ /dashboard/storefront/team/audit — invite events"
echo "  ☐ Multi-store switcher + 2nd slug checkout"
echo "  ☐ LHCI_STRICT=1 LHCI_VANITY_HOSTS=hello-weekday.<host>"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "✓ Phase 8 automated verify passed."
else
  echo "✗ Phase 8 verify had failures."
  exit 1
fi
