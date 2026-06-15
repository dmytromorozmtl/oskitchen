#!/usr/bin/env bash
# KitchenOS — verify local toolchain and produce a production build.
# Run from project root: ./scripts/local-check.sh   OR   npm run local-check
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Prefer Homebrew Node/npm when the shell PATH is minimal (e.g. some IDE terminals).
if [[ -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -x /usr/local/bin/brew ]]; then
  eval "$(/usr/local/bin/brew shellenv)"
fi

echo "=== Checking Node ==="
command -v node >/dev/null || {
  echo "node not found. Install Node from https://nodejs.org or: brew install node"
  echo "See docs/LOCAL_NODE_SETUP.md"
  exit 127
}
node -v
command -v npm >/dev/null || {
  echo "npm not found (Node distribution incomplete). See docs/LOCAL_NODE_SETUP.md"
  exit 127
}
npm -v

echo ""
echo "=== Installing dependencies ==="
npm install

echo ""
echo "=== Prisma generate ==="
npx prisma generate

echo ""
echo "=== TypeScript ==="
npm run typecheck

echo ""
echo "=== Production build ==="
npm run build

echo ""
echo "=== Done ==="
echo "Next: npm run dev   → http://localhost:3000"
echo "Optional: npm run db:migrate (needs real DATABASE_URL / DIRECT_URL in .env.local)"
