# Chef Role UI smoke setup (Era 129)

Era 129 certifies Chef Role UI wiring: line KPIs, kitchen briefing priorities, and production shortcuts.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/roles/chef-ui-service.ts` | Chef snapshot — kitchen briefing + production KPIs |
| `lib/roles/chef-ui-builders.ts` | KPI builders, shortcuts, snapshot assembly |
| `lib/roles/chef-ui-policy.ts` | Policy id, route, kitchen pack |
| `app/dashboard/roles/chef/page.tsx` | Chef role page with access gate |
| `components/roles/chef-role-panel.tsx` | KPIs, next action, tiles, shortcuts UI |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:chef-role-ui-era129` | Full era129 cert + wiring audit |
| `npm run test:ci:chef-role-ui-era129` | Era129 + chef role UI unit tests |
| `npm run test:ci:chef-role-ui-era129:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Roles → Chef** (kitchen/production permissions required).
2. Review **Chef command center** — readiness badge, line KPI cards.
3. Check **Next action**, **Priority tiles**, and **Top actions**.
4. Use **Chef shortcuts** — KDS, production view, expo, kitchen tablet.
5. Run `npm run smoke:chef-role-ui-era129` — artifact **PASSED**.

## Sections

| Section | Source |
|---------|--------|
| `kpis` | Production analytics — completion, delayed batches, packing |
| `briefing` | Kitchen daily briefing — hero tiles, top actions, next action |
| `shortcuts` | Line surfaces — KDS, production, expo, tablet |

## Artifact

Summary written to `artifacts/chef-role-ui-smoke-summary.json` (gitignored).
