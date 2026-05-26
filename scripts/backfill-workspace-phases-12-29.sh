#!/usr/bin/env bash
# Run all workspace backfills (phases 12–29). Dry-run unless --execute passed through.
set -euo pipefail
cd "$(dirname "$0")/.."

EXEC="${1:-}"
for phase in 12 13 14 15 16 17 18 19 20 21 22; do
  echo "═══ Phase $phase ═══"
  npm run "workspace:backfill:phase$phase" -- $EXEC
done
echo "═══ Phases 23–29 (bulk) ═══"
npm run workspace:backfill:phases-23-29 -- $EXEC
echo "✓ All phase backfills finished"
