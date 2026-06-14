# Catering BEO format (P2-64)

**Policy:** `catering-beo-format-p2-64-v1`  
**Updated:** 2026-06-16  
**Tripleseat parity:** Banquet Event Order — layout, menu, and service timeline from catering quotes.

Gap closure for Catering task P2-64: generate printable BEO from accepted/in-progress quotes.

## BEO sections

| Section | Content |
|---------|---------|
| **Layout** | Service style, guest count, table configuration, venue, delivery/setup/staffing notes |
| **Menu** | Quote lines grouped by FOOD / BEVERAGE / SERVICE / RENTAL / etc. |
| **Timeline** | Load-out → arrive → setup → walkthrough → service → breakdown |

Route: `/dashboard/catering-quotes/[quoteId]/beo`

## Benchmark

10 quote scenarios with ground-truth section completeness (no DB in CI).

| Metric | Threshold |
|--------|-----------|
| Section completeness | ≥95% |
| Min timeline entries | 4 per BEO |

## CI

```bash
npm run check:catering-beo-format-p2-64
```

## Artifact

`artifacts/catering-beo-format-p2-64.json`
