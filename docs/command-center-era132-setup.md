# Command Center smoke setup (Era 132)

Era 132 certifies Command Center wiring: Bloomberg-style terminal with five metric lanes and alerts.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/command-center/command-center-service.ts` | Snapshot — executive, today, routes, forecast |
| `lib/command-center/command-center-builders.ts` | Tickers, lanes, alerts, snapshot assembly |
| `lib/command-center/command-center-policy.ts` | Policy id, route, lane ids |
| `app/dashboard/command-center/page.tsx` | Command Center page with owner gate |
| `components/command-center/command-center-panel.tsx` | Terminal UI — lanes, tickers, alerts |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:command-center-era132` | Full era132 cert + wiring audit |
| `npm run test:ci:command-center-era132` | Era132 + command center unit tests |
| `npm run test:ci:command-center-era132:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Command Center** (owner/leadership access required).
2. Review **OS Kitchen Terminal** — workspace, date range, ticker count.
3. Scan five lanes — **MARKET**, **OPS**, **LIVE**, **FCST**, **ROLES**.
4. Inspect **ALERTS** — blockers, executive warnings, forecast notes.
5. Run `npm run smoke:command-center-era132` — artifact **PASSED**.

## Lanes

| Lane | Source |
|------|--------|
| `market` | Executive overview — revenue, orders, AOV, top channel |
| `operations` | Production, packing, delivery, kitchen queue |
| `live` | Today KPIs — revenue, orders, active orders, routes |
| `forecast` | Forecasting 2.0 — 90d orders/revenue, holidays |
| `roles` | Role UI shortcuts — owner, manager, chef, cashier, driver |

## Artifact

Summary written to `artifacts/command-center-smoke-summary.json` (gitignored).
