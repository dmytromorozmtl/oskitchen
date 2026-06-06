# Franchise Management Suite smoke setup (Era 137)

Era 137 certifies Franchise Management Suite wiring: royalty tracking, compliance checklist, and rollout phases.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/enterprise/franchise-service.ts` | Dashboard loader, brand/menu settings |
| `lib/enterprise/franchise-suite-2-builders.ts` | V2 builders — compliance, royalty, rollout |
| `lib/enterprise/franchise-suite-2-policy.ts` | Policy id, route, rollout phases, compliance ids |
| `lib/enterprise/franchise-builders.ts` | V1 dashboard + v2 integration |
| `app/dashboard/enterprise/franchise/page.tsx` | Franchise suite page |
| `components/enterprise/franchise-suite-panel.tsx` | KPIs, rollout pipeline, unit table |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:franchise-suite-2-era137` | Full era137 cert + wiring audit |
| `npm run test:ci:franchise-suite-2-era137` | Era137 + ENT-64 unit tests |
| `npm run test:ci:franchise-suite-2-era137:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Enterprise → Franchise**.
2. Review KPIs — total royalties, compliance pass rate, certified units.
3. Inspect **Rollout pipeline** — discovery, training, go-live, certified counts.
4. Review unit table — royalty, menu compliance, rollout phase per franchisee.
5. Run `npm run smoke:franchise-suite-2-era137` — artifact **PASSED**.

## Capabilities

| Capability | Implementation |
|------------|----------------|
| `royalty` | `calculateRoyalties` + `buildFranchiseRoyaltyInsights` |
| `compliance` | 4-point checklist — menu, brand kit, royalty reporting, ops active |
| `rollout` | 4 phases — discovery → training → go-live → certified |

## Artifact

Summary written to `artifacts/franchise-suite-2-smoke-summary.json` (gitignored).
