#!/usr/bin/env bash
# Staging workspace migration: deploy schema + backfill + verify.
# Requires DATABASE_URL (and DIRECT_URL if used by Prisma).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"

prisma() { "$NODE" ./node_modules/prisma/build/index.js "$@"; }

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi

if [[ "${PILOT_LOCAL_ENV:-}" == "1" ]]; then
  unset NODE_ENV
  export PILOT_LOCAL_ENV=1
fi

if [[ "${NODE_ENV:-}" == "production" ]] && [[ "${ALLOW_PRODUCTION_MIGRATION:-}" != "1" ]] && [[ "${PILOT_LOCAL_ENV:-}" != "1" ]]; then
  echo "Refusing to run on NODE_ENV=production without ALLOW_PRODUCTION_MIGRATION=1" >&2
  echo "For local staging DB pilot: PILOT_LOCAL_ENV=1 npm run workspace:staging:migrate" >&2
  exit 1
fi

echo "KitchenOS staging workspace migration"
echo "DATABASE_URL host: $(node -e "try{const u=new URL(process.env.DATABASE_URL);console.log(u.hostname)}catch{console.log('(parse error)')}")"

run() {
  echo ""
  echo "== $1 =="
  shift
  "$@"
}

run "Preflight" tsx scripts/workspace-migration-preflight.ts
run "Provision orphan workspaces" tsx scripts/provision-orphan-workspaces.ts
run "Migrate deploy" prisma migrate deploy
run "Prisma validate" prisma validate

DRY=()
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY=(--dry-run)
  shift
fi

run "Backfill all phases" bash scripts/run-workspace-backfill-all.sh ${DRY[@]+"${DRY[@]}"}

if [[ ${#DRY[@]:-0} -eq 0 ]]; then
  run "Staff scope" tsx scripts/verify-staff-order-scope.ts
  run "Staff parity" tsx scripts/verify-staff-order-parity.ts ${STAGING_PILOT_OWNER_EMAIL:+--owner-email="${STAGING_PILOT_OWNER_EMAIL}"}
  if [[ "${SKIP_SECURITY_TESTS:-}" != "1" ]]; then
    run "Security tests" "$NPM" run test:security
  else
    echo "SKIP_SECURITY_TESTS=1 — run: npm run test:security"
  fi
fi

echo ""
echo "Staging workspace migration complete."
echo "Next: RUN_STAGING_ENV=1 npm run verify:pilot-readiness"
echo "       docs/PILOT_GOLDEN_PATH_CHECKLIST.md"
