#!/usr/bin/env bash
# Apply Phase 2 storefront tables via idempotent SQL (avoids db push index conflicts).
set -euo pipefail
cd "$(dirname "$0")/.."
source "$(dirname "$0")/prisma-env-safe.sh"
echo "→ prisma db execute: storefront-phase2-pilot.sql"
node ./node_modules/prisma/build/index.js db execute --schema prisma/schema.prisma --file prisma/sql/storefront-phase2-pilot.sql
echo "✓ Phase 2 SQL applied"
node ./node_modules/prisma/build/index.js generate
