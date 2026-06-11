# Toast positioning (P1-74)

Blueprint task **P1-74** locks competitive messaging vs Toast POS.

## Primary line

> **Hardware shouldn't lock you in.**

Use on pricing, compare pages, and sales conversations when Toast terminal bundles come up.

## When Toast wins (say aloud)

- Certified field hardware and local support for full-service restaurants
- Mature floor plans and payments-first rollout with minimal engineering
- Established US restaurant partner marketplace

Toast® is **not affiliated** with OS Kitchen. **Verify** current Toast pricing and hardware bundles before purchase — figures below reflect **typical** 2026 positioning.

## OS Kitchen wedges

| Wedge | Message |
|-------|---------|
| **BYO hardware** | Browser POS on iPad/Android — no Toast Go / Flex required |
| **No lease bundle** | Month-to-month software; optional Stripe Terminal (~$59) vs ~$799 proprietary terminal |
| **Honest ops truth** | Integration Health shows SKIPPED / **BETA** — not fake green tiles |

## Comparison table (typical)

| Dimension | Toast | OS Kitchen |
|-----------|-------|------------|
| Hardware lock-in | Proprietary terminal + lease typical | None — browser-first |
| Terminal cost | ~$799 proprietary | $0 required; optional Stripe M2 |
| Use existing iPad | Toast Go / Flex preferred | Any modern browser tablet |
| Month-to-month | Often bundled with hardware | Cancel anytime |

See also: [`docs/no-hardware-lock-in-positioning.md`](no-hardware-lock-in-positioning.md)

## Wired surfaces

- `/compare/toast` — full compare landing + positioning section
- `/pricing` — Toast positioning section below competitor benchmark
- `lib/marketing/compare-content.ts` — toast slug subheadline

## CI

```bash
npm run audit:toast-positioning
npm run test:ci:toast-positioning
```

Policy: `toast-positioning-p1-74-v1`
