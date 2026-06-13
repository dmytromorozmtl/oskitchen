# Competitor comparison pages (P1-27)

**Policy:** `competitor-comparison-pages-p1-27-v1`  
**Updated:** 2026-06-13  
**Audience:** Sales, marketing, founders — honest `/compare/*` pages for top incumbents

## Canonical routes

| Competitor | Path | Positioning section |
|------------|------|---------------------|
| Toast | `/compare/toast` | `ToastPositioningSection` |
| Square | `/compare/square` | `SquarePositioningSection` |
| Lightspeed | `/compare/lightspeed` | `LightspeedPositioningSection` |

Legacy alias: `/compare/kitchenos-vs-lightspeed` → `/compare/lightspeed` (same content).

## Honesty rules

- Feature matrices are **directional** — verify vendor plans before purchase.
- Each page includes **Choose X when** decision cards — no blanket "we win everything."
- Trademark disclaimers: **not affiliated** with Toast, Square, or Lightspeed.
- Integration and AI claims follow [`forbidden-claims-team-cheat-sheet.md`](./forbidden-claims-team-cheat-sheet.md).

Deep diligence: [`competitor-comparison-honest.md`](./competitor-comparison-honest.md)

## CI

```bash
npm run audit:competitor-comparison-pages
npm run check:competitor-comparison-pages
```

Policy: `competitor-comparison-pages-p1-27-v1`
