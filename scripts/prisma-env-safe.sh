#!/usr/bin/env bash
# Load DATABASE_URL / DIRECT_URL from .env files without shell poisoning.
set -euo pipefail
cd "$(dirname "$0")/.."

unset DATABASE_URL DIRECT_URL 2>/dev/null || true

eval "$(npx tsx scripts/print-prisma-env-exports.ts)"
