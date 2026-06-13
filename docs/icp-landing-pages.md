# ICP landing pages (P1-79 + P1-23)

Blueprint tasks **P1-79** (canonical routes) and **P1-23** (pilot highlights on meal prep + ghost kitchen) lock SEO landing routes for primary ICP segments.

## Canonical routes

| ICP segment | Path | Component |
|-------------|------|-----------|
| Meal prep | `/meal-prep-software` | `MealPrepSoftwareLanding` |
| Ghost kitchen | `/ghost-kitchen-software` | `GhostKitchenLanding` |
| Commissary | `/commissary-software` | `CommissaryKitchenSoftwareLanding` |

## P1-23 pilot highlights (meal prep + ghost kitchen)

Both `/meal-prep-software` and `/ghost-kitchen-software` include an `IcpPilotHighlightsSection` after the hero:

- **18 LIVE integrations** — channel scaffold with per-workspace PASS/SKIPPED/FAILED in Integration Health
- **Kitchen Display (KDS)** — bump tickets from every channel into one kitchen screen
- **Profit engine** — brand P&L snapshots and food-cost signals tied to today's orders

Policy: `icp-pilot-highlights-p1-23-v1`

## Legacy redirects

| Legacy path | Redirects to |
|-------------|--------------|
| `/landing/ghost-kitchen` | `/ghost-kitchen-software` |
| `/commissary-kitchen-software` | `/commissary-software` |

## Honesty

All three landings include **Honest limitations** sections with BETA labels — no fake LIVE badges or marketplace parity claims.

## CI

```bash
npm run audit:icp-landing-pages
npm run check:icp-landing-pages
npm run test:ci:icp-landing-pages
```

Policy: `icp-landing-pages-p1-79-v1` + `icp-pilot-highlights-p1-23-v1`
