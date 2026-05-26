#!/usr/bin/env bash
# Phase 7 — multi-store, invite security, audit, brand theme, CI gates.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SLUG="${STOREFRONT_PILOT_SLUG:-hello}"
FAIL=0

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront Phase 7 — verify                             ║"
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
step "Storefront DB phases (7-core → 6 → 7-audit)" npm run db:apply-storefront-phases
step "DB schema check" npm run db:check-storefront-schema
step "Storefront unit tests" npm run test:storefront-release

step "Resend domain check (optional)" npm run storefront:verify-resend || true

step "Email env (team invites)" env STOREFRONT_CHECK_EMAIL=1 npm run check-env:storefront || true

if curl -sf "http://127.0.0.1:3000/api/health" >/dev/null 2>&1; then
  step "Pay-later checkout E2E" env E2E_STOREFRONT_SLUG="$SLUG" npx playwright test e2e/storefront-checkout-pay-later.spec.ts
  if [[ "${STOREFRONT_E2E_STRIPE:-0}" == "1" ]]; then
    step "Stripe checkout E2E" env STOREFRONT_E2E_STRIPE=1 E2E_STOREFRONT_SLUG="$SLUG" npx playwright test e2e/storefront-checkout-stripe.spec.ts
  fi
else
  echo "→ E2E skipped (npm run dev:safe)"
  echo ""
fi

echo "── Phase 7 human checklist ──"
echo "  ☐ STOREFRONT_SMOKE_BASE_URL=https://<vercel> STOREFRONT_CHECK_EMAIL=1 npm run storefront:prod-signoff"
echo "  ☐ Manual checkout on production pilot /s/${SLUG}"
echo "  ☐ RESEND_FROM_EMAIL domain verified — npm run storefront:verify-resend"
echo "  ☐ /invite/<token> — magic link only (no email in URL)"
echo "  ☐ /dashboard/storefront/workspace — create 2nd storefront + switcher"
echo "  ☐ Staging: LHCI_STRICT=1 LHCI_VANITY_HOSTS=hello-weekday.<host>"
echo "  ☐ Staging: STOREFRONT_E2E_STRIPE=1 + Connect onboarded"
echo "  ☐ Team invite audit rows in storefront_team_invite_events"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "✓ Phase 7 automated verify passed."
else
  echo "✗ Phase 7 verify had failures."
  exit 1
fi
