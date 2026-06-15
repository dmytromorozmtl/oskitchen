#!/usr/bin/env bash
# Production endpoint smoke — run: bash scripts/health-check.sh
set -euo pipefail

echo "=== OS KITCHEN HEALTH CHECK ==="
echo ""

ENDPOINTS=(
  "https://os-kitchen.com"
  "https://os-kitchen.com/api/health"
  "https://os-kitchen.com/pricing"
  "https://os-kitchen.com/shopify"
  "https://os-kitchen.com/login"
  "https://os-kitchen.com/signup"
)

FAILS=0
for url in "${ENDPOINTS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")
  if [[ "$STATUS" = "200" || "$STATUS" = "307" ]]; then
    echo "✅ $url ($STATUS)"
  else
    echo "❌ $url ($STATUS)"
    FAILS=$((FAILS + 1))
  fi
done

echo ""
if [[ "$FAILS" -eq 0 ]]; then
  echo "✅ All endpoints healthy"
else
  echo "❌ $FAILS endpoints failing"
  exit 1
fi
