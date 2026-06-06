# KDS Manager View smoke setup (Era 102)

Era 102 certifies manager view wiring: performance metrics, delay tracking, and efficiency scoring across the kitchen.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/kitchen/manager/page.tsx` | Manager view entry + permissions |
| `components/kitchen/manager-view-client.tsx` | Performance / delays / efficiency UI |
| `lib/kitchen/kds-manager-view.ts` | Snapshot builder from production + expo + queue |
| `lib/kitchen/kds-manager-view-policy.ts` | Route + component constants |
| `services/kitchen/manager-view-service.ts` | Data fetch + snapshot loader |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:kds-manager-view-era102` | Full era102 cert + wiring audit |
| `npm run test:ci:kds-manager-view-era102` | Era102 + manager view unit tests |
| `npm run test:ci:kds-manager-view-era102:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Kitchen → Manager**.
2. Queue and complete orders — verify **performance** cards (completed, on-time rate, efficiency score).
3. Let tickets go overdue — verify **delays** panel and manager **alerts**.
4. Run `npm run smoke:kds-manager-view-era102` — artifact **PASSED**.

## Pillars

| Pillar | Metrics |
|--------|---------|
| Performance | Completed today, avg ticket time, on-time rate, efficiency score |
| Delays | Overdue tickets, delayed expo, bottleneck, oldest wait |
| Efficiency | Ready/waiting backlog, in-progress items, kitchen ETA |

## Artifact

Summary written to `artifacts/kds-manager-view-smoke-summary.json` (gitignored).
