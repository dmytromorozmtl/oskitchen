#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"
# shellcheck source=scripts/load-staging-env.sh
source "${ROOT}/scripts/load-staging-env.sh"
load_staging_env
# Prefer known Vercel preview from storefront env when staging URL unset
npx tsx scripts/bootstrap-staging-from-known-env.ts 2>/dev/null || true
load_staging_env
exec npx tsx scripts/run-pilot-next-step.ts "$@"
