#!/bin/bash
set -euo pipefail

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://eycxwxxyrzdhhqcnxifz.supabase.co}"
ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-sb_publishable_dD4M3pNzWjB-8Ae4-ZIKKw_U8MXvFm4}"

echo "=== Checking Supabase Configuration ==="

echo ""
echo "▶ Supabase health..."
if curl -sf "$SUPABASE_URL/auth/v1/health" -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" >/dev/null; then
  echo "✅ Auth health OK"
else
  echo "❌ Auth health failed"
fi

echo ""
echo "▶ Auth settings (site_url may require Dashboard)..."
SETTINGS=$(curl -sf "$SUPABASE_URL/auth/v1/settings" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" 2>/dev/null || echo "{}")
echo "$SETTINGS" | python3 -m json.tool 2>/dev/null || echo "$SETTINGS"

SITE_URL=$(echo "$SETTINGS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('site_url',''))" 2>/dev/null || echo "")
if [ -n "$SITE_URL" ]; then
  if [ "$SITE_URL" = "https://os-kitchen.com" ]; then
    echo "✅ site_url is https://os-kitchen.com"
  else
    echo "⚠️  site_url is $SITE_URL — expected https://os-kitchen.com"
  fi
else
  echo "⚠️  site_url not returned via API — verify in Dashboard"
fi

echo ""
echo "Manual check required:"
echo "  https://supabase.com/dashboard/project/eycxwxxyrzdhhqcnxifz/auth/url-configuration"
echo "  Site URL must be: https://os-kitchen.com"
