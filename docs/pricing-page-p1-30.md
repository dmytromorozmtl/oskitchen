# Pricing page — public Design Partner tier (P1-30)

**Policy:** `pricing-page-p1-30-v1`  
**Updated:** 2026-06-14  
**Route:** `/pricing`  
**Audience:** Prospects, sales, design partners — public pilot SKU alongside self-serve plans

## Design Partner tier

Test id: `pricing-design-partner-tier`  
SKU: `LOI-DP-001`

| Field | Value |
|-------|-------|
| Name | Design Partner |
| Price | $0 platform / 3-month LOI |
| Checkout | LOI via `/book-demo` — not Stripe self-serve |
| ICP | Meal prep, ghost kitchen, commissary, multi-brand delivery |

### Includes

- Dedicated staging workspace
- Weekly 30–45 min product feedback sync
- Launch wizard + Integration Health onboarding
- Roadmap influence for in-scope BETA / pilot_ready modules
- Non-binding — paid pilot SOW optional at term end

## Placement

Prominent card on `/pricing` immediately after the four self-serve plan cards (`DesignPartnerPricingTier`). Pilot SKU table remains in `PilotPricingSection` below.

## Honesty rules

- **Non-binding LOI** — ICP qualification required
- Do not imply LIVE fleet-wide integrations on the tier card
- Follow [`forbidden-claims-team-cheat-sheet.md`](./forbidden-claims-team-cheat-sheet.md)

## CI

```bash
npm run audit:pricing-page
npm run check:pricing-page
```

Policy: `pricing-page-p1-30-v1`
