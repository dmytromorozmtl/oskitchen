#!/usr/bin/env bash
# Local / CI code gate for paid pilot readiness (no DATABASE_URL required).
# Staging ops (migrate, backfill, E2E) are separate — see docs/PAID_PILOT_GO_NO_GO_CHECKLIST.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"

run() {
  echo ""
  echo "== $1 =="
  shift
  "$@"
}

fail=0
step() {
  if "$@"; then
    echo "OK  $*"
  else
    echo "FAIL $*" >&2
    fail=1
  fi
}

echo "KitchenOS paid pilot — code readiness bundle"
echo "Repository: $ROOT"
echo "Date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

prisma() { "$NODE" ./node_modules/prisma/build/index.js "$@"; }
run "Prisma generate" prisma generate
run "Prisma validate" prisma validate

step "$NPM" run typecheck
step "$NPM" run validate:tenant-scope-pilot
step "$NPM" run validate:dashboard-owner-scope
step "$NPM" run preflight:staging-pilot
step "$NPM" run verify-claims
step tsx scripts/validate-production-crons.ts
step "$NPM" run validate:cron-inventory
step "$NPM" run check-demo-scenarios
step "$NPM" test

if [[ -n "${SKIP_BUILD:-}" ]]; then
  echo ""
  echo "SKIP_BUILD set — skipping next build"
else
  run "Production build" env \
    NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://example.supabase.co}" \
    NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder}" \
    DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/kitchenos_ci}" \
    DIRECT_URL="${DIRECT_URL:-postgresql://postgres:postgres@localhost:5432/kitchenos_ci}" \
    "$NPM" run build
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo ""
  echo "== DATABASE_URL set — running DB-backed checks =="
  step "$NPM" run workspace:preflight
  step "$NPM" run workspace:backfill:status
  step "$NPM" run verify:staff-scope
  step "$NPM" run verify:staff-parity
else
  echo ""
  echo "DATABASE_URL unset — skipping preflight, backfill status, staff scope (staging only)."
fi

if [[ -n "${RUN_STAGING_ENV:-}" ]] && [[ -n "${DATABASE_URL:-}" ]]; then
  step "$NPM" run verify:staging-env
  step "$NPM" run verify:staging-webhook-async
fi

echo ""
if [[ "$fail" -ne 0 ]]; then
  echo "Paid pilot code readiness: FAILED"
  exit 1
fi

echo "Paid pilot code readiness: PASSED"
echo "Next (staging): docs/WORKSPACE_MIGRATION_RUNBOOK_STAGING.md + docs/PILOT_GOLDEN_PATH_CHECKLIST.md"
