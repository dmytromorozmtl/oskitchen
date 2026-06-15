#!/usr/bin/env bash
# 48-hour plan — run all automatable steps (stops on deploy blocker).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront 48h — automated run                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

BLOCKED=0

run() {
  echo "▶ $1"
  shift
  if "$@"; then
    echo "   ✓ OK"
  else
    echo "   ✗ FAILED (see above)"
    BLOCKED=1
  fi
  echo ""
}

run "Preflight" npm run storefront:release-preflight
run "Vercel manifest" npm run storefront:vercel-manifest
run "Deploy diagnosis" npm run storefront:diagnose-deploy || true

if [[ "${BLOCKED}" -eq 0 ]] || [[ "${STOREFRONT_48H_FORCE:-}" == "1" ]]; then
  run "Redirect seed" npm run storefront:seed-week1-redirects
  run "Week 2 media" npm run storefront:week2-complete
fi

if npm run storefront:diagnose-deploy 2>/dev/null | grep -q "200 — Storefront responds"; then
  echo "▶ Production post-deploy smoke"
  export STOREFRONT_SMOKE_ENV=production
  export STOREFRONT_SMOKE_SLUG="${STOREFRONT_SMOKE_SLUG:-hello}"
  if npm run storefront:post-deploy; then
    echo "   ✓ post-deploy PASS"
  else
    BLOCKED=1
  fi
  echo ""
  if [[ -f .env.storefront.staging.local ]]; then
    run "Staging QA artifact" npm run storefront:staging-qa || true
  fi
else
  echo "▶ Skipping HTTP smoke (no live deploy — run storefront:bind-deploy-url first)"
  echo ""
  BLOCKED=1
fi

npm run storefront:48h-status || true
npm run storefront:release-status || true
npm run storefront:week1-artifacts || true
npm run storefront:week2-artifacts || true

echo "Dashboard: docs/artifacts/STOREFRONT_48H_STATUS.md"
echo "Runbook:   docs/runbooks/STOREFRONT_48H_EXECUTION.md"

if [[ "${BLOCKED}" -ne 0 ]]; then
  echo ""
  echo "48h run: BLOCKED on deploy/smoke — complete Phase 0 in runbook (bind-deploy-url + Vercel)."
  exit 1
fi
echo ""
echo "48h automated run: PASS — complete manual checklists in STOREFRONT_48H_STATUS.md"
