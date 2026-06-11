# MarginEdge positioning (P1-78)

Blueprint task **P1-78** locks competitive messaging vs MarginEdge.

## Primary line

> **Invoice AI is a feature, not a product.**

Use when prospects treat invoice OCR as a standalone category instead of one module inside kitchen operations.

## When MarginEdge wins (say aloud)

- Dedicated invoice OCR and price-variance alert depth
- AP workflows when finance-led teams only buy invoice automation
- Food-cost analytics as the primary product, not ops execution

MarginEdge® is **not affiliated** with OS Kitchen. **Verify** current MarginEdge OCR accuracy tiers and pricing — comparison reflects **typical** 2026 positioning.

## OS Kitchen wedges

| Wedge | Message |
|-------|---------|
| **Feature, not product** | BETA invoice scanner inside POS, KDS, and production — not another SKU |
| **Ops-native costing** | Food cost tied to today's tickets and production board |
| **Full stack** | Storefront, marketplace, and order hub included |

## Comparison snapshot (typical)

| Dimension | MarginEdge | OS Kitchen |
|-----------|------------|------------|
| Invoice OCR | Core product | BETA module inside OS |
| Price variance alerts | ✅ Strong | Growing AP capture |
| POS + KDS | ❌ Not primary | ✅ Included |
| Production board | ❌ | ✅ Native |
| B2B marketplace | ❌ | ✅ BETA |

## Wired surfaces

- `/compare/marginedge` — compare landing + positioning section
- `/pricing` — MarginEdge positioning section
- `lib/marketing/compare-content.ts` — marginedge slug subheadline

## CI

```bash
npm run audit:marginedge-positioning
npm run test:ci:marginedge-positioning
```

Policy: `marginedge-positioning-p1-78-v1`
