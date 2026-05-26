#!/usr/bin/env bash
# Week 1 hardening — run automatable checks. Env loaded inside npm/tsx (never bash source).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Preserve explicit exports from the shell (do not let staging.local override)
LOCKED_SMOKE_BASE="${STOREFRONT_SMOKE_BASE_URL:-}"
LOCKED_LHCI_BASE="${LHCI_BASE_URL:-}"

export STOREFRONT_ENV_TARGET=production
export STOREFRONT_WEEK1_MODE=1

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront Week 1 — complete verification               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

FAIL=0

echo "▶ 0/6 Deploy diagnosis"
if npm run storefront:diagnose-deploy; then
  echo "   ✓ at least one deploy URL looks valid"
else
  echo "   ✗ fix deploy URLs before HTTP smoke / Lighthouse (see DEPLOY_404_PLAYBOOK.md)"
  FAIL=1
fi
echo ""

echo "▶ 1/6 Redirect rules (DB seed)"
if npm run storefront:seed-week1-redirects; then
  echo "   ✓ seed OK"
else
  echo "   ⚠ seed failed — check DATABASE_URL (use npm, not: source .env.production.local)"
  FAIL=1
fi
echo ""

echo "▶ 2/6 Environment (Week 1 mode)"
if npm run check-env:storefront; then
  echo "   ✓ env OK"
else
  echo "   ✗ env critical failed"
  FAIL=1
fi
echo ""

echo "▶ 3/6 Turnstile"
if npx --yes tsx -e "
  require('./scripts/lib/load-storefront-script-env.ts').loadStorefrontScriptEnv();
  const ok = !!(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);
  process.exit(ok ? 0 : 1);
" 2>/dev/null; then
  echo "   ✓ Turnstile keys in env files"
else
  echo "   ⚠ Turnstile — Vercel keys + redeploy (STOREFRONT_TURNSTILE_VERCEL_SETUP.md)"
fi
echo ""

echo "▶ 4/6 Redirect smoke"
if [[ -n "${LOCKED_SMOKE_BASE}" ]]; then
  export STOREFRONT_SMOKE_BASE_URL="${LOCKED_SMOKE_BASE}"
fi
SMOKE_BASE="${STOREFRONT_SMOKE_BASE_URL:-}"
REDIRECT_LOG="${ROOT}/docs/artifacts/storefront-redirect-smoke-latest.md"

if [[ "${STOREFRONT_REDIRECTS_ENABLED:-}" == "true" && -n "${SMOKE_BASE}" ]]; then
  export STOREFRONT_SMOKE_SLUG="${STOREFRONT_SMOKE_SLUG:-hello}"
  if npm run smoke:storefront-redirects -- /legacy-menu /menu 2>&1 | tee "${REDIRECT_LOG}"; then
    echo "   ✓ legacy-menu redirect PASS"
  else
    echo "   ✗ redirect smoke FAIL"
    FAIL=1
  fi
  if npm run smoke:storefront-redirects -- /order-now /menu 2>&1 | tee -a "${REDIRECT_LOG}"; then
    echo "   ✓ order-now redirect PASS"
  else
    FAIL=1
  fi
else
  echo "   SKIP — STOREFRONT_REDIRECTS_ENABLED=true and STOREFRONT_SMOKE_BASE_URL required"
fi
echo ""

echo "▶ 5/6 Lighthouse"
if [[ -n "${LOCKED_LHCI_BASE}" ]]; then
  export LHCI_BASE_URL="${LOCKED_LHCI_BASE}"
fi
LH_BASE="${LHCI_BASE_URL:-}"
if [[ -n "${LH_BASE}" ]]; then
  export E2E_STORE_SLUG="${E2E_STORE_SLUG:-hello}"
  if npm run lighthouse:storefront; then
    echo "   ✓ Lighthouse PASS"
  else
    echo "   ✗ Lighthouse FAIL (404 on host = fix deploy URL first)"
    FAIL=1
  fi
else
  echo "   SKIP — set LHCI_BASE_URL to a live host returning 200 on /s/hello/menu"
fi
echo ""

echo "▶ 6/6 Sign-off artifacts"
npm run storefront:week1-artifacts
echo ""

if [[ "${FAIL}" -ne 0 ]]; then
  echo "Week 1: BLOCKED — see docs/artifacts/DEPLOY_404_PLAYBOOK.md"
  exit 1
fi
echo "Week 1 automatable checks: PASS"
