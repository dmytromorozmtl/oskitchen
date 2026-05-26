#!/usr/bin/env bash
# Apply storefront DB phases in safe order for Supabase.
# 7-core → 6 invites → 7 audit → 8 RLS (optional)
set -euo pipefail
cd "$(dirname "$0")/.."
source "$(dirname "$0")/prisma-env-safe.sh"

FAIL=0

run() {
  local name="$1"
  shift
  echo ""
  echo "→ $name"
  if "$@"; then
    echo "  ✓ $name"
  else
    echo "  ✗ $name"
    FAIL=1
  fi
}

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront DB phases (6 → 7-core → 7-audit → 8-RLS)    ║"
echo "╚══════════════════════════════════════════════════════════╝"

# 1) Multi-store column first — unblocks seed + dev immediately
run "Phase 7 core (is_primary)" bash scripts/apply-storefront-phase7-core-sql.sh

# 2) Team invites table
run "Phase 6 (team invites)" bash scripts/apply-storefront-phase6-sql.sh

# 3) Audit events (FK to invites)
if [[ "$FAIL" -eq 0 ]]; then
  echo ""
  echo "→ Phase 7 audit (invite events)"
  if node ./node_modules/prisma/build/index.js db execute --schema prisma/schema.prisma --file prisma/sql/storefront-phase7-invite-audit.sql; then
    echo "  ✓ Phase 7 audit"
  else
    echo "  ✗ Phase 7 audit (skipped if phase 6 failed)"
    FAIL=1
  fi
else
  echo "→ Phase 7 audit skipped (fix earlier steps first)"
fi

# 4) RLS optional
echo ""
echo "→ Phase 8 RLS (optional)"
if node ./node_modules/prisma/build/index.js db execute --schema prisma/schema.prisma --file prisma/sql/storefront-phase8-rls.sql 2>/dev/null; then
  echo "  ✓ Phase 8 RLS"
else
  echo "  ⚠ Phase 8 RLS skipped or failed (apply manually in Supabase if needed)"
fi

echo ""
if [[ "$FAIL" -eq 0 ]]; then
  echo "✓ All required storefront DB phases applied."
  echo "  Next: npm run storefront:seed-phase2-hello"
  exit 0
else
  echo "✗ Some phases failed. Fix errors above, then re-run: npm run db:apply-storefront-phases"
  exit 1
fi
