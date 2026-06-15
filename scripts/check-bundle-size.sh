#!/usr/bin/env bash
# First Load JS scan after production build — run: bash scripts/check-bundle-size.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

LOG="${TMPDIR:-/tmp}/kitchenos-build-output.txt"

echo "=== BUNDLE SIZE CHECK ==="
echo ""

echo "Building (this may take a few minutes)..."
npm run build 2>&1 | tee "$LOG"

echo ""
echo "=== First Load JS (sorted) ==="
grep "First Load JS" "$LOG" | sort -t'/' -k2 || true

echo ""
LARGE_PAGES=$(grep "First Load JS" "$LOG" | awk '{gsub(/[^0-9]/,"",$4); if ($4+0 > 200) print}' || true)
if [[ -n "${LARGE_PAGES:-}" ]]; then
  echo "⚠️  Large pages (>200KB first load):"
  echo "$LARGE_PAGES"
else
  echo "✓ No routes over 200KB first load (grep heuristic)"
fi

echo ""
echo "Done. Full log: $LOG"
echo "CI regression gate: npm run check:bundle-size-regression (needs artifacts/build-route-sizes.log)"
