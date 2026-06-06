# KDS Production View setup (Era 175)

Era 175 certifies KDS Production View wiring (Round 2): station load, bottleneck detection, and kitchen ETA across active prep tickets — with canonical proof via era100 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/kitchen/production/page.tsx` | Production view entry + permissions |
| `components/kitchen/production-view-client.tsx` | Station cards, load %, bottleneck badge, ETA |
| `lib/kitchen/kds-production-view.ts` | Snapshot builder — load score, bottleneck, ETA |
| `lib/kitchen/kds-production-view-policy.ts` | Route + component constants |
| `services/kitchen/production-view-service.ts` | Loader export |
| `services/kitchen/multi-station-service.ts` | Work item fetch + multi-station routing |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:kds-production-view-era175` | Full era175 cert + wiring audit |
| `npm run test:ci:kds-production-view-era175` | Era175 + era100 + production view unit tests |
| `npm run test:ci:kds-production-view-era175:cert` | Wiring cert only (CI gate) |
| `npm run smoke:kds-production-view-era100` | Canonical era100 smoke |

## Human activation

1. Open **Dashboard → Kitchen → Production**.
2. Queue POS or channel orders — verify tickets appear on station cards with load %.
3. Confirm **bottleneck** badge on the busiest station when load is uneven.
4. Run `npm run smoke:kds-production-view-era175` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `station_load` | `kds-production-station-card` load % per station |
| `bottleneck_detection` | `bottleneckStation` + Bottleneck badge UI |
| `kitchen_eta` | `kitchenEtaMinutes` in snapshot + client |
| `multi_station_routing` | `multi-station-service.ts` + `loadKdsProductionView` |

## Artifact

Summary written to `artifacts/kds-production-view-era175-smoke-summary.json` (gitignored).

See also: [kds-production-view-era100-setup.md](./kds-production-view-era100-setup.md)
