#!/usr/bin/env bash
# Orchestrates staging remediation (run ON staging host after DBA approval).
#
#   npm run staging:remediation-all
#   npm run staging:remediation-all -- --skip-migrate   # backfill only
#   npm run staging:remediation-all -- --dry-run        # preflight + DBA packet only
set -euo pipefail

SKIP_MIGRATE=0
DRY_RUN=0
STRICT=0
for arg in "$@"; do
  case "$arg" in
    --skip-migrate) SKIP_MIGRATE=1 ;;
    --dry-run) DRY_RUN=1 ;;
    --strict) STRICT=1 ;;
  esac
done

echo "=== 0/5 DBA migration review packet ==="
npx tsx scripts/dba-migration-review.ts --write=docs/artifacts/DBA_MIGRATION_PACKET.md || true

echo ""
echo "=== 1/5 Environment gate ==="
if [[ "$STRICT" -eq 1 ]]; then
  npm run verify:staging-env -- --strict
else
  npm run verify:staging-env
fi

echo ""
echo "=== 2/5 Preflight ==="
npm run staging:preflight

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo ""
  echo "Dry run complete. DBA: review docs/artifacts/DBA_MIGRATION_PACKET.md then re-run without --dry-run."
  exit 0
fi

if [[ "$SKIP_MIGRATE" -eq 0 ]]; then
  echo ""
  echo "=== 3/5 Migrate (requires DATABASE_URL + DIRECT_URL) ==="
  npx prisma migrate deploy
  npx prisma generate
else
  echo ""
  echo "=== 3/5 Migrate SKIPPED (--skip-migrate) ==="
fi

echo ""
echo "=== 4/5 Backfill ==="
npm run backfill:workspace-id -- --dry-run
npm run backfill:workspace-id
npm run backfill:workspace-phase2 -- --dry-run
npm run backfill:workspace-phase2

echo ""
echo "=== 5/5 Verification ==="
npm run check:backfill
npm run verify:staff-scope || true

echo ""
echo "Done."
echo "  Next: npm run beta:staging-prep  OR  npm run beta:day1-complete -- --with-staging-prep"
echo "  QA: npm run beta:qa-bundle -- --with-playwright"
echo "  Final: npm run beta:launch -- --with-playwright --json --html"
