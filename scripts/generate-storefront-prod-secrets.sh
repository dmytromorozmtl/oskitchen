#!/usr/bin/env bash
# Generate missing P0 secrets and merge into .env.production.local (local only — never commit filled file).
#
#   ./scripts/generate-storefront-prod-secrets.sh
#   npm run storefront:secrets:generate
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${ROOT}/.env.production.local"
EXAMPLE="${ROOT}/.env.storefront.production.example"

if [[ ! -f "${TARGET}" ]]; then
  cp "${EXAMPLE}" "${TARGET}"
  echo "Created ${TARGET} from example"
fi

gen() { openssl rand -base64 32 | tr -d '\n'; }

set_kv() {
  local key="$1"
  local val="$2"
  if grep -q "^${key}=" "${TARGET}" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=${val}|" "${TARGET}"
    else
      sed -i "s|^${key}=.*|${key}=${val}|" "${TARGET}"
    fi
  else
    echo "${key}=${val}" >> "${TARGET}"
  fi
}

needs() {
  local key="$1"
  local cur
  cur="$(grep "^${key}=" "${TARGET}" 2>/dev/null | cut -d= -f2- || true)"
  [[ -z "${cur// }" ]]
}

echo "Generating secrets into .env.production.local (not printed)"

for key in STOREFRONT_MIDDLEWARE_SECRET CRON_SECRET AUTH_SECRET; do
  if needs "${key}"; then
    set_kv "${key}" "$(gen)"
    echo "  + ${key}"
  fi
done

if needs "STOREFRONT_PREVIEW_SECRET"; then
  set_kv "STOREFRONT_PREVIEW_SECRET" "$(gen)"
  echo "  + STOREFRONT_PREVIEW_SECRET"
fi

echo ""
echo "Next:"
echo "  1. Set NEXT_PUBLIC_APP_URL to your real prod URL in .env.production.local"
echo "  2. Copy DATABASE_URL / DIRECT_URL / Supabase from .env.local if needed"
echo "  3. npm run storefront:release-preflight"
echo ""
echo "⚠ Do NOT commit .env.production.local"
