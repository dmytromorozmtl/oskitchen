#!/usr/bin/env bash
# Staging QA: load .env.storefront.staging.local → HTTP smoke + QA artifact.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=scripts/lib/validate-smoke-base-url.sh
source "${ROOT}/scripts/lib/validate-smoke-base-url.sh"

STAGING_ENV="${ROOT}/.env.storefront.staging.local"
if [[ -f "${STAGING_ENV}" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${STAGING_ENV}"
  set +a
  echo "Loaded ${STAGING_ENV}"
elif [[ -f "${ROOT}/.env.production.local" ]]; then
  echo "Tip: create .env.storefront.staging.local from .env.storefront.staging.example"
fi

: "${STOREFRONT_SMOKE_BASE_URL:?Set STOREFRONT_SMOKE_BASE_URL (staging URL)}"
: "${STOREFRONT_SMOKE_SLUG:?Set STOREFRONT_SMOKE_SLUG (e.g. hello)}"

validate_smoke_base_url "${STOREFRONT_SMOKE_BASE_URL}" || exit 1

export STOREFRONT_STRIPE_OPTION="${STOREFRONT_STRIPE_OPTION:-A}"
export STOREFRONT_SMOKE_SKIP_LOCAL=1
export STOREFRONT_SMOKE_ENV=staging

echo "Staging QA → ${STOREFRONT_SMOKE_BASE_URL}/s/${STOREFRONT_SMOKE_SLUG}"
npm run storefront:qa-artifact

echo ""
echo "Next: complete manual rows in docs/artifacts/storefront-qa-release-*.md"
echo "      docs/artifacts/STOREFRONT_MANUAL_QA_RUNBOOK.md"
