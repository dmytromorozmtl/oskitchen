#!/usr/bin/env bash
# Run Woo + Shopify live smokes and print domination tree next step.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

status() {
  local file=$1
  python3 -c "import json; d=json.load(open('$file')); print(d.get('overall','?'))" 2>/dev/null || echo "missing"
}

echo "=== WooCommerce live smoke ==="
npm run smoke:woo-live || true
echo "Woo overall: $(status artifacts/woocommerce-live-smoke-summary.json)"
echo ""
echo "=== Shopify live smoke ==="
npm run smoke:shopify-live || true
echo "Shopify overall: $(status artifacts/shopify-live-smoke-summary.json)"
echo ""
echo "=== Domination tree ==="
./scripts/domination-next-step.sh
