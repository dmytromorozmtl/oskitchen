# Multi-Location Dashboard 2.0 smoke setup (Era 136)

Era 136 certifies Multi-Location Dashboard 2.0 wiring: 100+ locations, paginated ranking, drill-down, and side-by-side comparison.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/enterprise/multi-location-service.ts` | Dashboard loader + view state parser |
| `lib/enterprise/multi-location-dashboard-2-builders.ts` | V2 builders — pagination, comparison, scale tier |
| `lib/enterprise/multi-location-dashboard-2-policy.ts` | Policy id, route, 100+ scale threshold |
| `app/dashboard/enterprise/multi-location/page.tsx` | Enterprise multi-location page |
| `components/enterprise/multi-location-enterprise-panel.tsx` | Ranking, comparison, drill-down UI |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:multi-location-dashboard-2-era136` | Full era136 cert + wiring audit |
| `npm run test:ci:multi-location-dashboard-2-era136` | Era136 + ENT-63 unit tests |
| `npm run test:ci:multi-location-dashboard-2-era136:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Enterprise → Multi-location** (`multi_location` plan required).
2. Review **Consolidated rollup** and **Revenue ranking**.
3. With 100+ locations — **Enterprise scale** badge appears; paginate ranking.
4. Set **compareA** / **compareB** query params — **Side-by-side comparison** with deltas.
5. Run `npm run smoke:multi-location-dashboard-2-era136` — artifact **PASSED**.

## Capabilities

| Capability | Implementation |
|------------|----------------|
| `pagination` | 25-row ranking pages, 50-row comparison table pages |
| `comparison` | `buildLocationComparisonPair` — revenue/orders/labor deltas |
| `drill-down` | `locationId` filter + per-location report links |
| `enterprise-scale` | Badge + tier at 100+ locations (max 500 certified) |

## Artifact

Summary written to `artifacts/multi-location-dashboard-2-smoke-summary.json` (gitignored).
