# Manager Role UI smoke setup (Era 128)

Era 128 certifies Manager Role UI wiring: operational KPIs, shift briefing priorities, and floor shortcuts.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/roles/manager-ui-service.ts` | Manager snapshot — briefing + executive KPIs |
| `lib/roles/manager-ui-builders.ts` | KPI builders, shortcuts, snapshot assembly |
| `lib/roles/manager-ui-policy.ts` | Policy id, route, manager pack |
| `app/dashboard/roles/manager/page.tsx` | Manager role page with access gate |
| `components/roles/manager-role-panel.tsx` | KPIs, next action, tiles, shortcuts UI |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:manager-role-ui-era128` | Full era128 cert + wiring audit |
| `npm run test:ci:manager-role-ui-era128` | Era128 + manager role UI unit tests |
| `npm run test:ci:manager-role-ui-era128:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Roles → Manager** (manager or operational permissions required).
2. Review **Manager command center** — readiness badge, operational KPI cards.
3. Check **Next action**, **Priority tiles**, and **Top actions**.
4. Use **Manager shortcuts** — KDS manager, today, packing, labor.
5. Run `npm run smoke:manager-role-ui-era128` — artifact **PASSED**.

## Sections

| Section | Source |
|---------|--------|
| `kpis` | Executive overview — orders, late orders, production/packing/delivery |
| `briefing` | Manager daily briefing — hero tiles, top actions, next action |
| `shortcuts` | Shift operations — KDS manager, today, packing |

## Artifact

Summary written to `artifacts/manager-role-ui-smoke-summary.json` (gitignored).
