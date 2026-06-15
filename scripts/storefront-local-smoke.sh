#!/usr/bin/env bash
# Local dev smoke — http://localhost:3000/s/hello
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BASE="${STOREFRONT_SMOKE_BASE_URL:-http://localhost:3000}"
SLUG="${STOREFRONT_SMOKE_SLUG:-hello}"
PORT="${STOREFRONT_DEV_PORT:-3000}"

if ! curl -sf -o /dev/null "http://127.0.0.1:${PORT}/s/${SLUG}" 2>/dev/null; then
  echo "Dev server not running on port ${PORT}."
  echo "Start: npm run dev:safe"
  exit 1
fi

if curl -sf "http://127.0.0.1:${PORT}/s/${SLUG}" 2>/dev/null | grep -q '_document.js'; then
  echo "⚠ Dev .next cache looks corrupted (500 / _document.js). Run: rm -rf .next && npm run dev:safe"
  exit 1
fi

export STOREFRONT_SMOKE_BASE_URL="${BASE}"
export STOREFRONT_SMOKE_SLUG="${SLUG}"
export STOREFRONT_SMOKE_ENV=local
export STOREFRONT_SMOKE_SKIP_LOCAL=1
export STOREFRONT_SMOKE_WRITE_ARTIFACT=docs/artifacts/storefront-smoke-local-latest.md

echo "Local smoke → ${BASE}/s/${SLUG}"
npm run smoke:storefront-release

echo ""
echo "✓ Local HTTP smoke passed."
echo "Artifact: docs/artifacts/storefront-smoke-local-latest.md"
