#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Broken `source .env.production.local` in zsh poisons DATABASE_URL (& in URL → invalid string).
unset DATABASE_URL DIRECT_URL 2>/dev/null || true

if command -v lsof >/dev/null 2>&1; then
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

rm -rf .next
npx --yes tsx scripts/validate-database-env.ts

# Signing secrets for server cart / preview / middleware (not DATABASE_URL).
if [[ -f .env.production.local ]]; then
  # shellcheck disable=SC1090
  eval "$(npx --yes tsx scripts/export-dev-storefront-secrets.ts)"
fi

node ./node_modules/prisma/build/index.js generate
node scripts/ensure-prisma-client-default.cjs
node scripts/ensure-sentry-otel-shim.cjs
exec npm run dev
