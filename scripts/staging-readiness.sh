#!/usr/bin/env bash
set -euo pipefail

echo "== Prisma migrate status =="
npx prisma migrate status

echo ""
echo "== Paid pilot code readiness =="
SKIP_BUILD=1 npm run verify:pilot-readiness

echo ""
echo "== Team invite owners =="
npm run smoke:team-invites -- --list

echo ""
echo "Ready for: npm run smoke:team-invites -- --owner-email=YOUR_EMAIL"
