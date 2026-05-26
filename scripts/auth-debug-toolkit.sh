#!/bin/bash
set -euo pipefail

echo "========================================="
echo " KitchenOS — Auth Debug Toolkit"
echo " $(date)"
echo "========================================="
echo ""

cd /Users/dmytro/Desktop/2026/KitchenOS

# ──────────────────────────────────────────────
# 1. ПРОВЕРКА SUPABASE — ЖИВ ЛИ ПРОЕКТ
# ──────────────────────────────────────────────
echo "━━━ 1. SUPABASE — HEALTH CHECK ━━━"
echo ""

SUPABASE_URL="https://eycxwxxyrzdhhqcnxifz.supabase.co"
# Prefer sb_publishable (current Supabase format); legacy JWT anon key returns 401.
if [ -f .env.local ]; then
  # shellcheck disable=SC1091
  set -a && source .env.local && set +a
fi
ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-sb_publishable_dD4M3pNzWjB-8Ae4-ZIKKw_U8MXvFm4}"
LEGACY_JWT_ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3h3eHh5cnpkaGhxY254aWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NzgzNTksImV4cCI6MjA2MjU1NDM1OX0.xUvR-jqdyfuQWchXJJBnA5BTEGQjmMmMkuUsNl-Qc7g"
if [[ "$ANON_KEY" == eyJhbGci* ]]; then
  echo "⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY is legacy JWT — switching to sb_publishable from .env.local"
  ANON_KEY="sb_publishable_dD4M3pNzWjB-8Ae4-ZIKKw_U8MXvFm4"
fi
echo "▶ Using anon key prefix: ${ANON_KEY:0:20}..."
echo ""

# Health check
echo "▶ Supabase health endpoint..."
HEALTH=$(curl -s -o /tmp/sb-health.json -w "%{http_code}" "$SUPABASE_URL/auth/v1/health" \
  -H "apikey: $ANON_KEY" 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
  echo "  ✅ Supabase is alive (HTTP 200)"
  cat /tmp/sb-health.json 2>/dev/null | python3 -m json.tool 2>/dev/null || cat /tmp/sb-health.json
else
  echo "  ❌ Supabase returned HTTP $HEALTH"
  echo "  Possible: project is PAUSED in Supabase Dashboard"
  echo "  Check: https://supabase.com/dashboard/project/eycxwxxyrzdhhqcnxifz"
fi

# Проверка анон-ключа
echo ""
echo "▶ Testing anonymous key..."
KEY_TEST=$(curl -s -o /tmp/sb-key.json -w "%{http_code}" \
  -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-nonexistent@example.com","password":"wrongpassword"}' 2>/dev/null || echo "000")

if [ "$KEY_TEST" = "400" ]; then
  echo "  ✅ Anonymous key works (HTTP 400 = invalid credentials, expected)"
elif [ "$KEY_TEST" = "200" ]; then
  echo "  ⚠️  HTTP 200 — unexpected for nonexistent user"
else
  echo "  ❌ HTTP $KEY_TEST — anonymous key may be invalid"
  cat /tmp/sb-key.json 2>/dev/null | head -5
fi

# ──────────────────────────────────────────────
# 2. ПРОВЕРКА SUPABASE — SITE URL
# ──────────────────────────────────────────────
echo ""
echo "━━━ 2. SUPABASE — SITE URL CONFIG ━━━"
echo ""

# Через API
SITE_URL=$(curl -sf "$SUPABASE_URL/auth/v1/settings" \
  -H "apikey: $ANON_KEY" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('site_url','NOT_RETURNED'))" 2>/dev/null || echo "CANNOT_FETCH")

echo "▶ Site URL from API: $SITE_URL"

if [ "$SITE_URL" = "https://os-kitchen.com" ]; then
  echo "  ✅ Site URL is correct"
elif [ "$SITE_URL" = "http://localhost:3000" ]; then
  echo "  ❌ Site URL is STILL localhost:3000"
  echo "  FIX: https://supabase.com/dashboard/project/eycxwxxyrzdhhqcnxifz/auth/url-configuration"
  echo "  Change Site URL to: https://os-kitchen.com"
elif [ "$SITE_URL" = "NOT_RETURNED" ] || [ "$SITE_URL" = "CANNOT_FETCH" ]; then
  echo "  ⚠️  Site URL not exposed via /auth/v1/settings (Supabase API change)"
  echo "  Verify manually: https://supabase.com/dashboard/project/eycxwxxyrzdhhqcnxifz/auth/url-configuration"
  SITE_URL="CANNOT_FETCH"
else
  echo "  ⚠️  Site URL is: $SITE_URL"
fi

# Проверка redirect URLs
echo ""
echo "▶ Redirect URLs..."
REDIRECT_URLS=$(curl -sf "$SUPABASE_URL/auth/v1/settings" \
  -H "apikey: $ANON_KEY" 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
urls=d.get('additional_redirect_urls','')
print(urls[:500] if urls else 'EMPTY_OR_NOT_RETURNED')
" 2>/dev/null || echo "CANNOT_FETCH")

if echo "$REDIRECT_URLS" | grep -q "os-kitchen.com"; then
  echo "  ✅ Redirect URLs include os-kitchen.com"
else
  echo "  ❌ Redirect URLs missing os-kitchen.com"
  echo "  Current: $REDIRECT_URLS"
  echo "  FIX: Add https://os-kitchen.com/** to Redirect URLs"
fi

# ──────────────────────────────────────────────
# 3. ПРОВЕРКА VERCEL — ENV VARS
# ──────────────────────────────────────────────
echo ""
echo "━━━ 3. VERCEL — ENVIRONMENT VARIABLES ━━━"
echo ""

echo "▶ Checking critical env vars in Vercel production..."

check_var() {
  local var="$1"
  local desc="$2"
  local val
  
  line=$(vercel env ls production 2>/dev/null | grep "^[[:space:]]*$var" | head -1 || true)
  val=$(echo "$line" | awk '{print $(NF-1)}' || echo "NOT_FOUND")
  
  if echo "$line" | grep -qE 'Encrypted|sensitive'; then
    echo "  ✅ $var ($desc) — present (encrypted)"
  elif [ "$val" = "NOT_FOUND" ]; then
    echo "  ❌ $var ($desc) — MISSING in Vercel"
  elif [ -z "$val" ] || [ "$val" = '""' ] || [ "$val" = "''" ]; then
    echo "  ❌ $var ($desc) — EMPTY in Vercel"
  else
    echo "  ✅ $var ($desc) — set (${#val} chars)"
  fi
}

check_var "NEXT_PUBLIC_APP_URL" "Site URL"
check_var "NEXT_PUBLIC_SUPABASE_URL" "Supabase URL"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase Anon Key"
check_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase Service Key"
check_var "STRIPE_SECRET_KEY" "Stripe Secret"
check_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "Stripe Publishable"
check_var "NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID" "Starter Price ID"
check_var "NEXT_PUBLIC_STRIPE_PRO_PRICE_ID" "Pro Price ID"
check_var "NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID" "Team Price ID"
check_var "CRON_SECRET" "Cron Secret"

# ──────────────────────────────────────────────
# 4. ПРОВЕРКА PRODUCTION — HEALTH
# ──────────────────────────────────────────────
echo ""
echo "━━━ 4. PRODUCTION — os-kitchen.com ━━━"
echo ""

echo "▶ Health endpoint..."
HEALTH_PROD=$(curl -s https://os-kitchen.com/api/health 2>/dev/null)
if echo "$HEALTH_PROD" | grep -q '"status":"ok"'; then
  echo "  ✅ Health: ok"
  echo "$HEALTH_PROD" | python3 -m json.tool 2>/dev/null | head -15
else
  echo "  ❌ Health check failed"
  echo "$HEALTH_PROD" | head -5
fi

echo ""
echo "▶ Login page..."
LOGIN_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://os-kitchen.com/login 2>/dev/null || echo "000")
if [ "$LOGIN_HTTP" = "200" ]; then
  echo "  ✅ Login page accessible (HTTP 200)"
else
  echo "  ❌ Login page returned HTTP $LOGIN_HTTP"
fi

echo ""
echo "▶ Signup page..."
SIGNUP_HTTP=$(curl -s -o /dev/null -w "%{http_code}" https://os-kitchen.com/signup 2>/dev/null || echo "000")
if [ "$SIGNUP_HTTP" = "200" ]; then
  echo "  ✅ Signup page accessible (HTTP 200)"
else
  echo "  ❌ Signup page returned HTTP $SIGNUP_HTTP"
fi

# ──────────────────────────────────────────────
# 5. ПРОВЕРКА AUTH — ТЕСТОВЫЙ ЗАПРОС
# ──────────────────────────────────────────────
echo ""
echo "━━━ 5. AUTH — TEST SIGN-IN ATTEMPT ━━━"
echo ""

# Попытка входа с заведомо неправильными данными — должен вернуть 400, не 401/403
AUTH_TEST=$(curl -s -w "\n%{http_code}" -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-debug@kitchenos-test.com","password":"WrongPassword123!"}' 2>/dev/null)

AUTH_BODY=$(echo "$AUTH_TEST" | sed '$d')
AUTH_CODE=$(echo "$AUTH_TEST" | tail -1)

echo "▶ Test sign-in (wrong password)..."
if [ "$AUTH_CODE" = "400" ]; then
  echo "  ✅ Auth API works (HTTP 400 = Invalid login, expected)"
elif [ "$AUTH_CODE" = "429" ]; then
  echo "  ⚠️  HTTP 429 — Rate limited. Wait 60 seconds and try again."
else
  echo "  ❌ HTTP $AUTH_CODE — unexpected"
  echo "$AUTH_BODY" | head -5
fi

# ──────────────────────────────────────────────
# 6. ПРОВЕРКА STRIPE — CHECKOUT API
# ──────────────────────────────────────────────
echo ""
echo "━━━ 6. STRIPE — CHECKOUT API ━━━"
echo ""

CHECKOUT_TEST=$(curl -s -w "\n%{http_code}" -X POST https://os-kitchen.com/api/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"PRO"}' 2>/dev/null)

CHECKOUT_BODY=$(echo "$CHECKOUT_TEST" | sed '$d')
CHECKOUT_CODE=$(echo "$CHECKOUT_TEST" | tail -1)

echo "▶ Checkout API..."
if echo "$CHECKOUT_BODY" | grep -q "stripe_not_configured"; then
  echo "  ❌ Still stripe_not_configured — old code active"
elif [ "$CHECKOUT_CODE" = "401" ] || [ "$CHECKOUT_CODE" = "403" ]; then
  echo "  ✅ Auth required (HTTP $CHECKOUT_CODE) — Stripe IS configured"
elif [ "$CHECKOUT_CODE" = "303" ] || [ "$CHECKOUT_CODE" = "302" ]; then
  echo "  ✅ Checkout works — redirects to Stripe"
else
  echo "  ⚠️  HTTP $CHECKOUT_CODE"
  echo "  $CHECKOUT_BODY" | head -3
fi

# ──────────────────────────────────────────────
# 7. ИТОГОВАЯ СВОДКА
# ──────────────────────────────────────────────
echo ""
echo "========================================="
echo " DIAGNOSTIC SUMMARY"
echo "========================================="
echo ""

PASS=0
FAIL=0
WARN=0

check_result() {
  local desc="$1"
  local status="$2"
  if [ "$status" = "PASS" ]; then
    echo "  ✅ $desc"
    PASS=$((PASS + 1))
  elif [ "$status" = "WARN" ]; then
    echo "  ⚠️  $desc"
    WARN=$((PASS + 1))
  else
    echo "  ❌ $desc"
    FAIL=$((FAIL + 1))
  fi
}

# Legacy JWT key check
LEGACY_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $LEGACY_JWT_ANON" -H "Content-Type: application/json" \
  -d '{"email":"x@example.com","password":"wrong"}' 2>/dev/null || echo "000")
if [ "$LEGACY_CODE" = "401" ]; then
  echo "  ⚠️  Legacy JWT anon key in script/docs is INVALID (HTTP 401) — use sb_publishable_* in Vercel + prebuilt build"
fi

# Supabase
if [ "$HEALTH" = "200" ]; then check_result "Supabase alive" "PASS"; else check_result "Supabase alive — CHECK DASHBOARD" "FAIL"; fi
if [ "$SITE_URL" = "https://os-kitchen.com" ]; then check_result "Supabase Site URL" "PASS"; elif [ "$SITE_URL" = "CANNOT_FETCH" ]; then check_result "Supabase Site URL — CANNOT CHECK" "WARN"; else check_result "Supabase Site URL is '$SITE_URL' — NEEDS FIX" "FAIL"; fi

# Vercel
if vercel env ls production 2>/dev/null | grep -q "NEXT_PUBLIC_APP_URL"; then check_result "NEXT_PUBLIC_APP_URL in Vercel" "PASS"; else check_result "NEXT_PUBLIC_APP_URL" "FAIL"; fi

# Production
if echo "$HEALTH_PROD" | grep -q '"status":"ok"'; then check_result "Production health" "PASS"; else check_result "Production health" "FAIL"; fi
if [ "$LOGIN_HTTP" = "200" ]; then check_result "Login page" "PASS"; else check_result "Login page" "FAIL"; fi

# Auth
if [ "$AUTH_CODE" = "400" ]; then check_result "Auth API" "PASS"; elif [ "$AUTH_CODE" = "429" ]; then check_result "Auth API — rate limited" "WARN"; else check_result "Auth API" "FAIL"; fi

# Stripe
if echo "$CHECKOUT_BODY" | grep -q "stripe_not_configured"; then check_result "Stripe checkout — OLD CODE" "FAIL"
elif [ "$CHECKOUT_CODE" = "401" ] || [ "$CHECKOUT_CODE" = "303" ]; then check_result "Stripe checkout" "PASS"; else check_result "Stripe checkout" "WARN"; fi

echo ""
echo "Results: $PASS passed, $WARN warnings, $FAIL failed"
echo ""

if [ "$SITE_URL" != "https://os-kitchen.com" ] && [ "$SITE_URL" != "CANNOT_FETCH" ]; then
  echo "🔴 ROOT CAUSE: Supabase Site URL is '$SITE_URL'"
  echo "   FIX: https://supabase.com/dashboard/project/eycxwxxyrzdhhqcnxifz/auth/url-configuration"
  echo "   Change Site URL → https://os-kitchen.com"
  echo "   Add Redirect URLs → https://os-kitchen.com/**"
  echo ""
elif [ "$SITE_URL" = "CANNOT_FETCH" ]; then
  echo "🔴 ROOT CAUSE: Cannot verify Supabase settings"
  echo "   Possible: project PAUSED in dashboard"
  echo "   Check: https://supabase.com/dashboard/project/eycxwxxyrzdhhqcnxifz"
  echo ""
fi

if [ "$FAIL" -eq 0 ]; then
  echo "✅ All critical checks passed."
  echo "   If login still fails — try:"
  echo "   1. Clear browser cookies for os-kitchen.com"
  echo "   2. Use incognito window"
  echo "   3. Try a NEW email (not previously registered)"
  echo "   4. Check browser Console (F12) for errors"
fi

echo ""
echo "========================================="
echo " Done."
echo "========================================="
