#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "========================================="
echo " KitchenOS — Pilot Readiness Check"
echo " $(date)"
echo "========================================="
echo ""

PASS=0
FAIL=0
WARN=0

check() {
  local name="$1"
  local status="$2"
  if [ "$status" = "PASS" ]; then
    echo "✅ $name"
    PASS=$((PASS + 1))
  elif [ "$status" = "WARN" ]; then
    echo "⚠️  $name"
    WARN=$((WARN + 1))
  else
    echo "❌ $name"
    FAIL=$((FAIL + 1))
  fi
}

HEALTH=$(curl -s https://os-kitchen.com/api/health 2>/dev/null || echo "{}")

if echo "$HEALTH" | grep -q '"status":"ok"'; then
  check "Production health" "PASS"
else
  check "Production health" "FAIL"
fi

if echo "$HEALTH" | grep -q '"supabase":{"ok":true'; then
  check "Supabase connectivity" "PASS"
else
  check "Supabase connectivity" "WARN"
fi

if echo "$HEALTH" | grep -q '"database":{"ok":true'; then
  check "Database connectivity" "PASS"
else
  check "Database connectivity" "FAIL"
fi

ADAPTER=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('checks',{}).get('rateLimitAdapter',{}).get('adapter','unknown'))" 2>/dev/null || echo "unknown")
if [ "$ADAPTER" = "upstash" ]; then
  check "Rate limit ($ADAPTER)" "PASS"
elif [ "$ADAPTER" = "memory" ]; then
  check "Rate limit ($ADAPTER) — add UPSTASH_REDIS_REST_TOKEN" "WARN"
else
  check "Rate limit ($ADAPTER)" "WARN"
fi

CSP=$(curl -sI https://os-kitchen.com 2>/dev/null | grep -i "content-security-policy" || echo "")
if [ -n "$CSP" ]; then
  check "CSP header" "PASS"
else
  check "CSP header" "FAIL"
fi

REDIRECT=$(curl -sI "https://os-kitchen.com/auth/callback?next=https://evil.com" 2>/dev/null | grep -i "^location" | head -1)
if echo "$REDIRECT" | grep -q "evil.com"; then
  check "Open redirect protection" "FAIL"
else
  check "Open redirect protection" "PASS"
fi

LOGIN_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://os-kitchen.com/login 2>/dev/null)
[ "$LOGIN_HTTP" = "200" ] && check "Login page" "PASS" || check "Login page (HTTP $LOGIN_HTTP)" "FAIL"

SIGNUP_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://os-kitchen.com/signup 2>/dev/null)
[ "$SIGNUP_HTTP" = "200" ] && check "Signup page" "PASS" || check "Signup page (HTTP $SIGNUP_HTTP)" "FAIL"

SITEMAP_COUNT=$(curl -s https://os-kitchen.com/sitemap.xml 2>/dev/null | grep -c "<url>" || echo "0")
if [ "$SITEMAP_COUNT" -ge 19 ]; then
  check "Sitemap ($SITEMAP_COUNT URLs)" "PASS"
else
  check "Sitemap ($SITEMAP_COUNT URLs)" "WARN"
fi

echo ""
echo "▶ Running E2E HTTP smoke..."
export PLAYWRIGHT_BASE_URL="https://os-kitchen.com"
if node ./node_modules/@playwright/test/cli.js test tests/e2e/pilot-golden-path-http.spec.ts --project=ci-critical-paths 2>&1 | tail -3 | grep -q "passed"; then
  check "E2E HTTP smoke" "PASS"
else
  check "E2E HTTP smoke" "WARN"
fi

echo ""
echo "▶ Checking Vercel environment..."
VERCEL_ENV=$(vercel env ls production 2>/dev/null || echo "")
for var in STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY NEXT_PUBLIC_APP_URL CRON_SECRET; do
  if echo "$VERCEL_ENV" | grep -q "$var"; then
    check "Vercel: $var" "PASS"
  else
    check "Vercel: $var missing" "FAIL"
  fi
done

for var in UPSTASH_REDIS_REST_TOKEN RESEND_API_KEY; do
  if echo "$VERCEL_ENV" | grep -q "$var"; then
    check "Vercel: $var" "PASS"
  else
    check "Vercel: $var missing (optional for pilot)" "WARN"
  fi
done

echo ""
echo "========================================="
echo " RESULTS: $PASS passed, $WARN warnings, $FAIL failed"
echo "========================================="

if [ "$FAIL" -eq 0 ] && [ "$WARN" -eq 0 ]; then
  echo ""
  echo "✅ ALL CHECKS PASSED — Ready for operators!"
elif [ "$FAIL" -eq 0 ]; then
  echo ""
  echo "⚠️  Ready with warnings — complete manual OPS actions"
  echo "    See: docs/PILOT_LAUNCH_FINAL_19MAY.md"
else
  echo ""
  echo "❌ Issues found — fix before inviting operators"
fi

exit $([ "$FAIL" -eq 0 ] && echo 0 || echo 1)
