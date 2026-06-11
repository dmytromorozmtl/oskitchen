# MarketMan positioning (P1-77)

Blueprint task **P1-77** locks competitive messaging vs MarketMan.

## Primary line

> **Full OS — including marketplace.**

Use when prospects compare inventory-only back-office tools to a platform that runs kitchen ops and supplier purchasing together.

## When MarketMan wins (say aloud)

- Mature invoice OCR and vendor item master depth
- Accounting-grade actual-vs-theoretical costing as the primary buying criteria
- Dedicated inventory back-office without needing POS or production in the same stack

MarketMan® is **not affiliated** with OS Kitchen. **Verify** current MarketMan OCR tiers and pricing — comparison reflects **typical** 2026 positioning.

## OS Kitchen wedges

| Wedge | Message |
|-------|---------|
| **Full OS** | POS, KDS, production, storefront — not inventory bolted beside your POS |
| **Marketplace included** | Compare suppliers, cart, PO inside OS Kitchen (**BETA**) |
| **Order-driven demand** | Shortage signals from today's tickets — not periodic counts alone |

## Comparison snapshot (typical)

| Dimension | MarketMan | OS Kitchen |
|-----------|-----------|------------|
| Invoice OCR | Mature OCR | Basic AP capture (**BETA** invoice scanner) |
| Actual vs theoretical | Core strength | AVT module |
| POS + storefront | Not primary | Included |
| B2B marketplace | ❌ | ✅ BETA |
| Order-driven production | Periodic counts | Order → production native |

## Wired surfaces

- `/compare/marketman` — compare landing + positioning section
- `/pricing` — MarketMan positioning section
- `lib/marketing/compare-content.ts` — marketman slug subheadline

## CI

```bash
npm run audit:marketman-positioning
npm run test:ci:marketman-positioning
```

Policy: `marketman-positioning-p1-77-v1`
