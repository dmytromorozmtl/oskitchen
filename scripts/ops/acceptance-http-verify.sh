#!/bin/bash
# Final acceptance — Level 3 HTTP verification
set -uo pipefail

SITE="${SITE:-https://os-kitchen.com}"
PASS=0
FAIL=0

echo "========================================="
echo " LEVEL 3: HTTP VERIFICATION"
echo " SITE=$SITE"
echo "========================================="

HEALTH=$(curl -s "$SITE/api/health" 2>/dev/null || echo "{}")

echo ""
echo "▶ Health..."
echo "$HEALTH" | python3 -m json.tool 2>/dev/null | head -20

echo ""
echo "▶ Health sub-checks:"
for check in database supabase coreEnv rateLimitAdapter; do
  ok=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('checks',{}).get('$check',{}).get('ok',''))" 2>/dev/null || echo "")
  if [ "$ok" = "True" ]; then
    echo "  ✅ $check"
    PASS=$((PASS+1))
  else
    echo "  ⚠️  $check: $ok"
  fi
done

echo ""
echo "▶ Security headers..."
curl -sI "$SITE" | grep -iE "content-security-policy|x-content-type|x-frame|referrer-policy" | sed 's/^/  /'

echo ""
echo "▶ Open redirect tests..."
for evil in "https://evil.com" "//evil.com" "javascript:alert(1)"; do
  enc=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$evil', safe=''))")
  loc=$(curl -sI "$SITE/auth/callback?next=$enc" 2>/dev/null | grep -i "^location" | head -1)
  if echo "$loc" | grep -qiE "evil\.com|javascript:"; then
    echo "  ❌ VULNERABLE: $evil"
    FAIL=$((FAIL+1))
  else
    echo "  ✅ SAFE: $evil"
    PASS=$((PASS+1))
  fi
done

echo ""
echo "▶ Auth pages..."
for page in "/login" "/signup" "/login?next=/dashboard/billing"; do
  http=$(curl -s -o /dev/null -w "%{http_code}" "$SITE$page")
  has_redirect=$(curl -s "$SITE/login?next=/dashboard/billing" 2>/dev/null | grep -c 'name="redirect"[^>]*value="/dashboard/billing"' || echo 0)
  if [ "$page" = "/login?next=/dashboard/billing" ] && [ "$has_redirect" -ge 1 ]; then
    echo "  ✅ $page HTTP $http + redirect field preserved"
  elif [ "$http" = "200" ]; then
    echo "  ✅ $page HTTP $http"
  else
    echo "  ❌ $page HTTP $http"
    FAIL=$((FAIL+1))
  fi
  PASS=$((PASS+1))
done

echo ""
echo "▶ Marketing pages..."
MKT_PASS=0
MKT_FAIL=0
PAGES="/ /product /pricing /demo /resources /support /trust /partners /customers /contact-sales /solutions/meal-prep /solutions/catering /solutions/bakeries /legal/privacy /legal/terms /legal/security /legal/dpa /legal/cookie-policy /legal/acceptable-use"
for page in $PAGES; do
  http=$(curl -s -o /dev/null -w "%{http_code}" "$SITE$page")
  if [ "$http" = "200" ]; then
    MKT_PASS=$((MKT_PASS+1))
  else
    echo "  ❌ $page HTTP $http"
    MKT_FAIL=$((MKT_FAIL+1))
  fi
done
echo "  ✅ Marketing: $MKT_PASS/19 HTTP 200"
[ "$MKT_FAIL" -gt 0 ] && FAIL=$((FAIL+MKT_FAIL))

echo ""
echo "▶ Sitemap: $(curl -s "$SITE/sitemap.xml" | grep -c '<url>') URLs"

echo ""
echo "▶ Cron..."
c1=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/api/cron/webhook-jobs")
c2=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/api/cron/martian-orbital-dtn-relay-sync")
[ "$c1" = "401" ] && echo "  ✅ cron no auth: 401" || echo "  ❌ cron no auth: $c1"
[ "$c2" = "404" ] && echo "  ✅ experimental cron: 404" || echo "  ❌ experimental cron: $c2"

echo ""
echo "▶ Checkout (unauth)..."
co=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$SITE/api/billing/checkout" -H "Content-Type: application/json" -d '{"plan":"PRO"}')
[ "$co" = "401" ] && echo "  ✅ checkout requires auth: 401" || echo "  ⚠️  checkout: $co"

echo ""
echo "▶ 404 custom..."
nf=$(curl -s -o /dev/null -w "%{http_code}" "$SITE/nonexistent-page-acceptance-xyz")
body=$(curl -s "$SITE/nonexistent-page-acceptance-xyz")
if [ "$nf" = "404" ] && echo "$body" | grep -qi "not found\|404"; then
  echo "  ✅ custom 404 (HTTP $nf)"
else
  echo "  ⚠️  404 HTTP $nf"
fi

echo ""
echo "▶ Status page..."
curl -s -o /dev/null -w "  HTTP %{http_code}\n" "$SITE/status"

echo ""
echo "HTTP level: marketing $MKT_PASS/19, failures logged above"
