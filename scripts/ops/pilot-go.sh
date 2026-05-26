#!/usr/bin/env bash
# KitchenOS Pilot — Go/No-Go gate (live staging required).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"

STAGING_URL="${STAGING_URL:-}"
if [[ -z "$STAGING_URL" && -f .staging-deploy-url ]]; then
  # shellcheck disable=SC1091
  source .staging-deploy-url
  STAGING_URL="${STAGING_URL:-}"
fi

echo "========================================="
echo "  KitchenOS Pilot — Go/No-Go Check"
echo "========================================="
echo ""

if [[ -z "$STAGING_URL" ]]; then
  echo "FAIL STAGING_URL not set."
  echo "  echo 'STAGING_URL=https://YOUR-PREVIEW.vercel.app' > .staging-deploy-url"
  echo "  Or: export STAGING_URL=https://..."
  echo "See: docs/OPS_VERCEL_REDEPLOY.md"
  exit 1
fi

export STAGING_URL="${STAGING_URL%/}"
echo "Staging: $STAGING_URL"
echo ""

PASS=0
FAIL=0

run_step() {
  local desc="$1"
  shift
  echo "▶ $desc"
  if "$@"; then
    echo "  ✅ PASS"
    PASS=$((PASS + 1))
  else
    echo "  ❌ FAIL"
    FAIL=$((FAIL + 1))
  fi
  echo ""
}

run_step "HTTP verification (verify-staging.sh)" bash scripts/ops/verify-staging.sh

run_step "E2E HTTP smoke (pilot-golden-path-http)" env PLAYWRIGHT_BASE_URL="$STAGING_URL" npm run test:e2e:pilot:http

echo "========================================="
echo "  Results: $PASS passed, $FAIL failed"
echo "========================================="
echo ""

if [[ "$FAIL" -gt 0 ]]; then
  echo "NO-GO: Fix failed checks before inviting paid operators."
  echo "Runbook: docs/PILOT_STAGING_RUNBOOK.md"
  echo "Known issues: docs/PILOT_KNOWN_ISSUES.md"
  exit 1
fi

echo "GO: Staging HTTP + E2E smoke passed."
echo ""
echo "Next steps:"
echo "  1. npm run test:e2e:pilot  (set E2E_PILOT_EMAIL / E2E_PILOT_PASSWORD)"
echo "  2. Manual golden path — docs/PILOT_GOLDEN_PATH_CHECKLIST.md"
echo "  3. docs/PILOT_FINAL_CHECKLIST.md — CEO + Sales sign-off"
echo "  4. Production deploy per docs/PILOT_LAUNCH_PLAN_18MAY.md"
