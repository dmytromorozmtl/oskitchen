#!/usr/bin/env bash
# Phase 3 — production sign-off: deploy URL, HTTP smoke, Stripe Connect, optional Lighthouse.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SLUG="${STOREFRONT_PILOT_SLUG:-hello}"
FAIL=0

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront Phase 9 — production sign-off (P0 gate)      ║"
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

if [[ -z "${STOREFRONT_SMOKE_BASE_URL:-}" ]]; then
  echo "→ Deploy URL"
  echo "  ✗ Set STOREFRONT_SMOKE_BASE_URL (or run: npm run storefront:bind-deploy-url -- <url>)"
  FAIL=1
  echo ""
else
  step "Deploy diagnosis" npm run storefront:diagnose-deploy
  step "Post-deploy HTTP smoke" bash scripts/storefront-post-deploy.sh
  step "Phase 9 sign-off artifact" npm run storefront:phase9-artifact || true

  if [[ "${STOREFRONT_SIGNOFF_LIGHTHOUSE:-0}" == "1" ]]; then
    echo "→ Lighthouse (production)"
    export LHCI_BASE_URL="${STOREFRONT_SMOKE_BASE_URL}"
    export E2E_STORE_SLUG="${STOREFRONT_SMOKE_SLUG:-$SLUG}"
    if npm run lighthouse:storefront; then
      echo "  ✓ Lighthouse"
    else
      echo "  ✗ Lighthouse below threshold"
      FAIL=1
    fi
    echo ""
  else
    echo "→ Lighthouse skipped (set STOREFRONT_SIGNOFF_LIGHTHOUSE=1 to run on prod URL)"
    echo ""
  fi
fi

step "Stripe Connect smoke" npm run storefront:stripe-connect-smoke || true

step "Email env (team invites)" env STOREFRONT_CHECK_EMAIL=1 npm run check-env:storefront || true

step "Form upload storage" npm run storefront:verify-form-upload || true

step "Pilot tax preset (local DB)" npm run storefront:seed-pilot-tax || true

step "Resend domain (optional)" npm run storefront:verify-resend || true

echo "── Manual QA checklist (human) ──"
echo "  ☐ /s/${SLUG} — menu, sold out, variant PDP"
echo "  ☐ Checkout — delivery address, pay later or Stripe test card"
echo "  ☐ Order confirmation → Order again (replace / add to cart)"
echo "  ☐ /dashboard/storefront/catalog — variant edit"
echo "  ☐ /dashboard/storefront/team — staff permissions"
echo "  ☐ ?market= on menu, cart, checkout when 2+ markets"
echo "  ☐ Ordering → Sales tax — stacked lines at checkout + order email"
echo "  ☐ Order Hub — Market badge + Export CSV (market_id, tax_total)"
echo "  ☐ /dashboard/orders/[id] — Storefront preorder card (tax + market)"
echo "  ☐ /dashboard/storefront/team — invite teammate by email"
echo "  ☐ /dashboard/storefront/markets — per-market activeMenuId"
echo "  ☐ Stripe test card OR pay later checkout on pilot"
echo "  ☐ Invite email → signup → auto workspace join"
echo "  ☐ Market vanity host (hello-weekday.{ROOT_DOMAIN})"
echo "  ☐ /dashboard/storefront/workspace — multi-store list"
echo "  ☐ /invite/<token> deep link → auto workspace join"
echo "  ☐ RESEND_API_KEY + RESEND_FROM_EMAIL on Vercel prod"
echo "  ☐ Wildcard DNS *.ROOT_DOMAIN on Vercel"
echo "  ☐ /invite/<token> — magic link flow (no ?email= in URL)"
echo "  ☐ Multi-store: /dashboard/storefront/workspace — 2nd store + switcher"
echo "  ☐ Staging LHCI_STRICT=1 + LHCI_VANITY_HOSTS"
echo "  ☐ Staging STOREFRONT_E2E_STRIPE=1 (Connect)"
echo "  ☐ Brand vanity host → kos_brand cookie + brand SEO"
echo "  ☐ /s/${SLUG}/robots.txt + sitemap.xml on prod URL"
echo "  ☐ /dashboard/storefront/team/audit → Export CSV"
echo "  ☐ Cron: storefront-invite-audit-retention (90d)"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "✓ Automated prod sign-off passed."
  exit 0
fi

echo "✗ Prod sign-off had failures — fix before go-live."
exit 1
