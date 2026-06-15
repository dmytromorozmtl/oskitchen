#!/usr/bin/env bash
# Run prisma migrate with clean env (avoids P1013 from poisoned shell DATABASE_URL).
set -euo pipefail
cd "$(dirname "$0")/.."
source "$(dirname "$0")/prisma-env-safe.sh"
echo "→ prisma migrate dev (DATABASE_URL from .env.local parser)"
npx prisma migrate dev "$@"
