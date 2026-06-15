#!/usr/bin/env bash
# Pre-deploy gate for paid pilot staging/production (code + env sanity).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"

NODE_MAJOR="$("$NODE" -p "process.versions.node.split('.')[0]")"
if [[ "$NODE_MAJOR" != "22" ]]; then
  echo "FAIL Node version must be 22.x (got $($NODE -v))" >&2
  exit 1
fi
echo "PASS Node $($NODE -v)"

fail=0
step() {
  if "$@"; then
    echo "PASS $*"
  else
    echo "FAIL $*" >&2
    fail=1
  fi
}

step "$NPM" run typecheck
step "$NPM" run lint
step "$NPM" test
step npx prisma validate
step tsx scripts/validate-production-crons.ts
step "$NPM" run validate:cron-inventory
step "$NPM" run validate:tenant-scope-pilot
# era8-pilot-preflight-claims-strict-v1 — roadmap terms fail in paid pilot gate
step env MARKETING_CLAIMS_STRICT=1 "$NPM" run verify-claims

if [[ "${SKIP_BUILD:-}" == "1" ]]; then
  echo "SKIP build (SKIP_BUILD=1)"
else
  step env \
    NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://example.supabase.co}" \
    NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder}" \
    DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/kitchenos_ci}" \
    DIRECT_URL="${DIRECT_URL:-postgresql://postgres:postgres@localhost:5432/kitchenos_ci}" \
    "$NPM" run build
fi

required_vars=(
  DATABASE_URL
  DIRECT_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  CRON_SECRET
)
for v in "${required_vars[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo "WARN env $v is unset (required on staging deploy)"
  else
    echo "PASS env $v is set"
  fi
done

if [[ "${ENABLE_EXPERIMENTAL_CRONS:-}" == "true" ]]; then
  echo "FAIL ENABLE_EXPERIMENTAL_CRONS must not be true for pilot production" >&2
  fail=1
else
  echo "PASS ENABLE_EXPERIMENTAL_CRONS not enabled"
fi

if [[ "${NEXT_PUBLIC_NAV_RELEASE_PROFILE:-}" == "pilot" ]]; then
  echo "PASS NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot"
else
  echo "WARN NEXT_PUBLIC_NAV_RELEASE_PROFILE is not 'pilot' (set for paid pilot tenants)"
fi

if [[ "$fail" -ne 0 ]]; then
  echo ""
  echo "PILOT PREFLIGHT: FAIL"
  exit 1
fi
echo ""
echo "PILOT PREFLIGHT: PASS"
