#!/usr/bin/env bash
# Post-production deploy smoke (read-only HTTP).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib/validate-smoke-base-url.sh
source "${ROOT}/scripts/lib/validate-smoke-base-url.sh"

: "${STOREFRONT_SMOKE_BASE_URL:?Set STOREFRONT_SMOKE_BASE_URL to production URL}"
: "${STOREFRONT_SMOKE_SLUG:?Set STOREFRONT_SMOKE_SLUG}"

validate_smoke_base_url "${STOREFRONT_SMOKE_BASE_URL}" || exit 1

export STOREFRONT_SMOKE_ENV=production
export STOREFRONT_SMOKE_SKIP_LOCAL=1
export STOREFRONT_SMOKE_WRITE_ARTIFACT=docs/artifacts/storefront-smoke-production-latest.md

echo "Post-deploy smoke → ${STOREFRONT_SMOKE_BASE_URL}/s/${STOREFRONT_SMOKE_SLUG}"
npm run smoke:storefront-release

echo ""
echo "✓ Production HTTP smoke passed."

if [[ "${STOREFRONT_POST_DEPLOY_LIGHTHOUSE:-0}" == "1" ]]; then
  echo ""
  echo "→ Lighthouse on production URL…"
  export LHCI_BASE_URL="${STOREFRONT_SMOKE_BASE_URL}"
  export E2E_STORE_SLUG="${STOREFRONT_SMOKE_SLUG}"
  npm run lighthouse:storefront || {
    echo "⚠ Lighthouse below threshold — review before marketing push."
    exit 1
  }
  echo "✓ Lighthouse passed."
fi

echo "Monitor 24h: Order Hub, Vercel cron logs, Stripe dashboard (if Option B)."
