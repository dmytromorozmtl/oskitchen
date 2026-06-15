#!/usr/bin/env bash
# Phase 9 — brand cookie middleware, robots/sitemap, audit export, retention, E2E.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SLUG="${STOREFRONT_PILOT_SLUG:-hello}"
FAIL=0

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront Phase 9 — verify                             ║"
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
step "DB schema check" npm run db:check-storefront-schema
step "Storefront unit tests" npm run test:storefront-release

step "Brand cookie + robots modules present" bash -c '
  test -f lib/storefront/brand-cookie.ts &&
  test -f lib/storefront/public-storefront-brand.ts &&
  test -f app/s/[storeSlug]/robots.txt/route.ts
'

step "Middleware brand before market (composite host)" bash -c '
  grep -q guessVanityHostFromLabel middleware.ts &&
  grep -q applyBrandContext middleware.ts
'

step "Invite audit export route" bash -c 'test -f app/api/dashboard/storefront/team-invite-audit-export/route.ts'
step "Invite audit retention cron" bash -c 'test -f app/api/cron/storefront-invite-audit-retention/route.ts'

if curl -sf "http://127.0.0.1:3000/api/health" >/dev/null 2>&1; then
  step "Brand host E2E" env E2E_STOREFRONT_SLUG="$SLUG" npx playwright test e2e/storefront-brand-host.spec.ts
  if [[ -n "${E2E_LOGIN_EMAIL:-}" ]]; then
    step "Multi-store E2E" npx playwright test e2e/storefront-multi-store.spec.ts
  else
    echo "→ Multi-store E2E skipped (set E2E_LOGIN_EMAIL + E2E_LOGIN_PASSWORD)"
    echo ""
  fi
else
  echo "→ E2E skipped (start: npm run dev:safe)"
  echo ""
fi

if [[ -n "${STOREFRONT_SMOKE_BASE_URL:-}" ]]; then
  step "Prod sign-off smoke" bash scripts/storefront-prod-signoff.sh
  step "QA artifact (P0 gate)" npm run storefront:qa-artifact || true
else
  echo "→ P0 prod sign-off skipped — set STOREFRONT_SMOKE_BASE_URL for go-live artifact"
  echo ""
fi

echo "── Phase 9 human checklist ──"
echo "  ☐ Brand vanity: {brand}.{store}.{ROOT_DOMAIN} → kos_brand cookie + theme"
echo "  ☐ /s/{slug}/robots.txt + sitemap use brand canonical when cookie set"
echo "  ☐ /dashboard/storefront/team/audit → Export CSV"
echo "  ☐ Cron: /api/cron/storefront-invite-audit-retention (weekly)"
echo "  ☐ Vercel: STOREFRONT_MIDDLEWARE_SECRET + wildcard DNS"
echo "  ☐ npm run storefront:qa-artifact with production STOREFRONT_SMOKE_BASE_URL"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "✓ Phase 9 automated verify passed."
else
  echo "✗ Phase 9 verify had failures."
  exit 1
fi
