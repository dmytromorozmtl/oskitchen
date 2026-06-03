#!/usr/bin/env bash
# DEV-06: Report console.log usage in production paths.
# Production paths: app/ services/ actions/ lib/ components/
# CLI exception: scripts/ — intentional stdout for operators.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROD_DIRS=(app services actions lib components)
LIMIT="${SWEEP_LIMIT:-50}"

count_logs_in() {
  local prefix="$1"
  local total=0
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    # lib/logger.ts is the sole allowed console.log sink
    [ "$f" = "lib/logger.ts" ] && continue
    local c
    c=$(grep -o 'console\.log' "$f" 2>/dev/null | wc -l | tr -d ' ')
    total=$((total + c))
  done < <(git ls-files "${prefix}/" 2>/dev/null | grep -E '\.(ts|tsx)$' || true)
  echo "$total"
}

echo "=== console.log sweep (DEV-06) ==="
echo "Root: $ROOT"
echo ""

echo "--- Production paths ---"
prod_total=0
for dir in "${PROD_DIRS[@]}"; do
  sub=$(count_logs_in "$dir")
  prod_total=$((prod_total + sub))
  echo "[$dir] $sub"
done
echo "  production subtotal: $prod_total"
echo ""

echo "--- Top $LIMIT repo-wide ---"
git ls-files '*.ts' '*.tsx' \
  | while read -r f; do
      c=$(grep -o 'console\.log' "$f" 2>/dev/null | wc -l | tr -d ' ')
      [ "$c" -gt 0 ] && echo "$c $f"
    done \
  | sort -rn \
  | head -n "$LIMIT" || true

scripts_total=$(count_logs_in "scripts")

echo ""
echo "--- Summary ---"
echo "Production paths: $prod_total console.log (target: 0)"
echo "scripts/ (CLI):   $scripts_total console.log (intentional)"
echo ""
echo "Use lib/logger.ts — logger.cli for smoke reports, logger.debug/info for dev diagnostics."

if [ "${1:-}" = "--fix-hint" ]; then
  echo ""
  echo "Production files still using console.log:"
  for dir in "${PROD_DIRS[@]}"; do
    git ls-files "${dir}/" 2>/dev/null \
      | grep -E '\.(ts|tsx)$' \
      | while read -r f; do
          grep -q 'console\.log' "$f" 2>/dev/null && echo "  $f"
        done || true
  done
fi
