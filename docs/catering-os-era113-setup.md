# Catering OS smoke setup (Era 113)

Era 113 certifies Catering OS wiring: events, clients, packing, and routes modules on one dashboard.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/catering/catering-os-service.ts` | Dashboard loader — quotes, packing, routes |
| `lib/catering/catering-os-builders.ts` | Four module builders, alerts, dashboard assembly |
| `lib/catering/catering-os-policy.ts` | Policy id and route |
| `app/dashboard/catering/page.tsx` | Catering OS page |
| `components/catering/catering-os-panel.tsx` | Module cards, events, clients, pipeline |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:catering-os-era113` | Full era113 cert + wiring audit |
| `npm run test:ci:catering-os-era113` | Era113 + catering OS unit tests |
| `npm run test:ci:catering-os-era113:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Catering OS**.
2. Verify **four module cards** — Events, Clients, Packing, Routes.
3. Review **Upcoming events** and **Top clients** pipeline.
4. Check **Packing tasks** and **Route KPIs** for delivery events.
5. Run `npm run smoke:catering-os-era113` — artifact **PASSED**.

## Modules

| Module | Data source |
|--------|-------------|
| `events` | Upcoming catering quotes with event dates |
| `clients` | Active quote pipeline grouped by client |
| `packing` | Daily packing tasks and waves |
| `routes` | Route overview KPIs for delivery events |

## Artifact

Summary written to `artifacts/catering-os-smoke-summary.json` (gitignored).
