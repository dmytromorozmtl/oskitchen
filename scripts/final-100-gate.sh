#!/usr/bin/env bash
# Final production truth gate for KitchenOS 100/100 readiness.
# Runs only lightweight hosted checks + env presence checks; does not mutate data.
#
# Usage:
#   npm run final:100
#   SMOKE_PREFLIGHT_EMAIL=owner@pilot.com npm run final:100
#   VISUAL_SIGNOFF_DONE=1 MONITORING_WINDOW_DONE=1 SMOKE_PREFLIGHT_EMAIL=owner@pilot.com npm run final:100
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BASE_URL="${FINAL_GATE_URL:-https://os-kitchen.com}"
BLOCKERS=0

pass() { echo "✅ $1"; }
warn() { echo "⚠️  $1"; }
fail() { echo "❌ $1"; BLOCKERS=$((BLOCKERS + 1)); }

echo "=== KitchenOS final 100 gate ==="
echo "Target: ${BASE_URL}"
echo ""

if [[ -f .env.e2e.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.e2e.local
  set +a
fi

echo "→ Health snapshot"
if HEALTH_SUMMARY="$(node ./node_modules/tsx/dist/cli.mjs scripts/verify-health-endpoint.ts "${BASE_URL%/}/api/health" 2>&1)"; then
  echo "$HEALTH_SUMMARY"
  pass "Health endpoint reachable"
else
  echo "$HEALTH_SUMMARY"
  fail "Health endpoint not OK"
fi
echo ""

echo "→ Vercel production env presence"
if command -v ./node_modules/.bin/vercel >/dev/null 2>&1; then
  ENV_LS="$(./node_modules/.bin/vercel env ls production)"
  if printf '%s\n' "$ENV_LS" | grep -Eq '^[[:space:]]*SENTRY_DSN[[:space:]]'; then
    pass "SENTRY_DSN present in Vercel Production"
  else
    fail "Missing SENTRY_DSN in Vercel Production"
  fi
  if printf '%s\n' "$ENV_LS" | grep -Eq '^[[:space:]]*SENTRY_TRACES_SAMPLE_RATE[[:space:]]'; then
    pass "SENTRY_TRACES_SAMPLE_RATE present in Vercel Production"
  else
    warn "SENTRY_TRACES_SAMPLE_RATE missing in Vercel Production"
  fi
else
  warn "Vercel CLI not found; skip production env check"
fi
echo ""

echo "→ Hosted tenant smoke"
if npm run smoke:production-tenant; then
  pass "Default production tenant smoke"
else
  fail "Default production tenant smoke failed"
fi
echo ""

echo "→ Strict pilot readiness"
if [[ -n "${SMOKE_PREFLIGHT_EMAIL:-}" ]]; then
  if npm run smoke:production-tenant:strict; then
    pass "Strict pilot readiness smoke"
  else
    fail "Strict pilot readiness smoke failed for ${SMOKE_PREFLIGHT_EMAIL}"
  fi
else
  fail "Strict pilot readiness target missing (set SMOKE_PREFLIGHT_EMAIL)"
fi
echo ""

echo "→ Manual completion flags"
if [[ "${VISUAL_SIGNOFF_DONE:-0}" == "1" ]]; then
  pass "Visual sign-off acknowledged"
else
  fail "Visual sign-off not acknowledged (set VISUAL_SIGNOFF_DONE=1 after manual pass)"
fi

if [[ "${MONITORING_WINDOW_DONE:-0}" == "1" ]]; then
  pass "Monitoring window acknowledged"
else
  fail "24–48h monitoring window not acknowledged (set MONITORING_WINDOW_DONE=1 when complete)"
fi
echo ""

echo "=== Summary ==="
if [[ "$BLOCKERS" -eq 0 ]]; then
  echo "✅ Final 100 gate passed."
  exit 0
fi

echo "❌ Final 100 gate blocked by ${BLOCKERS} item(s)."
echo "Next: fix listed blockers, then re-run \`npm run final:100\`."
exit 1
