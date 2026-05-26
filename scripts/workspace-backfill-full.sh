#!/usr/bin/env bash
# Complete workspace_id data backfill: phases 1–11, SQL owner pass, phases 12–29.
set -euo pipefail
cd "$(dirname "$0")/.."

EXEC="${1:-}"
if [[ "$EXEC" != "--execute" && "$EXEC" != "--dry-run" ]]; then
  echo "Usage: bash scripts/workspace-backfill-full.sh [--dry-run|--execute]"
  exit 1
fi

echo "═══ Workspace full backfill ($EXEC) ═══"
npm run workspace:backfill:all -- "$EXEC"
npx tsx scripts/backfill-workspace-sql-owner.ts "$EXEC"
if [[ "$EXEC" == "--execute" ]]; then
  npx tsx scripts/backfill-workspace-sql-owner.ts --execute --via-members
else
  npx tsx scripts/backfill-workspace-sql-owner.ts --dry-run --via-members
fi
npm run workspace:backfill:phases-12-29 -- "$EXEC"
echo "✓ Full backfill finished"
