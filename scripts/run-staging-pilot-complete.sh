#!/usr/bin/env bash
# Full staging / paid-pilot ops gate: env → DB migrate → backfill → verify → report.
#
# Usage:
#   cp .env.staging.example .env.staging.local   # fill secrets
#   export $(grep -v '^#' .env.staging.local | xargs)   # or use .env.local
#   npm run staging:pilot:complete
#
# Dry-run backfill only:
#   npm run staging:pilot:complete -- --dry-run
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"

# shellcheck source=scripts/load-staging-env.sh
source "${ROOT}/scripts/load-staging-env.sh"

load_env() {
  echo "Loading env: .env → .env.local → .env.staging.local"
  load_staging_env
}

load_env

if [[ "${AUTO_BOOTSTRAP_STAGING_SECRETS:-}" == "1" ]]; then
  bash "${ROOT}/scripts/generate-staging-pilot-secrets.sh"
  load_env
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required. Set in .env.local or .env.staging.local" >&2
  exit 1
fi

REPORT="${ROOT}/docs/generated/STAGING_PILOT_RUN_REPORT.md"
mkdir -p "${ROOT}/docs/generated"

exec_report() {
  echo "$1" | tee -a "$REPORT"
}

: >"$REPORT"
exec_report "# Staging pilot run report"
exec_report ""
exec_report "Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
exec_report ""

run_step() {
  echo ""
  echo "== $1 =="
  echo "## $1" >>"$REPORT"
  echo '```' >>"$REPORT"
  local log
  log="$(mktemp "${TMPDIR:-/tmp}/kos-pilot.XXXXXX")"
  set +e
  "$2" 2>&1 | tee "$log"
  local ec=${PIPESTATUS[0]}
  set -e
  sed 's/^/    /' "$log" >>"$REPORT"
  echo '```' >>"$REPORT"
  echo "" >>"$REPORT"
  rm -f "$log"
  if [[ "$ec" -eq 0 ]]; then
    echo "OK  $1"
  else
    echo "FAIL $1 (exit $ec)" >&2
    exit 1
  fi
}

DRY=()
[[ "${1:-}" == "--dry-run" ]] && DRY=(--dry-run)

step_verify_staging_env_local() { tsx scripts/verify-staging-env.ts --local-pilot; }
step_verify_staging_env() { tsx scripts/verify-staging-env.ts; }
step_workspace_preflight() { tsx scripts/workspace-migration-preflight.ts; }
step_provision_orphans_dry() { tsx scripts/provision-orphan-workspaces.ts --dry-run; }
step_webhook_async() { tsx scripts/verify-staging-webhook-readiness.ts; }
step_backfill_status() { tsx scripts/check-backfill-status.ts; }
step_golden_http() { tsx scripts/run-golden-path-http-smoke.ts; }
step_code_readiness() { SKIP_BUILD=1 "$NPM" run verify:pilot-readiness; }
step_workspace_migration() { bash scripts/run-staging-workspace-migration.sh; }
step_backfill_dry() { bash scripts/run-workspace-backfill-all.sh --dry-run; }

if [[ "${SKIP_PILOT_CODE_READINESS:-}" == "1" ]]; then
  exec_report "## Code readiness"
  exec_report ""
  exec_report "Skipped (SKIP_PILOT_CODE_READINESS=1). Run \`npm run verify:pilot-readiness\` separately."
  exec_report ""
else
  run_step "Code readiness (no build)" step_code_readiness
fi

if [[ ${#DRY[@]} -gt 0 ]]; then
  run_step "Workspace preflight" step_workspace_preflight
  run_step "Provision orphan workspaces (dry-run)" step_provision_orphans_dry
  run_step "Backfill dry-run" step_backfill_dry
else
  if [[ "${PILOT_LOCAL_ENV:-}" == "1" ]] || [[ "${VERIFY_STAGING_LOCAL_PILOT:-}" == "1" ]]; then
    run_step "Staging env gate (local pilot)" step_verify_staging_env_local
  else
    run_step "Staging env gate" step_verify_staging_env
  fi
  run_step "Workspace migration" step_workspace_migration
  run_step "Webhook tables" step_webhook_async
  run_step "Final backfill status" step_backfill_status
fi

if [[ -n "${SMOKE_BASE_URL:-}" ]]; then
  run_step "Golden path HTTP smoke" step_golden_http
elif [[ -n "${NEXT_PUBLIC_APP_URL:-}" ]] && [[ "${NEXT_PUBLIC_APP_URL}" != *"yourdomain.com"* ]] && [[ "${NEXT_PUBLIC_APP_URL}" != "http://localhost:3000" ]]; then
  run_step "Golden path HTTP smoke" step_golden_http
fi

exec_report "## Next steps"
exec_report ""
exec_report "1. \`npm run staging:secrets:generate\` + Upstash + \`npm run verify:staging-env\` (no --local-pilot on Vercel)"
exec_report "2. Manual golden path: [PILOT_GOLDEN_PATH_CHECKLIST.md](./PILOT_GOLDEN_PATH_CHECKLIST.md)"
exec_report "3. HTTP smoke: \`SMOKE_BASE_URL=https://staging... npm run smoke:golden-path-http\`"
exec_report "4. E2E: \`npm run test:e2e:pilot\` (requires E2E_* secrets)"
exec_report "5. Sign-off: [PAID_PILOT_GO_NO_GO_CHECKLIST.md](./PAID_PILOT_GO_NO_GO_CHECKLIST.md)"
exec_report ""

echo ""
echo "Staging pilot ops complete."
echo "Report: docs/generated/STAGING_PILOT_RUN_REPORT.md"
