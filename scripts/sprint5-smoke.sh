#!/usr/bin/env bash
# Sprint 5 smoke — unit tests + optional Playwright (steps 1–3 from release checklist).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -x /usr/local/bin/brew ]]; then
  eval "$(/usr/local/bin/brew shellenv)"
fi

echo "=== Sprint 5 smoke ==="
echo ""

echo "=== 1) Unit: media, webhook, experiment ==="
npx vitest run \
  tests/unit/product-image-url.test.ts \
  tests/unit/webhook-delivery-metadata.test.ts \
  tests/unit/theme-experiment-analytics.test.ts \
  tests/unit/theme-experiment-bucket.test.ts \
  tests/unit/theme-experiment-edge-config.test.ts \
  tests/unit/theme-experiment-significance.test.ts \
  tests/unit/theme-experiment-version.test.ts \
  tests/unit/theme-experiment-srm.test.ts \
  tests/unit/validate-dlq-webhook-url.test.ts \
  tests/unit/ga4-analytics-links.test.ts

echo ""
echo "=== 2) Production build ==="
npm run build

echo ""
echo "=== 3) Optional E2E (requires credentials) ==="
if [[ -n "${E2E_LOGIN_EMAIL:-}" && -n "${E2E_LOGIN_PASSWORD:-}" ]]; then
  echo "Running authed Sprint 5 E2E (menu media + webhook + lifecycle)..."
  npx playwright test e2e/menu-item-media-authed.spec.ts e2e/sprint5-webhook-authed.spec.ts e2e/sprint5-experiment-lifecycle.spec.ts --project=storefront-authed
else
  echo "Skip authed E2E — set E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD"
fi

if [[ -n "${E2E_STORE_SLUG:-}" ]]; then
  echo "Running public experiment sticky E2E..."
  npx playwright test e2e/sprint5-theme-experiment-edge.spec.ts --project=chromium
else
  echo "Skip edge sticky E2E — set E2E_STORE_SLUG (experiment enabled on storefront)"
fi

echo ""
echo "=== Manual checklist (cannot automate without staging secrets) ==="
cat <<'EOF'
[ ] П.4 UI: /dashboard/products → Table → Pick image → save → /s/{slug}/products/{ref} shows img
[ ] Webhook: Settings HTTPS URL → Builder publish page → Settings log shows delivered/failed
[ ] Edge staging: THEME_EXPERIMENT_EDGE=1 + Edge Config → two incognito browsers → different arms possible
[ ] Same browser reload → same kos_ab_theme arm
[ ] Advanced: /dashboard/storefront/advanced?days=7 → lift card + CSV export
[ ] Edge A–C: STOREFRONT_SMOKE_SLUG=... npm run smoke:edge-experiment
[ ] DLQ alerting: STOREFRONT_EDGE_SYNC_DLQ_WEBHOOK_URL=https://hooks.slack.com/... (full URL, not ...)
[ ] Phase F: npm run ops:phase-f-prod-wiring → configure 3 Vercel log drains
[ ] SRM cron: /api/cron/storefront-experiment-srm + STOREFRONT_EXPERIMENT_SRM_WEBHOOK_URL
[ ] Weekly CSV: npm run ops:dry-run-experiment-weekly-report -- --send (staging)
EOF

echo ""
echo "=== Done ==="
