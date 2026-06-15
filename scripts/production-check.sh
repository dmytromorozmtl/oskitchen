#!/usr/bin/env bash
# KitchenOS — production readiness gate (runs locally or in CI).
# Usage: npm run production-check
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -x /usr/local/bin/brew ]]; then
  eval "$(/usr/local/bin/brew shellenv)"
fi

echo "=== Node version (expect 22.x) ==="
command -v node >/dev/null || { echo "node not found"; exit 127; }
NODE_MAJ="$(node -p "process.versions.node.split('.')[0]")"
if [[ "$NODE_MAJ" != "22" ]]; then
  echo "Warning: Node $NODE_MAJ detected — project recommends Node 22 LTS (.nvmrc)."
fi
node -v

echo ""
echo "=== Required files ==="
test -f .env.example || { echo "Missing .env.example"; exit 1; }
echo ".env.example OK"

echo ""
echo "=== Secret pattern scan (source only) ==="
if command -v rg >/dev/null 2>&1; then
  BAD=$(rg -l 'sk_live_[0-9a-zA-Z]{10,}' app lib actions components services prisma --glob '*.ts' --glob '*.tsx' 2>/dev/null || true)
  if [[ -n "${BAD:-}" ]]; then
    echo "ERROR: Possible Stripe LIVE secret embedded in source:"
    echo "$BAD"
    exit 1
  fi
  echo "No obvious sk_live_* literals in TS sources."
else
  echo "rg not installed — skipping secret scan (install ripgrep for CI)."
fi

echo ""
echo "=== Localhost in production paths (heuristic) ==="
if command -v rg >/dev/null 2>&1; then
  LOC=$(rg -n 'http://localhost|127\.0\.0\.1:5432' app lib actions components services --glob '*.tsx' --glob '*.ts' 2>/dev/null | grep -v 'lib/env.ts' | grep -v 'lib/constants.ts' || true)
  if [[ -n "$LOC" ]]; then
    echo "$LOC"
    echo "Review matches — production URLs must come from env."
  fi
else
  echo "rg not installed — skipping localhost heuristic."
fi

echo ""
echo "=== Dependencies ==="
command -v npm >/dev/null || { echo "npm not found"; exit 127; }
npm ci 2>/dev/null || npm install

echo ""
echo "=== prisma generate ==="
npx prisma generate

echo ""
echo "=== TypeScript ==="
npm run typecheck

echo ""
echo "=== Production build ==="
npm run build

echo ""
echo "=== production-check passed ==="
