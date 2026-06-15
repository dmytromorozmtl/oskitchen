#!/usr/bin/env bash
# Week 1 engineering + GTM automated gates (run before outbound / pilots).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== KitchenOS Week 1 preflight ==="

if command -v npm >/dev/null 2>&1; then
  echo "→ Unit tests"
  npm test
  echo "→ Workspace migration gate"
  npm run workspace:audit:gate
else
  echo "⚠ npm not in PATH — skip npm test (run locally: npm test && npm run workspace:audit:gate)"
fi

echo "→ GSC / production SEO probe"
if [[ "${GTM_GSC_STRICT:-}" == "1" ]]; then
  npx tsx scripts/gtm-gsc-preflight.ts --strict
else
  npx tsx scripts/gtm-gsc-preflight.ts
fi

echo ""
echo "✅ Automated Week 1 gates passed."
echo "Manual checklist: docs/WEEK_1_LAUNCH_CHECKLIST.md"
echo "  • GSC verify + submit sitemap (15 min)"
echo "  • Export PDF from https://os-kitchen.com/deck"
echo "  • Legal review pilot agreement"
echo "  • Send 10 outreach emails (docs/outreach/email-templates.md)"
