#!/usr/bin/env bash
# Week 2 — media bucket + verification (no bash source).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Storefront Week 2 — media pilot (hello)                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

FAIL=0

echo "▶ 1/4 Setup Supabase bucket"
if npm run storefront:setup-media-bucket; then
  echo "   ✓ bucket ready + .env.production.local patched"
else
  echo "   ✗ setup failed"
  FAIL=1
fi
echo ""

echo "▶ 2/4 Verify bucket"
if npm run storefront:verify-media-bucket; then
  echo "   ✓ verify OK"
else
  echo "   ✗ set STOREFRONT_SUPABASE_STORAGE_BUCKET or re-run setup"
  FAIL=1
fi
echo ""

echo "▶ 3/4 Env check (media)"
export STOREFRONT_WEEK1_MODE=1
if npm run check-env:storefront 2>&1 | grep -qE "Storefront media bucket.*(Set|configured|Storage provider)"; then
  echo "   ✓ media bucket env recognized"
else
  echo "   ⚠ media bucket still info-level — confirm .env.production.local"
fi
echo ""

echo "▶ 4/4 Sign-off artifact"
npm run storefront:week2-artifacts
echo ""

echo "Manual (cannot automate):"
echo "  • Vercel: STOREFRONT_SUPABASE_STORAGE_BUCKET=storefront-media → Redeploy"
echo "  • Admin → /dashboard/storefront/media → upload JPEG"
echo "  • Builder → Slider → use Media library URL on /s/hello"
echo "  • docs/artifacts/STOREFRONT_SLIDER_QA_CHECKLIST.md"
echo ""

if [[ "${FAIL}" -ne 0 ]]; then exit 1; fi
echo "Week 2 automated steps: PASS — complete Vercel + admin upload"
