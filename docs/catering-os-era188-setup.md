# Catering OS setup (Era 188)

Era 188 certifies Catering OS wiring (Round 2): events, clients, packing, and routes modules — with canonical proof via era113 live smoke.

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
| `npm run smoke:catering-os-era188` | Full era188 cert + wiring audit |
| `npm run test:ci:catering-os-era188` | Era188 + era113 + catering OS unit tests |
| `npm run test:ci:catering-os-era188:cert` | Wiring cert only (CI gate) |
| `npm run smoke:catering-os-era113` | Canonical era113 smoke |

## Human activation

1. Open **Dashboard → Catering OS**.
2. Verify **four module cards** — Events, Clients, Packing, Routes.
3. Review **Upcoming events** and **Top clients** pipeline.
4. Check **Packing tasks** and **Route KPIs** for delivery events.
5. Run `npm run smoke:catering-os-era188` — artifact **PASSED**.

## Modules

| Module | Data source |
|--------|-------------|
| `events` | Upcoming catering quotes with event dates |
| `clients` | Active quote pipeline grouped by client |
| `packing` | Daily packing tasks and waves |
| `routes` | Route overview KPIs for delivery events |

## Artifact

Summary written to `artifacts/catering-os-era188-smoke-summary.json` (gitignored).

See also: [catering-os-era113-setup.md](./catering-os-era113-setup.md)
