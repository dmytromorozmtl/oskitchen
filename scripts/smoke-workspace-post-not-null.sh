#!/usr/bin/env bash
# Automated gates for post-NOT NULL workspace migration (Sprint 24).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== KitchenOS workspace post-NOT NULL smoke ==="

if [[ -n "${SMOKE_BASE_URL:-}" || -n "${NEXT_PUBLIC_APP_URL:-}" ]]; then
  echo "→ Production HTTP tenant smoke"
  npx tsx scripts/smoke-production-tenant.ts
fi

echo "→ Unit tests"
npm run test:unit

echo "→ Service scope audit (strict)"
npm run workspace:audit:services:strict

echo "→ Workspace coverage + post-backfill verify (strict)"
npm run workspace:strict:all

echo "→ Staff order scope"
npm run verify:staff-scope

echo "→ Duplicate owner workspaces (dry-run)"
npx tsx scripts/reconcile-duplicate-owner-workspaces.ts --dry-run

if [[ -n "${SMOKE_PREFLIGHT_EMAIL:-}" ]]; then
  echo "→ Kitchen preflight (${SMOKE_PREFLIGHT_EMAIL})"
  npm run beta:kitchen-preflight -- --email="${SMOKE_PREFLIGHT_EMAIL}"
fi

echo ""
echo "→ Public E2E smoke (no auth)"
if command -v npx >/dev/null 2>&1; then
  npm run test:e2e:public-smoke || {
    echo "⚠ Public E2E failed — ensure dev server or PLAYWRIGHT_BASE_URL is set"
    exit 1
  }
fi

if [[ ! -f .env.e2e.local ]] && [[ -z "${E2E_LOGIN_PASSWORD:-}" ]] && [[ -n "${SUPABASE_SERVICE_ROLE_KEY:-${DATABASE_URL:-}}" ]]; then
  if command -v npm >/dev/null 2>&1 && [[ -f scripts/bootstrap-e2e-credentials.ts ]]; then
    echo "→ Bootstrap E2E credentials (.env.e2e.local)"
    npx tsx scripts/bootstrap-e2e-credentials.ts || true
    if [[ -f .env.e2e.local ]]; then set -a; source .env.e2e.local; set +a; fi
  fi
fi

if [[ -n "${E2E_LOGIN_EMAIL:-}" && -n "${E2E_LOGIN_PASSWORD:-}" ]]; then
  echo "→ Authenticated workspace smoke (Playwright)"
  npx playwright test e2e/workspace-post-not-null-smoke.spec.ts e2e/smoke.spec.ts e2e/ci-smoke.spec.ts \
    --project=setup --project=chromium-authed || {
    echo "⚠ Authed E2E failed — ensure app is running at PLAYWRIGHT_BASE_URL"
    exit 1
  }
else
  echo "⚠ Skip authed E2E — set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD"
fi

if [[ -n "${E2E_STAFF_EMAIL:-}" && -n "${E2E_STAFF_PASSWORD:-}" ]]; then
  echo "→ Staff visibility smoke"
  npx playwright test tests/e2e/staff-order-visibility.spec.ts --project=setup-staff --project=chromium-staff
else
  echo "⚠ Skip staff E2E — set E2E_STAFF_EMAIL and E2E_STAFF_PASSWORD"
fi

echo ""
echo "✅ Automated workspace post-NOT NULL smoke passed."
echo "Manual: docs/SMOKE_POST_NOT_NULL_CHECKLIST.md (visual QA, pilot kitchens)"
