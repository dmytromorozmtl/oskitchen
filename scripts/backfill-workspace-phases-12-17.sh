#!/usr/bin/env bash
# Run all workspace backfills (phases 12–17). Dry-run unless --execute passed through.
set -euo pipefail
cd "$(dirname "$0")/.."

EXEC="${1:-}"
for phase in 12 13 14 15 16 17; do
  echo "═══ Phase $phase ═══"
  npm run "workspace:backfill:phase$phase" -- $EXEC
done
echo "✓ All phase backfills finished"
