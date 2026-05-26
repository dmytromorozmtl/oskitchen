#!/usr/bin/env bash
# Copy non-secret structural vars from .env.local into .env.production.local for preflight.
# NEVER commit the result if it contains production-only values.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROD="${ROOT}/.env.production.local"
LOCAL="${ROOT}/.env.local"

[[ -f "${LOCAL}" ]] || { echo "Missing .env.local"; exit 1; }
[[ -f "${PROD}" ]] || cp "${ROOT}/.env.storefront.production.example" "${PROD}"

copy_key() {
  local key="$1"
  local val
  val="$(grep "^${key}=" "${LOCAL}" 2>/dev/null | head -1 | cut -d= -f2- || true)"
  [[ -n "${val}" ]] || return 0
  if grep -q "^${key}=" "${PROD}"; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=${val}|" "${PROD}"
    else
      sed -i "s|^${key}=.*|${key}=${val}|" "${PROD}"
    fi
  else
    echo "${key}=${val}" >> "${PROD}"
  fi
  echo "  synced ${key}"
}

echo "Syncing DB/Supabase keys from .env.local → .env.production.local"
for key in DATABASE_URL DIRECT_URL NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY CRON_SECRET; do
  copy_key "${key}"
done
if [[ -n "${STOREFRONT_PROD_APP_URL:-}" ]]; then
  if grep -q "^NEXT_PUBLIC_APP_URL=" "${PROD}"; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${STOREFRONT_PROD_APP_URL}|" "${PROD}"
    else
      sed -i "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${STOREFRONT_PROD_APP_URL}|" "${PROD}"
    fi
  else
    echo "NEXT_PUBLIC_APP_URL=${STOREFRONT_PROD_APP_URL}" >> "${PROD}"
  fi
  echo "  set NEXT_PUBLIC_APP_URL from STOREFRONT_PROD_APP_URL"
else
  echo "Done. Set NEXT_PUBLIC_APP_URL in .env.production.local (see docs/runbooks/STOREFRONT_TERMINAL_PLAYBOOK.md)."
fi
