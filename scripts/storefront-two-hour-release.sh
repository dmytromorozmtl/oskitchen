#!/usr/bin/env bash
# Orchestrates the "next 2 hours" release block (local + optional remote smoke).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront — 2-hour release block                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── Block 1: Local env ─────────────────────────────────────────
echo "▶ 1/6 Local env + Vercel manifest"
if [[ ! -f .env.production.local ]]; then
  cp .env.storefront.production.example .env.production.local
fi
npm run storefront:apply-deploy-urls || true
npm run storefront:env:sync-local || true
if ! grep -q '^STOREFRONT_MIDDLEWARE_SECRET=.\{20,\}' .env.production.local 2>/dev/null; then
  npm run storefront:secrets:generate
fi
npm run storefront:vercel-manifest || true
npm run storefront:release-preflight
echo ""

# ── Block 2: Stripe sign-off reminder ─────────────────────────
echo "▶ 2/6 Stripe sign-off (Product)"
echo "   docs/artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md"
echo "   docs/artifacts/PRODUCT_STRIPE_SIGNOFF_GUIDE.md"
echo ""

# ── Block 3: Staging QA (optional) ────────────────────────────
echo "▶ 3/6 Staging QA artifact"
if [[ -n "${STOREFRONT_SMOKE_BASE_URL:-}" && -n "${STOREFRONT_SMOKE_SLUG:-}" ]]; then
  export STOREFRONT_SMOKE_SKIP_LOCAL=1
  export STOREFRONT_STRIPE_OPTION="${STOREFRONT_STRIPE_OPTION:-A}"
  npm run storefront:qa-artifact
else
  echo "   SKIP — create .env.storefront.staging.local or export:"
  echo '     export STOREFRONT_SMOKE_BASE_URL="https://your-staging.vercel.app"'
  echo "     STOREFRONT_SMOKE_SLUG=hello"
  echo "   Then: npm run storefront:staging-qa"
fi
echo ""

# ── Block 4: Vercel upload ────────────────────────────────────
echo "▶ 4/6 Vercel Production upload"
echo "   docs/artifacts/VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md"
echo "   Paste SET keys → Vercel → Redeploy Production"
echo ""

# ── Block 5: Post-deploy (optional) ───────────────────────────
echo "▶ 5/6 Post-deploy smoke"
if [[ -n "${STOREFRONT_SMOKE_BASE_URL:-}" && "${STOREFRONT_SMOKE_ENV:-}" == "production" ]]; then
  npm run storefront:post-deploy
else
  echo "   SKIP — after prod deploy:"
  echo '     export STOREFRONT_SMOKE_BASE_URL="https://your-prod.vercel.app"'
  echo "     export STOREFRONT_SMOKE_SLUG=hello"
  echo "     STOREFRONT_SMOKE_ENV=production npm run storefront:post-deploy"
fi
echo ""

# ── Block 6: Closure status ───────────────────────────────────
echo "▶ 6/6 Closure tracker"
npm run storefront:release-status || true
echo ""
echo "Done."
