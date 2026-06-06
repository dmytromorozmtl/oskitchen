# Cashier Role UI smoke setup (Era 130)

Era 130 certifies Cashier Role UI wiring: register KPIs, cashier briefing priorities, and checkout shortcuts.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/roles/cashier-ui-service.ts` | Cashier snapshot — cashier briefing + today KPIs |
| `lib/roles/cashier-ui-builders.ts` | KPI builders, shortcuts, snapshot assembly |
| `lib/roles/cashier-ui-policy.ts` | Policy id, route, cashier pack |
| `app/dashboard/roles/cashier/page.tsx` | Cashier role page with access gate |
| `components/roles/cashier-role-panel.tsx` | KPIs, next action, tiles, shortcuts UI |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:cashier-role-ui-era130` | Full era130 cert + wiring audit |
| `npm run test:ci:cashier-role-ui-era130` | Era130 + cashier role UI unit tests |
| `npm run test:ci:cashier-role-ui-era130:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Roles → Cashier** (POS/order permissions required).
2. Review **Cashier command center** — readiness badge, register KPI cards.
3. Check **Next action**, **Priority tiles**, and **Top actions**.
4. Use **Cashier shortcuts** — POS terminal, tablet, mobile, cash management.
5. Run `npm run smoke:cashier-role-ui-era130` — artifact **PASSED**.

## Sections

| Section | Source |
|---------|--------|
| `kpis` | Today command center — transactions, orders, open shifts, revenue |
| `briefing` | Cashier daily briefing — hero tiles, top actions, next action |
| `shortcuts` | Register surfaces — terminal, tablet, mobile, cash, orders |

## Artifact

Summary written to `artifacts/cashier-role-ui-smoke-summary.json` (gitignored).
