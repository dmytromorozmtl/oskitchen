#!/usr/bin/env bash
# Pre-deploy monitoring suite — run: npm run monitor
# Skip slow steps: SKIP_LIGHTHOUSE=1 SKIP_BUNDLE=1 SKIP_HEALTH=1
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== OS KITCHEN MONITORING SUITE ==="
echo ""

echo "1. TypeScript..."
npm run typecheck 2>&1 | tail -1

echo ""
echo "2. Tests..."
npm test 2>&1 | tail -1

echo ""
echo "3. Build..."
npm run build 2>&1 | tail -1

echo ""
if [[ "${SKIP_BUNDLE:-}" != "1" ]]; then
  echo "4. Bundle size..."
  bash scripts/check-bundle-size.sh 2>&1 | tail -5
else
  echo "4. Bundle size... skipped (SKIP_BUNDLE=1)"
fi

echo ""
if [[ "${SKIP_HEALTH:-}" != "1" ]]; then
  echo "5. Health check..."
  bash scripts/health-check.sh 2>&1 | tail -3
else
  echo "5. Health check... skipped (SKIP_HEALTH=1)"
fi

echo ""
if [[ "${SKIP_LIGHTHOUSE:-}" != "1" ]]; then
  echo "6. Lighthouse (requires server on :3000 — run build + start first, or use CI)..."
  if curl -sf http://127.0.0.1:3000/login >/dev/null 2>&1; then
    npm run lighthouse 2>&1 | tail -5
  else
    echo "⚠️  No server at http://127.0.0.1:3000 — skip with SKIP_LIGHTHOUSE=1 or: npm run build && npm run start"
  fi
else
  echo "6. Lighthouse... skipped (SKIP_LIGHTHOUSE=1)"
fi

echo ""
echo "=== MONITORING COMPLETE ==="
