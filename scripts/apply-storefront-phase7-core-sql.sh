#!/usr/bin/env bash
# Phase 7a — is_primary + multi-store indexes only (no invite tables required).
set -euo pipefail
cd "$(dirname "$0")/.."
source "$(dirname "$0")/prisma-env-safe.sh"
echo "→ prisma db execute: storefront-phase7-multi-store-core.sql"
node ./node_modules/prisma/build/index.js db execute --schema prisma/schema.prisma --file prisma/sql/storefront-phase7-multi-store-core.sql
echo "✓ Phase 7 core SQL applied (is_primary)"
node ./node_modules/prisma/build/index.js generate
