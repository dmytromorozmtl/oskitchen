#!/usr/bin/env bash
# Week-1 hardening verification (env + optional redirect smoke).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== Storefront Week 1 verify =="
echo "(env loaded via npm/tsx — do not: source .env.production.local)"
echo ""
echo ""

export STOREFRONT_ENV_TARGET=production
export STOREFRONT_WEEK1_MODE=1

ENV_FAIL=0
if ! npm run check-env:storefront; then
  ENV_FAIL=1
fi

echo ""
echo "── Week 1 ops checklist ──"
echo ""

if [[ -n "${NEXT_PUBLIC_TURNSTILE_SITE_KEY:-}" && -n "${TURNSTILE_SECRET_KEY:-}" ]]; then
  echo "✓ Turnstile keys loaded in shell"
else
  echo "⚠ Turnstile — add keys to Vercel Prod + Preview → redeploy"
  echo "  docs/artifacts/STOREFRONT_TURNSTILE_VERCEL_SETUP.md"
fi

if [[ "${STOREFRONT_REDIRECTS_ENABLED:-}" == "true" ]]; then
  echo "✓ STOREFRONT_REDIRECTS_ENABLED=true"
  if [[ -n "${STOREFRONT_SMOKE_BASE_URL:-${PLAYWRIGHT_BASE_URL:-}}" ]]; then
    echo "  Run: npm run storefront:week1-complete  (includes redirect smoke)"
  else
    echo "  Set STOREFRONT_SMOKE_BASE_URL then: npm run smoke:storefront-redirects"
  fi
else
  echo "⚠ Redirects — set STOREFRONT_REDIRECTS_ENABLED=true in Vercel → redeploy"
fi

echo ""
echo "Lighthouse:"
echo "  LHCI_BASE_URL=<deployed-host> E2E_STORE_SLUG=hello npm run lighthouse:storefront"
echo "  npm run storefront:week1-artifacts"
echo ""
echo "Diagnose deploy: npm run storefront:diagnose-deploy"
echo "Full block:     npm run storefront:week1-complete"
echo "Sign-off:   docs/artifacts/WEEK1_SIGNOFF_RECORD.md"
echo ""

if [[ "${ENV_FAIL}" -ne 0 ]]; then
  exit 1
fi
