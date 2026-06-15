#!/usr/bin/env bash
# Remove node_modules and .next without relying on a long in-place rm -rf
# (slow on iCloud Desktop, Spotlight indexing, or antivirus scanning).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

rm -rf .next 2>/dev/null || true

if [[ ! -d node_modules ]]; then
  echo "No node_modules — nothing to remove."
  exit 0
fi

TRASH="node_modules.__trash__.$$"
echo "Renaming node_modules -> ${TRASH} (usually instant on the same disk)…"
mv node_modules "${TRASH}"

echo "Deleting ${TRASH}… On Desktop/iCloud this may take 5–20+ minutes — wait until this finishes."
rm -rf "${TRASH}"

echo "Clean complete. Run: npm install"
