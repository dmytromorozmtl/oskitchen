#!/usr/bin/env bash
# Run every automated step of the storefront release closure checklist.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
DATE="$(date -u +%Y-%m-%d)"
STATUS="${ROOT}/docs/artifacts/STOREFRONT_RELEASE_CLOSURE_STATUS.md"

mkdir -p "${ROOT}/docs/artifacts"

echo "== Storefront close release =="

if [[ ! -f .env.production.local ]]; then
  cp .env.storefront.production.example .env.production.local
  echo "Created .env.production.local"
fi

if ! grep -q '^STOREFRONT_MIDDLEWARE_SECRET=.\+' .env.production.local 2>/dev/null; then
  echo "Generating P0 secrets…"
  ./scripts/generate-storefront-prod-secrets.sh
fi

echo ""
echo "1/6 Env manifest (Vercel checklist)"
npm run storefront:vercel-manifest || true

echo ""
echo "2/6 Preflight"
npm run storefront:release-preflight

echo ""
echo "3/6 Stripe sign-off"
echo "   → docs/artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md"
echo "   → docs/artifacts/PRODUCT_STRIPE_SIGNOFF_GUIDE.md"

echo ""
echo "4/6 GitHub gates"
if command -v gh >/dev/null 2>&1; then
  npm run github:storefront-gates || true
else
  echo "   gh CLI not installed — follow docs/artifacts/GITHUB_MANUAL_SETUP.md"
fi

echo ""
echo "5/6 Staging smoke + QA artifact"
if [[ -n "${STOREFRONT_SMOKE_BASE_URL:-}" && -n "${STOREFRONT_SMOKE_SLUG:-}" ]]; then
  export STOREFRONT_STRIPE_OPTION="${STOREFRONT_STRIPE_OPTION:-A}"
  npm run storefront:qa-artifact
else
  echo "   SKIP — set STOREFRONT_SMOKE_BASE_URL and STOREFRONT_SMOKE_SLUG"
fi

echo ""
echo "6/6 Post-deploy (production)"
if [[ -n "${STOREFRONT_SMOKE_BASE_URL:-}" && "${STOREFRONT_SMOKE_ENV:-}" == "production" ]]; then
  npm run storefront:post-deploy
else
  echo "   SKIP — set STOREFRONT_SMOKE_BASE_URL + STOREFRONT_SMOKE_ENV=production after deploy"
fi

echo ""
echo "Closure status: ${STATUS}"
echo "Done."
