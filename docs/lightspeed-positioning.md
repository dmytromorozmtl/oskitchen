# Lightspeed positioning (P1-76)

Blueprint task **P1-76** locks competitive messaging vs Lightspeed.

## Primary line

> **Built for food operators.**

Use when prospects compare generic hospitality POS stacks to a platform designed for production, meal prep, and multi-channel food fulfillment.

## When Lightspeed wins (say aloud)

- Traditional dining-room POS, table service, and hospitality payments
- Front-of-house speed for full-service restaurants optimizing the floor
- Established hospitality hardware and payments relationships

Lightspeed® is **not affiliated** with OS Kitchen. **Verify** current Lightspeed plan limits and add-on fees — comparison reflects **typical** 2026 positioning.

## OS Kitchen wedges

| Wedge | Message |
|-------|---------|
| **Production-first** | Native production board, packing, routes, KDS — not floor POS plus spreadsheets |
| **Food verticals** | Meal prep, commissary, ghost kitchen, multi-brand command center |
| **Channel truth** | Integration Health for Shopify/WooCommerce/storefront — honest PASS/SKIPPED |

## Comparison snapshot (typical)

| Dimension | Lightspeed | OS Kitchen |
|-----------|------------|------------|
| Dining-room POS | Strong | Browser POS |
| Production / batch planning | Add-ons / limited | Native |
| Meal prep preorders | Add-ons | Native |
| Ghost kitchen multi-brand | Limited | Native |
| Recipe costing depth | Basic | Costing module (**BETA**) |

## Wired surfaces

- `/compare/lightspeed` — compare landing + positioning section (legacy alias: `/compare/kitchenos-vs-lightspeed`)
- `/pricing` — Lightspeed positioning section
- `lib/marketing/compare-content.ts` — lightspeed slug subheadline

## CI

```bash
npm run audit:lightspeed-positioning
npm run test:ci:lightspeed-positioning
```

Policy: `lightspeed-positioning-p1-76-v1`
