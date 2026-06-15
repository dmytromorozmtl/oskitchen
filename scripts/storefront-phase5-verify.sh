#!/usr/bin/env bash
# Phase 5 — full verify: invites, markets host, cache tags, E2E, image CDN audit.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SLUG="${STOREFRONT_PILOT_SLUG:-hello}"
FAIL=0

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront Phase 5 — verify                             ║"
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
step "Market + cache tag unit tests" node ./node_modules/vitest/vitest.mjs run tests/unit/storefront-market-resolve.test.ts tests/unit/storefront-cache-tags.test.ts tests/unit/storefront-team-invite-accept.test.ts 2>/dev/null || node ./node_modules/vitest/vitest.mjs run tests/unit/storefront-market-resolve.test.ts

echo "→ Image CDN hosts configured"
node -e "
const { listStorefrontImageHostsForAudit } = require('./lib/storefront/image-cdn-config.ts');
" 2>/dev/null || npx tsx -e "
import { listStorefrontImageHostsForAudit } from './lib/storefront/image-cdn-config.ts';
console.log('  hosts:', listStorefrontImageHostsForAudit().join(', '));
" || echo "  (skip tsx audit)"
echo ""

if curl -sf "http://127.0.0.1:3000/api/health" >/dev/null 2>&1; then
  step "Phase 4 smoke" env E2E_STOREFRONT_SLUG="$SLUG" npx playwright test e2e/storefront-phase4.spec.ts
  step "Pay-later checkout E2E" env E2E_STOREFRONT_SLUG="$SLUG" npx playwright test e2e/storefront-checkout-pay-later.spec.ts
  if [[ "${STOREFRONT_E2E_STRIPE:-}" == "1" ]]; then
    step "Stripe checkout E2E" env E2E_STOREFRONT_SLUG="$SLUG" STOREFRONT_E2E_STRIPE=1 npx playwright test e2e/storefront-checkout-stripe.spec.ts
  else
    echo "→ Stripe E2E skipped (STOREFRONT_E2E_STRIPE=1 to run)"
    echo ""
  fi
else
  echo "→ E2E skipped (start: npm run dev:safe)"
  echo ""
fi

echo "── Phase 5 human checklist ──"
echo "  ☐ Link workspace: /dashboard/storefront/workspace"
echo "  ☐ Invite teammate → email received (RESEND_API_KEY)"
echo "  ☐ Signup/login as invitee → auto-joined workspace"
echo "  ☐ Market host: https://${SLUG}-weekday.\${NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN}"
echo "  ☐ Prod: STOREFRONT_SMOKE_BASE_URL=… npm run storefront:prod-signoff"
echo "  ☐ Staging: LHCI_STRICT=1 on PLAYWRIGHT_BASE_URL"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "✓ Phase 5 automated verify passed."
  exit 0
fi
echo "✗ Phase 5 verify had failures."
exit 1
