#!/usr/bin/env bash
# Apply known Vercel hosts to local env files (no secrets). Safe to re-run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STAGING_URL="${STOREFRONT_KNOWN_STAGING_URL:-https://xn---preview--staging-r4nxb5ja9d6q.vercel.app}"
PROD_URL="${STOREFRONT_KNOWN_PRODUCTION_URL:-https://xn---production-xijza32a.vercel.app}"
SLUG="${STOREFRONT_PILOT_SLUG:-hello}"

PROD_ENV="${ROOT}/.env.production.local"
STAGING_ENV="${ROOT}/.env.storefront.staging.local"
STAGING_EX="${ROOT}/.env.storefront.staging.example"

[[ -f "${PROD_ENV}" ]] || cp "${ROOT}/.env.storefront.production.example" "${PROD_ENV}"

set_or_replace() {
  local file="$1" key="$2" val="$3"
  if grep -q "^${key}=" "${file}" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=${val}|" "${file}"
    else
      sed -i "s|^${key}=.*|${key}=${val}|" "${file}"
    fi
  else
    echo "${key}=${val}" >> "${file}"
  fi
}

echo "Applying deploy URLs (slug=${SLUG})"
echo "  Production NEXT_PUBLIC_APP_URL → ${PROD_URL}"
set_or_replace "${PROD_ENV}" "NEXT_PUBLIC_APP_URL" "${PROD_URL}"

if [[ ! -f "${STAGING_ENV}" ]]; then
  cp "${STAGING_EX}" "${STAGING_ENV}"
  echo "  Created ${STAGING_ENV}"
fi
set_or_replace "${STAGING_ENV}" "STOREFRONT_SMOKE_BASE_URL" "${STAGING_URL}"
set_or_replace "${STAGING_ENV}" "STOREFRONT_SMOKE_SLUG" "${SLUG}"
set_or_replace "${STAGING_ENV}" "STOREFRONT_STRIPE_OPTION" "A"

echo ""
echo "Verify hosts (fixes DEPLOYMENT_NOT_FOUND):"
echo "  npm run storefront:diagnose-deploy"
echo ""
echo "Next:"
echo "  npm run storefront:vercel-manifest"
echo "  npm run storefront:staging-qa    # after staging deploy"
echo "  STOREFRONT_SMOKE_BASE_URL=${PROD_URL} STOREFRONT_SMOKE_SLUG=${SLUG} STOREFRONT_SMOKE_ENV=production npm run storefront:post-deploy"
