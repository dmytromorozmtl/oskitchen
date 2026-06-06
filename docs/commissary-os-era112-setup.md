# Commissary OS smoke setup (Era 112)

Era 112 certifies Commissary OS wiring: production, purchasing, delivery, and distribution pillars on one enterprise dashboard.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/enterprise/commissary-service.ts` | Dashboard loader — production calendar, transfers, routes, POs |
| `lib/enterprise/commissary-builders.ts` | Four pillar builders, alerts, dashboard assembly |
| `lib/enterprise/commissary-policy.ts` | Policy id and route |
| `app/dashboard/enterprise/commissary/page.tsx` | Commissary OS page |
| `components/enterprise/commissary-enterprise-panel.tsx` | Pillar cards, alerts, transfers, production |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:commissary-os-era112` | Full era112 cert + wiring audit |
| `npm run test:ci:commissary-os-era112` | Era112 + commissary enterprise unit tests |
| `npm run test:ci:commissary-os-era112:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Enterprise → Commissary OS**.
2. Verify **four pillar cards** — Production, Purchasing, Delivery, Distribution.
3. Review **Commissary alerts** for overdue POs or route issues.
4. Check **Upcoming production** and **Recent transfers** sections.
5. Run `npm run smoke:commissary-os-era112` — artifact **PASSED**.

## Pillars

| Pillar | Data source |
|--------|-------------|
| `production` | Weekly production calendar tasks |
| `purchasing` | Open POs, reorder queue, overdue deliveries |
| `delivery` | Route overview KPIs |
| `distribution` | Pending transfers, location count |

## Artifact

Summary written to `artifacts/commissary-os-smoke-summary.json` (gitignored).
