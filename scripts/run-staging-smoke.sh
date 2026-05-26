#!/usr/bin/env bash
# Safe staging smoke — run: npm run smoke:staging
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== 1. List workspace owners ==="
npm run smoke:team-invites -- --list

echo ""
echo "=== 2. Team invite smoke (create / list / cancel) ==="
OWNER_EMAIL="${SMOKE_OWNER_EMAIL:-workspace.moroz@gmail.com}"
npm run smoke:team-invites -- --owner-email="${OWNER_EMAIL}"

if [[ -n "${SMOKE_PUBLIC_API_KEY:-}" ]]; then
  echo ""
  echo "=== 3. Public API smoke ==="
  export SMOKE_PUBLIC_API_BASE="${SMOKE_PUBLIC_API_BASE:-http://localhost:3000}"
  npm run smoke:public-api
else
  echo ""
  echo "=== 3. Public API smoke SKIPPED ==="
  echo "Create a key in Dashboard → Developer, then:"
  echo '  export SMOKE_PUBLIC_API_KEY="kos_YOUR_FULL_KEY_HERE"'
  echo '  export SMOKE_PUBLIC_API_BASE="http://localhost:3000"'
  echo "  npm run smoke:public-api"
fi

echo ""
echo "Done. For manual UI steps see docs/MANUAL_UI_SMOKE_CHECKLIST.md"
