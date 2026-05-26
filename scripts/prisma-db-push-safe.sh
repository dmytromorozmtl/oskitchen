#!/usr/bin/env bash
# Apply schema to DB without shadow database (pilot-friendly for Phase 2 tables).
set -euo pipefail
cd "$(dirname "$0")/.."
source "$(dirname "$0")/prisma-env-safe.sh"
echo "→ prisma db push (DATABASE_URL from .env.local parser)"
npx prisma db push "$@"
