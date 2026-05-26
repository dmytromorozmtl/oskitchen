#!/usr/bin/env bash
# Master execution automated gate — run before deploy / weekly.
set -euo pipefail
cd "$(dirname "$0")/.."

# shellcheck source=scripts/ensure-node-path.sh
source "$(dirname "$0")/ensure-node-path.sh"

echo "═══ KitchenOS ci:check ═══"

echo "→ Workspace audit (no regression)"
npm run workspace:audit:gate

echo "→ Workspace schema coverage"
npm run workspace:coverage:check

echo "→ Production cron manifest"
npm run validate:cron-inventory

echo "→ Tenant scope pilot paths"
npm run validate:tenant-scope-pilot

echo "→ Startup readiness validator"
npm run validate:startup-readiness

echo "→ Unit tests"
npm test

echo "→ Unit coverage (thresholds in vitest.config.ts)"
npm run test:coverage

echo "→ GTM production SEO probe"
npm run gtm:gsc-preflight

echo ""
echo "✅ ci:check passed. Manual: GSC verify, PostHog key, Sentry DSN, 3 pilots."
