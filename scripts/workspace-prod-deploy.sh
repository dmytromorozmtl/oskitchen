#!/usr/bin/env bash
# Full tenant deploy: migrate → backfill → verify → NOT NULL (optional) → staff scope check.
# Requires DATABASE_URL (staging/prod). Never run --execute on prod without staging proof.
set -euo pipefail
cd "$(dirname "$0")/.."

APPLY_NOT_NULL="${APPLY_NOT_NULL:-0}"

echo "═══ KitchenOS workspace prod deploy ═══"
echo ""

echo "1/6 Schema coverage (local gate)"
npm run workspace:coverage:strict
echo ""

echo "2/6 Prisma migrate deploy (no shadow DB)"
if [[ -n "${USE_MIGRATE_DEV:-}" ]]; then
  npm run prisma:migrate:safe
else
  npx prisma migrate deploy
fi
echo ""

echo "3/7 Backfill dry-run (core phases 1–11 + SQL owner + phases 12–29)"
npm run workspace:backfill:all -- --dry-run || true
npx tsx scripts/backfill-workspace-sql-owner.ts --dry-run
npm run workspace:backfill:phases-12-29 -- --dry-run
echo ""

if [[ "${1:-}" != "--execute" ]]; then
  echo "Dry-run only. Re-run with --execute to write workspace_id rows:"
  echo "  bash scripts/workspace-prod-deploy.sh --execute"
  exit 0
fi

echo "4/7 Backfill execute (core + orphans + SQL owner + phases 12–29)"
npm run workspace:backfill:all -- --execute
npx tsx scripts/provision-workspace-for-orphan-owners.ts --execute
npx tsx scripts/backfill-workspace-sql-owner.ts --execute --via-members
npm run workspace:backfill:phases-12-29 -- --execute
npx tsx scripts/backfill-workspace-only-tables.ts --execute
echo ""

echo "4b/7 Reconcile duplicate owner workspaces"
npx tsx scripts/reconcile-duplicate-owner-workspaces.ts --execute
echo ""

echo "5/7 Strict verify (schema + data)"
npm run workspace:strict:all
echo ""

if [[ "$APPLY_NOT_NULL" == "1" ]]; then
  echo "6/7 Resolve failed NOT NULL migration if needed"
  npx prisma migrate resolve --rolled-back 20260525000000_workspace_id_not_null 2>/dev/null || true
  echo "7/7 Generate + apply NOT NULL migration"
  npm run workspace:generate:not-null
  npx prisma migrate deploy
else
  echo "6/6 Skipping NOT NULL (set APPLY_NOT_NULL=1 when verify is clean)"
  npm run workspace:generate:not-null || true
fi

echo ""
echo "Staff / owner scope sample"
npm run verify:staff-scope || true

echo ""
echo "✓ Workspace prod deploy sequence finished"
