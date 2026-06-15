#!/usr/bin/env bash
# HTTP verification for a live KitchenOS staging deployment.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

STAGING_URL="${STAGING_URL:-}"
if [[ -z "$STAGING_URL" && -f .staging-deploy-url ]]; then
  # shellcheck disable=SC1091
  source .staging-deploy-url
  STAGING_URL="${STAGING_URL:-}"
fi
if [[ -z "$STAGING_URL" ]]; then
  echo "ERROR: STAGING_URL not set. Export STAGING_URL or run deploy-staging.sh first." >&2
  exit 1
fi

STAGING_URL="${STAGING_URL%/}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
# shellcheck source=scripts/ensure-node-path.sh
source "${ROOT}/scripts/ensure-node-path.sh"
eval "$("$NODE" "${ROOT}/scripts/ops/export-staging-env.mjs")"
CRON_SECRET="${CRON_SECRET:-}"

PASS=0
FAIL=0
WARN=0

check() {
  local desc="$1"
  local method="$2"
  local path="$3"
  local expected="$4"
  shift 4
  local extra_args=("$@")

  local status
  if [[ "$method" == "GET" ]]; then
    if ((${#extra_args[@]} > 0)); then
      status="$(curl -sS -o /dev/null -w "%{http_code}" "${extra_args[@]}" "$STAGING_URL$path" 2>/dev/null || echo "000")"
    else
      status="$(curl -sS -o /dev/null -w "%{http_code}" "$STAGING_URL$path" 2>/dev/null || echo "000")"
    fi
  else
    if ((${#extra_args[@]} > 0)); then
      status="$(curl -sS -o /dev/null -w "%{http_code}" -X "$method" "${extra_args[@]}" "$STAGING_URL$path" 2>/dev/null || echo "000")"
    else
      status="$(curl -sS -o /dev/null -w "%{http_code}" -X "$method" "$STAGING_URL$path" 2>/dev/null || echo "000")"
    fi
  fi

  if [[ "$status" == "$expected" ]]; then
    echo "PASS $desc (HTTP $status)"
    PASS=$((PASS + 1))
  else
    echo "FAIL $desc (expected $expected, got $status)"
    FAIL=$((FAIL + 1))
  fi
}

check_health_ok() {
  local body status
  body="$(curl -sS "$STAGING_URL/api/health" 2>/dev/null || echo '{}')"
  status="$(curl -sS -o /dev/null -w "%{http_code}" "$STAGING_URL/api/health" 2>/dev/null || echo "000")"
  if [[ "$status" == "200" ]] && echo "$body" | grep -q '"status":"ok"'; then
    echo "PASS Health JSON status=ok (HTTP 200)"
    PASS=$((PASS + 1))
  elif [[ "$status" == "200" ]] || [[ "$status" == "503" ]]; then
    echo "WARN Health reachable but degraded (HTTP $status) — check DATABASE_URL on Vercel"
    WARN=$((WARN + 1))
  else
    echo "FAIL Health endpoint (HTTP $status)"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== KitchenOS Staging Verification ==="
echo "URL: $STAGING_URL"
echo ""

echo "=== Checking if staging is alive ==="
HEALTH_PROBE="$(curl -sS "$STAGING_URL/api/health" 2>/dev/null || true)"
HEALTH_CODE="$(curl -sS -o /dev/null -w "%{http_code}" "$STAGING_URL/api/health" 2>/dev/null || echo "000")"

if [[ "$HEALTH_CODE" == "404" ]] && echo "$HEALTH_PROBE" | grep -qi "DEPLOYMENT_NOT_FOUND"; then
  echo "FAIL Staging URL returned 404 DEPLOYMENT_NOT_FOUND"
  echo ""
  echo "The Vercel deployment may have expired or been deleted."
  echo "Follow: docs/OPS_VERCEL_REDEPLOY.md"
  echo "Then update STAGING_URL / NEXT_PUBLIC_APP_URL in .env.staging.local"
  exit 1
fi

if [[ "$HEALTH_CODE" == "000" ]]; then
  echo "FAIL Cannot connect to staging (DNS/network)"
  echo "Check STAGING_URL: $STAGING_URL"
  exit 1
fi

if [[ "$HEALTH_CODE" == "401" ]] && echo "$HEALTH_PROBE" | grep -qi "Authentication Required"; then
  echo "FAIL Staging is behind Vercel Deployment Protection (HTTP 401)"
  echo ""
  echo "Disable protection for pilot: Vercel → kitchen-os → Settings → Deployment Protection → Disabled"
  echo "Or configure automation bypass: https://vercel.com/docs/deployment-protection"
  exit 1
fi

if echo "$HEALTH_PROBE" | grep -qi "Deployment is building"; then
  echo "FAIL Vercel deployment still building (instant preview HTML, not KitchenOS)"
  echo "Wait for Ready in Vercel Dashboard, then re-run this script."
  exit 1
fi

if [[ "$HEALTH_CODE" == "200" ]] && ! echo "$HEALTH_PROBE" | grep -q '"status"'; then
  echo "FAIL Health returned HTTP 200 but not KitchenOS JSON (build incomplete or wrong route)"
  exit 1
fi

echo "PASS Staging is reachable (HTTP $HEALTH_CODE on /api/health)"
echo ""

check_health_ok
check "Login page" GET "/login" "200"
check "Signup page" GET "/signup" "200"
check "Cron without auth" GET "/api/cron/webhook-jobs" "401"
check "Cron wrong secret" GET "/api/cron/webhook-jobs" "401" -H "Authorization: Bearer wrong-secret"
check "Experimental cron blocked" GET "/api/cron/martian-orbital-dtn-relay-sync" "404"

if [[ -n "$CRON_SECRET" ]]; then
  check "Production cron with secret" GET "/api/cron/webhook-jobs" "200" -H "Authorization: Bearer $CRON_SECRET"
else
  echo "SKIP Production cron authed (CRON_SECRET unset locally)"
fi

# Storefront may 404 if slug missing — accept 200 or 404
STORE_STATUS="$(curl -sS -o /dev/null -w "%{http_code}" "$STAGING_URL/s/test-store/menu" 2>/dev/null || echo "000")"
if [[ "$STORE_STATUS" == "200" ]]; then
  echo "PASS Storefront menu test-store (HTTP 200)"
  PASS=$((PASS + 1))
elif [[ "$STORE_STATUS" == "404" ]]; then
  echo "WARN Storefront menu test-store (HTTP 404 — create slug or set E2E_TEST_STORE_SLUG)"
  WARN=$((WARN + 1))
else
  echo "FAIL Storefront menu (HTTP $STORE_STATUS)"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "=== Results ==="
echo "Passed: $PASS"
echo "Warnings: $WARN"
echo "Failed: $FAIL"

if [[ "$FAIL" -gt 0 ]]; then
  echo "STATUS: FAIL — fix before Go/No-Go"
  exit 1
fi

echo "STATUS: PASS — staging HTTP surface healthy (review warnings)"
exit 0
