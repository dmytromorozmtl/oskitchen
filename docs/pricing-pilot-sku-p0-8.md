# Pricing page — Design Partner Program pilot SKU (P0-8)

**Policy:** `p0-8-pricing-pilot-sku-v1`  
**Updated:** 2026-06-14  
**Route:** `/pricing`  
**Audience:** Prospects evaluating the public pilot offer before self-serve checkout

## Pilot SKU

| Field | Value |
|-------|-------|
| SKU | `LOI-DP-001` |
| Name | Design Partner Program |
| Headline | Design Partner Program — free for 90 days |
| Price | $0 platform / 90 days |
| Checkout | LOI via `/book-demo` — not Stripe self-serve |
| ICP | Meal prep, ghost kitchen, commissary, multi-brand delivery |

## Placement

- Hero card: `DesignPartnerPricingTier` (`data-testid="pricing-design-partner-tier"`)
- Pilot SKU table: `PilotPricingSection` — LOI-DP-001 row + highlight card
- FAQ JSON-LD: "What is the Design Partner Program?"

## Honesty rules

- **Non-binding LOI** — ICP qualification required
- Do not imply LIVE fleet-wide integrations on the tier card
- Follow [`forbidden-claims-team-cheat-sheet.md`](./forbidden-claims-team-cheat-sheet.md)

## CI

```bash
npm run check:pricing-pilot-sku-p0-8
npm run check:pricing-page
```
