# ICP landing pages (P1-79)

Blueprint task **P1-79** locks three canonical SEO landing routes for primary ICP segments.

## Canonical routes

| ICP segment | Path | Component |
|-------------|------|-----------|
| Meal prep | `/meal-prep-software` | `MealPrepSoftwareLanding` |
| Ghost kitchen | `/ghost-kitchen-software` | `GhostKitchenLanding` |
| Commissary | `/commissary-software` | `CommissaryKitchenSoftwareLanding` |

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
npm run test:ci:icp-landing-pages
```

Policy: `icp-landing-pages-p1-79-v1`
