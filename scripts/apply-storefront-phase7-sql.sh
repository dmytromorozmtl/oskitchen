#!/usr/bin/env bash
# Phase 7 full — core + audit (audit requires phase 6 invites first).
set -euo pipefail
cd "$(dirname "$0")/.."
source "$(dirname "$0")/prisma-env-safe.sh"

bash scripts/apply-storefront-phase7-core-sql.sh

echo "→ prisma db execute: storefront-phase7-invite-audit.sql"
if node ./node_modules/prisma/build/index.js db execute --schema prisma/schema.prisma --file prisma/sql/storefront-phase7-invite-audit.sql; then
  echo "✓ Phase 7 audit SQL applied"
else
  echo "⚠ Phase 7 audit failed — run npm run db:apply-storefront-phase6 first, then retry"
  exit 1
fi
