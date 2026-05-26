#!/usr/bin/env bash
# Generate missing P0 secrets into .env.staging.local (never commit filled file).
#
#   ./scripts/generate-staging-pilot-secrets.sh
#   npm run staging:secrets:generate
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${ROOT}/.env.staging.local"
EXAMPLE="${ROOT}/.env.staging.example"

if [[ ! -f "${TARGET}" ]]; then
  cp "${EXAMPLE}" "${TARGET}"
  echo "Created ${TARGET} from .env.staging.example"
fi

gen() { openssl rand -base64 32 | tr -d '\n'; }

set_kv() {
  local key="$1"
  local val="$2"
  # Strip surrounding quotes from source .env.local values
  val="${val#\"}"
  val="${val%\"}"
  val="${val#\'}"
  val="${val%\'}"
  if grep -q "^${key}=" "${TARGET}" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=\"${val}\"|" "${TARGET}"
    else
      sed -i "s|^${key}=.*|${key}=\"${val}\"|" "${TARGET}"
    fi
  else
    echo "${key}=\"${val}\"" >> "${TARGET}"
  fi
}

needs() {
  local key="$1"
  local cur
  cur="$(grep "^${key}=" "${TARGET}" 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
  [[ -z "${cur// }" ]]
}

is_placeholder() {
  local val="$1"
  [[ "$val" == *"aws-REGION"* ]] || [[ "$val" == *"PROJECT"* ]] || [[ "$val" == *"PASSWORD"* ]]
}

echo "Generating staging pilot secrets into .env.staging.local (values not printed)"

for key in CRON_SECRET ENCRYPTION_KEY; do
  if needs "${key}"; then
    set_kv "${key}" "$(gen)"
    echo "  + ${key}"
  fi
done

if needs "RATE_LIMIT_ADAPTER"; then
  set_kv "RATE_LIMIT_ADAPTER" "upstash"
  echo "  + RATE_LIMIT_ADAPTER=upstash (set UPSTASH_* from https://console.upstash.com)"
fi

if needs "NEXT_PUBLIC_APP_ENV"; then
  set_kv "NEXT_PUBLIC_APP_ENV" "staging"
  echo "  + NEXT_PUBLIC_APP_ENV=staging"
fi

# NODE_ENV: remove from staging file — Vercel sets at runtime; avoids blocking local migrate scripts
if grep -q "^NODE_ENV=" "${TARGET}" 2>/dev/null; then
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' '/^NODE_ENV=/d' "${TARGET}"
  else
    sed -i '/^NODE_ENV=/d' "${TARGET}"
  fi
  echo "  - removed NODE_ENV (set on Vercel only)"
fi

# DB URLs: keep in .env.local only (load_staging_env overlays .env.local last).
# Remove placeholder connection strings from staging file if present.
if [[ -f "${TARGET}" ]]; then
  for key in DATABASE_URL DIRECT_URL; do
    cur="$(grep "^${key}=" "${TARGET}" 2>/dev/null | cut -d= -f2- | tr -d '"' || true)"
    if is_placeholder "${cur}"; then
      if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "/^${key}=/d" "${TARGET}"
      else
        sed -i "/^${key}=/d" "${TARGET}"
      fi
      echo "  - removed placeholder ${key} (use .env.local)"
    fi
  done
fi

echo ""
echo "Next:"
echo "  1. Add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in .env.staging.local (Upstash console)"
echo "  2. npm run verify:staging-env"
echo "  3. npm run staging:pilot:complete"
echo ""
echo "Do NOT commit .env.staging.local"
