#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."

echo "=== KitchenOS Token Upload ==="

# Upstash
if [ -n "${UPSTASH_REDIS_REST_TOKEN:-}" ]; then
  printf '%s' "$UPSTASH_REDIS_REST_TOKEN" | vercel env add UPSTASH_REDIS_REST_TOKEN production --force --yes
  echo "✅ UPSTASH_REDIS_REST_TOKEN uploaded"
else
  echo "❌ UPSTASH_REDIS_REST_TOKEN not set — get from https://console.upstash.com"
fi

# Resend
if [ -n "${RESEND_API_KEY:-}" ]; then
  printf '%s' "$RESEND_API_KEY" | vercel env add RESEND_API_KEY production --force --yes
  echo "✅ RESEND_API_KEY uploaded"
else
  echo "❌ RESEND_API_KEY not set — get from https://resend.com/api-keys"
fi

# Rate limit adapter
if [ -n "${UPSTASH_REDIS_REST_TOKEN:-}" ]; then
  printf '%s' "upstash" | vercel env add RATE_LIMIT_ADAPTER production --force --yes
  echo "✅ RATE_LIMIT_ADAPTER=upstash"
fi

# Stripe webhook
if [ -n "${STRIPE_WEBHOOK_SECRET:-}" ]; then
  printf '%s' "$STRIPE_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production --force --yes
  echo "✅ STRIPE_WEBHOOK_SECRET uploaded"
fi

echo ""
echo "Done. Redeploy: vercel deploy --prebuilt --prod --yes"
