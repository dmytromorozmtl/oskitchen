# Transparent pricing tiers — Square parity (P0-9)

**Policy:** `p0-9-transparent-pricing-tiers-v1`  
**Updated:** 2026-06-14  
**Route:** `/pricing`

## Goal

Publish all four software tier prices on `/pricing` before signup — Square-style transparency with honest processing-fee separation.

## Published tiers

| Plan | Monthly | Limits (summary) | Checkout |
|------|---------|------------------|----------|
| Starter | $49 | 1 location · 100 orders/mo | 14-day trial |
| Pro | $79 | 1 location · 1,000 orders/mo | 14-day trial |
| Team | $199 | 3 locations · unlimited orders | 14-day trial |
| Enterprise | $499 | Unlimited | Contact sales / SOW |

Prices read from `PLAN_REGISTRY` via `TRANSPARENT_PRICING_TIER_STRIP`.

## UI surfaces

| Component | Purpose |
|-----------|---------|
| `TransparentPricingTiersBar` | All four prices at a glance (`data-testid="pricing-transparent-tiers-bar"`) |
| Plan cards | Detailed bullets + annual toggle |
| Feature comparison | Column headers include `$XX/mo` |
| `PricingProcessingFeesDisclosure` | Stripe processing separate from software |

## Square parity notes

- OS Kitchen publishes **full software list** on the website (Square often partial + payments-led)
- Processing fees disclosed separately (Stripe, not bundled)
- No mandatory hardware bundle

## CI

```bash
npm run check:pricing-transparent-tiers-p0-9
npm run test:ci:pricing-transparency-absolute-final
```
