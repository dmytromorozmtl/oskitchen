# Commissary OS setup (Era 187)

Era 187 certifies Commissary OS wiring (Round 2): production, purchasing, delivery, and distribution pillars — with canonical proof via era112 live smoke.

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
| `npm run smoke:commissary-os-era187` | Full era187 cert + wiring audit |
| `npm run test:ci:commissary-os-era187` | Era187 + era112 + commissary enterprise unit tests |
| `npm run test:ci:commissary-os-era187:cert` | Wiring cert only (CI gate) |
| `npm run smoke:commissary-os-era112` | Canonical era112 smoke |

## Human activation

1. Open **Dashboard → Enterprise → Commissary OS**.
2. Verify **four pillar cards** — Production, Purchasing, Delivery, Distribution.
3. Review **Commissary alerts** for overdue POs or route issues.
4. Check **Upcoming production** and **Recent transfers** sections.
5. Run `npm run smoke:commissary-os-era187` — artifact **PASSED**.

## Pillars

| Pillar | Data source |
|--------|-------------|
| `production` | Weekly production calendar tasks |
| `purchasing` | Open POs, reorder queue, overdue deliveries |
| `delivery` | Route overview KPIs |
| `distribution` | Pending transfers, location count |

## Artifact

Summary written to `artifacts/commissary-os-era187-smoke-summary.json` (gitignored).

See also: [commissary-os-era112-setup.md](./commissary-os-era112-setup.md)
