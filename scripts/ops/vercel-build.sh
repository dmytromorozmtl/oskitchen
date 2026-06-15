#!/usr/bin/env bash
# Vercel Build Command — production build with memory headroom.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"

echo "=== KitchenOS Vercel Build ==="
echo "NODE_OPTIONS=$NODE_OPTIONS"
echo ""

echo "[1/2] Prisma generate (native + Vercel Linux targets)..."
npx prisma generate

echo "[2/2] Next.js production build..."
npm run build

echo ""
echo "=== Build complete ==="
