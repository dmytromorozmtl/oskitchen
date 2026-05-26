#!/usr/bin/env bash
# Apply Phase 6 storefront team invites table (idempotent SQL).
set -euo pipefail
cd "$(dirname "$0")/.."
source "$(dirname "$0")/prisma-env-safe.sh"
echo "→ prisma db execute: storefront-phase6-invites.sql"
node ./node_modules/prisma/build/index.js db execute --schema prisma/schema.prisma --file prisma/sql/storefront-phase6-invites.sql
echo "✓ Phase 6 SQL applied"
node ./node_modules/prisma/build/index.js generate
