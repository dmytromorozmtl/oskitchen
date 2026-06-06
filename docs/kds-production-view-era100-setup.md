# KDS Production View smoke setup (Era 100)

Era 100 certifies production view wiring: station load, bottleneck detection, and kitchen ETA across active prep tickets.

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
| `npm run smoke:kds-production-view-era100` | Full era100 cert + wiring audit |
| `npm run test:ci:kds-production-view-era100` | Era100 + production view unit tests |
| `npm run test:ci:kds-production-view-era100:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Kitchen → Production**.
2. Queue POS or channel orders — verify tickets appear on station cards with load %.
3. Confirm **bottleneck** badge on the busiest station when load is uneven.
4. Run `npm run smoke:kds-production-view-era100` — artifact **PASSED**.

## Snapshot fields

| Field | Meaning |
|-------|---------|
| `totalActive` | Active prep tickets across all stations |
| `bottleneckStation` | Highest load-score station |
| `kitchenEtaMinutes` | Max estimated clear time across stations |
| `stations[].loadPercent` | Relative station load (0–100) |

## Artifact

Summary written to `artifacts/kds-production-view-smoke-summary.json` (gitignored).
