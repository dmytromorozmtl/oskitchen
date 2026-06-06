# Owner Role UI smoke setup (Era 127)

Era 127 certifies Owner Role UI wiring: leadership KPIs, briefing priorities, and strategic shortcuts.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/roles/owner-ui-service.ts` | Owner snapshot — briefing + executive KPIs |
| `lib/roles/owner-ui-builders.ts` | KPI builders, shortcuts, snapshot assembly |
| `lib/roles/owner-ui-policy.ts` | Policy id, route, owner pack |
| `app/dashboard/roles/owner/page.tsx` | Owner role page with access gate |
| `components/roles/owner-role-panel.tsx` | KPIs, next action, tiles, shortcuts UI |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:owner-role-ui-era127` | Full era127 cert + wiring audit |
| `npm run test:ci:owner-role-ui-era127` | Era127 + owner role UI unit tests |
| `npm run test:ci:owner-role-ui-era127:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Roles → Owner** (owner role required).
2. Review **Owner command center** — readiness badge, KPI cards.
3. Check **Next action**, **Priority tiles**, and **Top actions**.
4. Use **Owner shortcuts** — executive, analytics suite, integration health.
5. Run `npm run smoke:owner-role-ui-era127` — artifact **PASSED**.

## Sections

| Section | Source |
|---------|--------|
| `kpis` | Executive overview — revenue, orders, customers, production |
| `briefing` | Owner daily briefing — hero tiles, top actions, next action |
| `shortcuts` | Leadership surfaces — executive, analytics, integrations |

## Artifact

Summary written to `artifacts/owner-role-ui-smoke-summary.json` (gitignored).
