# Content marketing pipeline (P1-81)

Blueprint task **P1-81** locks a seven-post organic content calendar with ICP targeting, funnel stages, and claims governance.

## Pipeline summary

| # | Slug | ICP | Funnel | Status |
|---|------|-----|--------|--------|
| 1 | `meal-prep-order-queue-cut-packing-errors` | Meal prep | Consideration | Published |
| 2 | `how-to-start-meal-prep-business` | Meal prep | Awareness | Published |
| 3 | `restaurant-pos-comparison-2026` | Cross-ICP | Comparison | Published |
| 4 | `reduce-food-waste-with-production-planning` | Cross-ICP | Consideration | Published |
| 5 | `how-to-choose-restaurant-pos-2026` | Cross-ICP | Consideration | Published |
| 6 | `ghost-kitchen-setup-complete-guide` | Ghost kitchen | Awareness | Published |
| 7 | `commissary-kitchen-software-guide` | Commissary | Consideration | Published |

## Cadence

- **Target:** 2 posts per month after GSC verification (`docs/GSC_SETUP.md`)
- **Repurpose:** LinkedIn founder posts from each article H2 (`docs/linkedin-content-plan.md`)
- **Distribution:** `/blog` index, `/resources`, related articles footer

## Claims gate (every post)

Before publish:

1. Run `npm run audit:forbidden-claims-marketing-pages` — no SOC2/HIPAA/LIVE aggregator claims
2. Label **BETA** integrations and marketplace scaffold honestly
3. **Verify** competitor pricing and feature tiers — typical 2026 positioning only
4. No customer logos until signed LOI

## ICP → CTA mapping

| ICP segment | Primary CTA | Landing path |
|-------------|-------------|--------------|
| Meal prep | Start free trial | `/meal-prep-software` |
| Ghost kitchen | Book demo | `/ghost-kitchen-software` |
| Commissary | See commissary module | `/commissary-software` |
| Cross-ICP | Compare pricing | `/pricing` |

## CI

```bash
npm run audit:content-marketing-pipeline
npm run test:ci:content-marketing-pipeline
```

Policy: `content-marketing-pipeline-p1-81-v1`
