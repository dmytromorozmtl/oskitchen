#!/usr/bin/env bash
# Push staging env vars to Vercel (wrapper around existing TypeScript tooling).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"

if [[ ! -f .env.staging.local && ! -f .env.staging ]]; then
  echo "ERROR: Missing .env.staging.local — copy from .env.staging.template and fill values." >&2
  exit 1
fi

echo "=== Vercel staging environment ==="
echo "Dry-run keys:"
"$NPM" run vercel:staging-push -- --dry-run

if [[ "${1:-}" == "--apply" ]]; then
  echo ""
  echo "Applying to Vercel (staging target)…"
  "$NPM" run vercel:staging-push -- --apply
else
  echo ""
  echo "To apply: bash scripts/ops/setup-vercel-env.sh --apply"
  echo "Or: npm run vercel:staging-push -- --apply"
fi

echo ""
echo "Remember on Vercel (staging):"
echo "  NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot"
echo "  RATE_LIMIT_ADAPTER=upstash + UPSTASH_REDIS_REST_*"
echo "  ENABLE_EXPERIMENTAL_CRONS must be UNSET"
