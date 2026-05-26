#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."

SITE="${SITE:-https://os-kitchen.com}"

echo "=== KitchenOS Quick Acceptance ==="
echo " $(date)"
echo " SITE=$SITE"
echo ""

echo "▶ Health..."
curl -s "$SITE/api/health" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'  Status: {d.get(\"status\")}')
c = d.get('checks', {})
print(f'  DB: {c.get(\"database\", {}).get(\"ok\")}')
print(f'  Supabase: {c.get(\"supabase\", {}).get(\"ok\")}')
print(f'  Rate limit: {c.get(\"rateLimitAdapter\", {}).get(\"adapter\", \"?\")}')
" 2>/dev/null || echo "  ❌ Cannot reach health endpoint"

echo ""
echo "▶ Security..."
echo -n "  CSP: "
curl -sI "$SITE" 2>/dev/null | grep -qi "Content-Security-Policy" && echo "✅" || echo "❌"
echo -n "  Open redirect: "
curl -sI "$SITE/auth/callback?next=https://evil.com" 2>/dev/null | grep -qi "evil.com" && echo "❌ VULNERABLE" || echo "✅ SAFE"

echo ""
echo "▶ Key pages..."
for page in "/login" "/signup" "/pricing" "/demo" "/status"; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$SITE$page")
  echo "  $page: $HTTP"
done

echo ""
echo "▶ E2E HTTP..."
export PLAYWRIGHT_BASE_URL="$SITE"
node ./node_modules/@playwright/test/cli.js test tests/e2e/pilot-golden-path-http.spec.ts --project=ci-critical-paths 2>&1 | tail -3

echo ""
echo "Done. Full check: bash scripts/ops/pilot-ready-check.sh"
