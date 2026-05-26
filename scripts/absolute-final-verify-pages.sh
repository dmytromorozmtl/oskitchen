#!/usr/bin/env bash
# Absolute final page verification against production.
set -uo pipefail
BASE="https://os-kitchen.com"
FAIL=0
WARN=0

check() {
  local expect="$1" path="$2" method="${3:-GET}"
  local http
  if [[ "$method" == "POST" ]]; then
    http=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE}${path}" -H "Content-Type: application/json" -d '{}' 2>/dev/null || echo "000")
  else
    http=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}${path}" 2>/dev/null || echo "000")
  fi
  if [[ "$http" == "$expect" ]]; then
    echo "  ✅ $path"
  else
    if [[ "$expect" == "307" ]]; then
      echo "  ⚠️  $path (HTTP $http)"
      WARN=$((WARN + 1))
    else
      echo "  ❌ $path (HTTP $http)"
      FAIL=$((FAIL + 1))
    fi
  fi
}

echo "▶ Marketing pages (expect 200):"
for page in \
  "/" "/login" "/signup" "/pricing" "/demo" "/product" "/status" "/changelog" \
  "/solutions/restaurants" "/solutions/bars" "/solutions/cafes" \
  "/solutions/fast-casual" "/solutions/meal-prep" "/solutions/ghost-kitchens" \
  "/solutions/catering" "/solutions/bakeries" \
  "/blog" "/blog/how-to-start-meal-prep-business" \
  "/trust" "/support" "/partners" "/customers" "/contact-sales" \
  "/legal/privacy" "/legal/terms" "/legal/security" "/legal/cookie-policy"; do
  check 200 "$page"
done

echo ""
echo "▶ Dashboard pages (expect 307):"
for page in \
  "/dashboard/today" "/dashboard/orders" "/dashboard/pos/terminal" \
  "/dashboard/production" "/dashboard/kitchen" "/dashboard/packing" \
  "/dashboard/tables" "/dashboard/pos/tabs" \
  "/dashboard/brands/command-center" \
  "/dashboard/customers/loyalty" "/dashboard/gift-cards" \
  "/dashboard/food-safety" "/dashboard/food-safety/temperature" \
  "/dashboard/food-safety/checklists" "/dashboard/food-safety/audits" \
  "/dashboard/food-safety/allergens" "/dashboard/food-safety/iot-devices" \
  "/dashboard/customers/feedback" "/dashboard/customers/churn-risk" \
  "/dashboard/referrals" "/dashboard/reports/tax" \
  "/dashboard/accounting/vendor-payments" "/dashboard/accounting/invoices" \
  "/dashboard/routes/optimize" "/dashboard/routes/fleet" \
  "/dashboard/costing/theft" "/dashboard/marketing/holiday-packages" \
  "/dashboard/reports/financial/pnl" "/dashboard/reports/menu-engineering" \
  "/dashboard/forecast/ai" "/dashboard/copilot"; do
  check 307 "$page"
done

echo ""
echo "▶ Storefront pages (expect 200):"
for page in \
  "/s/hello" "/s/hello/menu" "/s/hello/checkout" "/s/hello/cart" \
  "/s/hello/account" "/s/hello/gift-cards" "/s/hello/about" \
  "/s/hello/contact" "/s/hello/catering" "/s/hello/faq" \
  "/s/hello/policies/privacy" "/s/hello/policies/terms"; do
  check 200 "$page"
done

echo ""
echo "▶ API endpoints (expect 401):"
for ep in \
  "/api/storefront/theme/save-draft" \
  "/api/storefront/theme/publish" \
  "/api/storefront/theme/restore" \
  "/api/storefront/builder/publish"; do
  check 401 "$ep" POST
done

echo ""
echo "Summary: FAIL=$FAIL WARN=$WARN"
exit $FAIL
