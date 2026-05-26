#!/usr/bin/env bash
# Phase 6 — invites table, deep links, cron, CI, LCP, multi-brand.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SLUG="${STOREFRONT_PILOT_SLUG:-hello}"
FAIL=0

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront Phase 6 — verify                             ║"
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
step "Phase 6 SQL (invites table)" npm run db:apply-storefront-phase6
step "Storefront unit tests" npm run test:storefront-release

step "Prod email env (optional)" env STOREFRONT_CHECK_EMAIL=1 npm run check-env:storefront || true

if curl -sf "http://127.0.0.1:3000/api/health" >/dev/null 2>&1; then
  step "Pay-later checkout E2E" env E2E_STOREFRONT_SLUG="$SLUG" npx playwright test e2e/storefront-checkout-pay-later.spec.ts
else
  echo "→ E2E skipped (npm run dev:safe)"
  echo ""
fi

echo "── Phase 6 human checklist ──"
echo "  ☐ Vercel: *.ROOT_DOMAIN CNAME + NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN"
echo "  ☐ RESEND_API_KEY + RESEND_FROM_EMAIL on production"
echo "  ☐ /invite/<token> → signup → dashboard team"
echo "  ☐ Cron: /api/cron/storefront-team-invite-reminders (daily 10:00 UTC)"
echo "  ☐ /dashboard/storefront/workspace — link brand + vanity hosts"
echo "  ☐ STOREFRONT_SMOKE_BASE_URL=… npm run storefront:prod-signoff"
echo "  ☐ Staging: LHCI_STRICT=1 LHCI_VANITY_HOSTS=hello-weekday.<host>"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "✓ Phase 6 automated verify passed."
  exit 0
fi
echo "✗ Phase 6 verify had failures."
exit 1
