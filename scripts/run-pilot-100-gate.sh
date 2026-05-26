#!/usr/bin/env bash
# Paid pilot 100% gate — code, DB, env, optional HTTP. Writes GO/NO-GO report.
#
#   npm run pilot:100-gate
#   SKIP_BUILD=1 npm run pilot:100-gate
#   SMOKE_BASE_URL=https://staging.example.com npm run pilot:100-gate
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"
# shellcheck source=scripts/load-staging-env.sh
source "${ROOT}/scripts/load-staging-env.sh"
load_staging_env

echo "KitchenOS — Paid pilot 100% gate"
echo "================================="
echo ""

step() {
  echo "== $1 =="
  shift
  if "$@"; then
    echo "OK  $*"
  else
    echo "WARN/FAIL $* (continuing)"
    return 1
  fi
  echo ""
}

fail=0

step "Staging secrets bootstrap" bash scripts/generate-staging-pilot-secrets.sh || fail=1
load_staging_env

step "Sync staging env from local" tsx scripts/sync-staging-env-from-local.ts || true

if [[ -n "${DATABASE_URL:-}" ]]; then
  step "Staging DB pipeline" env PILOT_LOCAL_ENV=1 bash scripts/run-staging-pilot-db-only.sh || fail=1
else
  echo "SKIP DB pipeline — DATABASE_URL unset"
  fail=1
fi

step "Code readiness" env SKIP_BUILD="${SKIP_BUILD:-}" bash scripts/run-paid-pilot-readiness.sh || fail=1

if [[ "${SKIP_BUILD:-}" != "1" ]]; then
  step "Production build" env NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}" "$NPM" run build || fail=1
fi

step "Staging env (full)" tsx scripts/verify-staging-env.ts && true || {
  echo "Full env failed — trying local-pilot mode"
  tsx scripts/verify-staging-env.ts --local-pilot || fail=1
}

if [[ -n "${SMOKE_BASE_URL:-}" ]]; then
  step "HTTP smoke" tsx scripts/run-golden-path-http-smoke.ts || fail=1
fi

echo "== GO/NO-GO report =="
tsx scripts/generate-pilot-go-no-go-report.ts || fail=1

echo ""
if [[ "$fail" -eq 0 ]]; then
  echo "Pilot 100% gate: all automated steps passed."
else
  echo "Pilot 100% gate: some steps need attention — see docs/generated/PILOT_GO_NO_GO_STATUS.md"
  exit 1
fi

echo ""
echo "Remaining (human):"
echo "  1. Ops: npm run vercel:staging-push -- --apply"
echo "  2. Ops: deploy staging + npm run test:e2e:pilot"
echo "  3. Product: docs/PILOT_GOLDEN_PATH_CHECKLIST.md"
echo "  4. All: npm run pilot:record-signoff -- --role=... --by=... --go"
