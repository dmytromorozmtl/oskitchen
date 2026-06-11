# Square positioning (P1-75)

Blueprint task **P1-75** locks competitive messaging vs Square.

## Primary line

> **Enterprise features without enterprise contracts.**

Use on pricing, compare pages, and sales when operators outgrow counter-only Square but do not want a custom enterprise quote cycle.

## When Square wins (say aloud)

- Frictionless SMB signup and familiar counter POS for single-location cafés
- Cash App ecosystem and payments ubiquity for simple checkout-first operations
- Large app marketplace when kitchen depth can wait

Square® is **not affiliated** with OS Kitchen. **Verify** current Square plan limits and marketplace app fees — comparison reflects **typical** 2026 positioning.

## OS Kitchen wedges

| Wedge | Message |
|-------|---------|
| **Ops depth, self-serve** | Marketplace, KDS, production, invoice AI — no custom MSA to start |
| **Published pricing** | $49–$499/mo on `/pricing` — 14-day trial, cancel anytime |
| **Food fulfillment** | Meal prep routes, packing, Integration Health — not app sprawl |

## Comparison snapshot (typical)

| Dimension | Square | OS Kitchen |
|-----------|--------|------------|
| Signup friction | Very low | 14-day trial, self-serve |
| Production / KDS | Via apps | Native |
| Marketplace purchasing | ❌ | ✅ BETA |
| Invoice AI | ❌ | ✅ BETA |
| Enterprise quote required | Often for multi-location | Published tiers |

## Wired surfaces

- `/compare/square` — compare landing + positioning section
- `/pricing` — Square positioning section
- `lib/marketing/compare-content.ts` — square slug subheadline

## CI

```bash
npm run audit:square-positioning
npm run test:ci:square-positioning
```

Policy: `square-positioning-p1-75-v1`
