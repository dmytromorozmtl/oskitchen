#!/usr/bin/env bash
# Prints the first Market Domination decision-tree step that still needs work.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

woo_passed() {
  python3 -c "
import json,sys
p='artifacts/woocommerce-live-smoke-summary.json'
try:
  d=json.load(open(p))
  sys.exit(0 if d.get('overall')=='PASSED' else 1)
except: sys.exit(1)
" 2>/dev/null
}

shopify_passed() {
  python3 -c "
import json,sys
p='artifacts/shopify-live-smoke-summary.json'
try:
  d=json.load(open(p))
  sys.exit(0 if d.get('overall')=='PASSED' else 1)
except: sys.exit(1)
" 2>/dev/null
}

done_count() {
  python3 -c "import json; d=json.load(open('artifacts/domination-tracker.json')); print(sum(1 for v in d.values() if v=='done'))" 2>/dev/null || echo 0
}

if [[ ! -f app/dashboard/quick-start/page.tsx ]]; then echo "STEP=1 Quick Start Wizard"; exit 0; fi
if [[ ! -f app/demo/page.tsx ]]; then echo "STEP=2 Demo Environment"; exit 0; fi
if [[ ! -f components/onboarding/menu-template-selector.tsx ]]; then echo "STEP=3 Pre-built Menu Templates"; exit 0; fi
if ! woo_passed; then echo "STEP=4 WooCommerce live smoke (overall != PASSED)"; exit 0; fi
if ! shopify_passed; then echo "STEP=5 Shopify live smoke (overall != PASSED)"; exit 0; fi
if [[ ! -f services/referral/referral-service.ts ]]; then echo "STEP=6 Referral Program"; exit 0; fi
if [[ ! -f app/q/\[slug\]/\[tableId\]/page.tsx ]]; then echo "STEP=7 QR Code Ordering"; exit 0; fi
if [[ ! -f app/dashboard/today/profit/page.tsx ]]; then echo "STEP=8 Real-time Profit Dashboard"; exit 0; fi
if [[ ! -f app/branding/page.tsx ]]; then echo "STEP=9 White-label PWA"; exit 0; fi
if [[ ! -f services/loyalty/loyalty-2.0-service.ts ]]; then echo "STEP=10 Loyalty 2.0"; exit 0; fi
if [[ ! -f services/onboarding/auto-onboarding-service.ts ]]; then echo "STEP=11 Automated Onboarding"; exit 0; fi
if [[ ! -f services/voice/voice-ordering-service.ts ]]; then echo "STEP=12 Voice Ordering"; exit 0; fi
if [[ ! -f services/pos/offline-card-service.ts ]]; then echo "STEP=13 Offline POS Card Payments"; exit 0; fi
if [[ ! -f services/payments/stripe-terminal-hardware-service.ts ]]; then echo "STEP=14 Stripe Terminal Hardware"; exit 0; fi
if [[ ! -f services/integrations/uber-eats-live-service.ts ]]; then echo "STEP=15 Uber Eats LIVE"; exit 0; fi
if [[ ! -f services/integrations/doordash-live-service.ts ]]; then echo "STEP=16 DoorDash LIVE"; exit 0; fi
if [[ ! -f services/integrations/grubhub-live-service.ts ]]; then echo "STEP=17 Grubhub LIVE"; exit 0; fi
if [[ ! -f services/ai/co-pilot-service.ts ]]; then echo "STEP=18 AI Restaurant Co-Pilot"; exit 0; fi
if [[ ! -f services/marketplace/auto-vendor-service.ts ]]; then echo "STEP=19 Automated Vendor Marketplace"; exit 0; fi
if [[ ! -f services/voice/kitchen-voice-service.ts ]]; then echo "STEP=20 Voice-Activated Kitchen"; exit 0; fi
if [[ ! -f services/ai/camera-live-service.ts ]]; then echo "STEP=21 AI Camera LIVE"; exit 0; fi
if [[ ! -f services/ai/benchmark-2.0-service.ts ]]; then echo "STEP=22 Benchmark Network 2.0"; exit 0; fi
if [[ ! -f services/ai/network-effects-service.ts ]]; then echo "STEP=23 Restaurant Network Effects"; exit 0; fi
if [[ ! -f app/dashboard/enterprise/multi-location/page.tsx ]]; then echo "STEP=24 Multi-location Enterprise Dashboard"; exit 0; fi
if [[ ! -f services/inventory/auto-ordering-service.ts ]]; then echo "STEP=25 Advanced Inventory Auto-Ordering"; exit 0; fi
if [[ ! -f services/enterprise/franchise-service.ts ]]; then echo "STEP=26 Franchise Management Suite"; exit 0; fi
if [[ ! -f services/ai/co-pilot-autonomous-service.ts ]]; then echo "STEP=27 AI Co-Pilot 2.0"; exit 0; fi
if [[ ! -f app/dashboard/developers/page.tsx ]]; then echo "STEP=28 API Marketplace"; exit 0; fi
if [[ ! -f docs/hardware-partnership-program.md ]]; then echo "STEP=29 Hardware Partnership Program"; exit 0; fi
if [[ ! -f docs/support-tier-plan.md ]]; then echo "STEP=30 24/7 Support Tier"; exit 0; fi
if [[ ! -f docs/soc2-readiness-assessment.md ]]; then echo "STEP=31 SOC2 Type I readiness"; exit 0; fi
if [[ ! -f docs/sso-scim-live-plan.md ]]; then echo "STEP=32 SSO + SCIM LIVE"; exit 0; fi
if [[ ! -f docs/international-expansion-plan.md ]]; then echo "STEP=33 International Expansion"; exit 0; fi
if [[ ! -f services/loyalty/gift-cards-service.ts ]]; then echo "STEP=34 Gift Cards System"; exit 0; fi
if [[ ! -f docs/freemium-tier-plan.md ]]; then echo "STEP=35 Freemium Tier"; exit 0; fi
if [[ ! -f services/marketplace/instant-payouts-service.ts ]]; then echo "STEP=36 Instant Payouts for Vendors"; exit 0; fi
if [[ ! -f docs/native-mobile-app-plan.md ]]; then echo "STEP=37 Native Mobile App"; exit 0; fi
if [[ ! -f app/q/table/page.tsx ]]; then echo "STEP=38 QR Code Ordering for Tables"; exit 0; fi
if [[ ! -f services/analytics/profit-engine-service.ts ]]; then echo "STEP=39 Real-time Profit Engine"; exit 0; fi
if [[ ! -f services/ai/dynamic-pricing-service.ts ]]; then echo "STEP=40 AI-Powered Dynamic Pricing"; exit 0; fi

D=$(done_count)
if [[ "$D" -ge 40 ]] && [[ -f docs/market-domination.md ]]; then
  echo "STEP=NONE program complete ($D/40 features, final doc present)"
  exit 0
fi
if [[ "$D" -ge 40 ]]; then
  echo "STEP=41 FINAL — create docs/market-domination.md"
  exit 0
fi
echo "STEP=UNKNOWN tracker at $D/40 — inspect artifacts/domination-tracker.json"
