#!/usr/bin/env bash
# DB + env ops only (fast). Code gates: npm run verify:pilot-readiness
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"
# shellcheck source=scripts/load-staging-env.sh
source "${ROOT}/scripts/load-staging-env.sh"

load_staging_env

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL required (.env.local or .env.staging.local)" >&2
  exit 1
fi

export SKIP_PILOT_CODE_READINESS=1
export SKIP_SECURITY_TESTS="${SKIP_SECURITY_TESTS:-1}"
export PILOT_LOCAL_ENV="${PILOT_LOCAL_ENV:-1}"
exec bash "${ROOT}/scripts/run-staging-pilot-complete.sh" "$@"
