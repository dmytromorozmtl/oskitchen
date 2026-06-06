# Driver Role UI smoke setup (Era 131)

Era 131 certifies Driver Role UI wiring: route KPIs, delivery signal priorities, and dispatch shortcuts.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/roles/driver-ui-service.ts` | Driver snapshot — route KPIs + on-time rate |
| `lib/roles/driver-ui-builders.ts` | KPI builders, hero tiles, shortcuts, snapshot assembly |
| `lib/roles/driver-ui-policy.ts` | Policy id, route, driver pack |
| `app/dashboard/roles/driver/page.tsx` | Driver role page with access gate |
| `components/roles/driver-role-panel.tsx` | KPIs, next action, tiles, shortcuts UI |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:driver-role-ui-era131` | Full era131 cert + wiring audit |
| `npm run test:ci:driver-role-ui-era131` | Era131 + driver role UI unit tests |
| `npm run test:ci:driver-role-ui-era131:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Roles → Driver** (route/delivery permissions required).
2. Review **Driver command center** — readiness badge, route KPI cards.
3. Check **Next action**, **Priority tiles**, and **Top actions**.
4. Use **Driver shortcuts** — today's route, fleet map, packing, driver mode.
5. Run `npm run smoke:driver-role-ui-era131` — artifact **PASSED**.

## Sections

| Section | Source |
|---------|--------|
| `kpis` | Route overview + delivery analytics — routes, stops, on-time rate |
| `briefing` | Delivery signals — hero tiles, top actions, next action |
| `shortcuts` | Dispatch surfaces — routes, fleet, packing, driver mode |

## Artifact

Summary written to `artifacts/driver-role-ui-smoke-summary.json` (gitignored).
