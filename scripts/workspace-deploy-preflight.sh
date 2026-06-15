#!/usr/bin/env bash
# Pre-deploy checks for workspace tenant migration (schema + data).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "═══ Workspace deploy preflight ═══"
npm run workspace:coverage:strict
npm run workspace:audit
echo ""
echo "Dry-run backfill (no writes):"
npm run workspace:backfill:phases-12-29 -- --dry-run
echo ""
echo "Data verify (requires DATABASE_URL + migrations applied):"
if npm run workspace:post-backfill:verify:strict 2>/dev/null; then
  echo "✓ Post-backfill strict verify passed"
else
  echo "⚠ Verify failed — migrate, backfill --execute, then: npm run workspace:strict:all"
fi
echo ""
echo "Staging/prod sequence:"
echo "  npm run prisma:migrate:safe"
echo "  npm run workspace:backfill:phases-12-29 -- --execute"
echo "  npm run workspace:strict:all"
echo "  npm run workspace:generate:not-null && npm run prisma:migrate:safe"
