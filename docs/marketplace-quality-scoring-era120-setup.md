# Marketplace Quality Scoring smoke setup (Era 120)

Era 120 certifies Marketplace Quality Scoring wiring: supplier ratings across four dimensions with tier rankings and alerts.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/marketplace/quality-scoring.ts` | Snapshot loader, review aggregates, pending reviews |
| `lib/marketplace/quality-scoring-builders.ts` | Supplier scores, tier resolution, alerts, snapshot |
| `lib/marketplace/quality-scoring-policy.ts` | Policy id, dimensions, tier thresholds |
| `app/dashboard/marketplace/quality/page.tsx` | Quality Scoring page |
| `components/marketplace/quality-scoring-panel.tsx` | Score cards, supplier list, pending reviews |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:marketplace-quality-scoring-era120` | Full era120 cert + wiring audit |
| `npm run test:ci:marketplace-quality-scoring-era120` | Era120 + quality scoring unit tests |
| `npm run test:ci:marketplace-quality-scoring-era120:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Marketplace → Quality Scoring**.
2. Review **workspace supplier scores** — Quality, Accuracy, Delivery, Packaging.
3. Check **tier badges** — Excellent (4.5+), Good, Watch, Avoid.
4. Submit **pending reviews** for delivered POs without ratings.
5. Run `npm run smoke:marketplace-quality-scoring-era120` — artifact **PASSED**.

## Dimensions & tiers

| Dimension | Source field |
|-----------|--------------|
| `quality` | `qualityScore` |
| `accuracy` | `accuracyScore` |
| `delivery` | `deliveryScore` |
| `packaging` | `packagingScore` |

Tiers: **excellent** ≥4.5 · **good** ≥4.0 · **watch** ≥3.5 · **avoid** below · **unrated** no reviews.

## Artifact

Summary written to `artifacts/marketplace-quality-scoring-smoke-summary.json` (gitignored).
