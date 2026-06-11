# Positioning reformulation (P1-72)

Blueprint task **P1-72** locks the canonical positioning line for sales, marketing, and product copy.

## Primary positioning line

> **Built for operators who need more than Square but can't afford Toast's hardware lock-in.**

Use this line on home, pricing decks, and outbound — not as a feature claim, but as ICP framing.

## Narrative frame

| Competitor | Gap OS Kitchen fills |
|------------|----------------------|
| **Square** | Counter POS stops at payments — no marketplace, invoice AI, or multi-brand ops depth |
| **Toast** | Full-stack depth, but proprietary terminal bundles and multi-year hardware leases |
| **OS Kitchen** | Full operating layer on hardware you already own, with honest Integration Health |

## Supporting pillars

1. **More than Square** — Enterprise depth without enterprise contracts or add-on sprawl.
2. **Without Toast lock-in** — Browser-first POS, optional Stripe Terminal, cancel anytime.
3. **Honest ops truth** — Integration Health shows PASS, SKIPPED, or FAILED — not fake green tiles.

## ICP

Meal prep, ghost kitchens, commissaries, and multi-concept operators outgrowing spreadsheets but not ready for a Toast hardware bundle.

## Honesty guardrails

- Do not claim live DoorDash / Uber Eats without partner credentials — label partner-gated; not live today without smoke PASS.
- Do not claim SOC 2 / enterprise SSO — use BETA / roadmap language from `docs/feature-maturity-matrix.md`.
- Hardware: browser-first, no hardware lock-in — see `docs/no-hardware-lock-in-positioning.md`.

## Wired surfaces

- `components/marketing/positioning-reformulation-strip.tsx` — home hero strip
- `components/marketing/home-landing.tsx` — `/` landing
- `docs/POSITIONING.md` — legacy positioning doc (updated)
- `lib/marketing/positioning-reformulation-content.ts` — content constants

## CI

```bash
npm run audit:positioning-reformulation
npm run test:ci:positioning-reformulation
```

Policy: `positioning-reformulation-p1-72-v1`
