# KDS Manager View setup (Era 177)

Era 177 certifies KDS Manager View wiring (Round 2): performance, delays, and efficiency dashboard for kitchen managers — with canonical proof via era102 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `app/dashboard/kitchen/manager/page.tsx` | Manager view entry + permissions |
| `components/kitchen/manager-view-client.tsx` | Performance, delays, efficiency panels + alerts |
| `lib/kitchen/kds-manager-view.ts` | Snapshot builder — on-time rate, delays, efficiency score |
| `lib/kitchen/kds-manager-view-policy.ts` | Route + component constants |
| `services/kitchen/manager-view-service.ts` | Loader + snapshot export |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:kds-manager-view-era177` | Full era177 cert + wiring audit |
| `npm run test:ci:kds-manager-view-era177` | Era177 + era102 + manager view unit tests |
| `npm run test:ci:kds-manager-view-era177:cert` | Wiring cert only (CI gate) |
| `npm run smoke:kds-manager-view-era102` | Canonical era102 smoke |

## Human activation

1. Open **Dashboard → Kitchen → Manager**.
2. Queue orders and complete tickets — verify on-time rate and efficiency score update.
3. Trigger overdue tickets — confirm delays panel and manager alerts.
4. Run `npm run smoke:kds-manager-view-era177` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `performance_metrics` | Performance pillar in snapshot + UI |
| `delay_tracking` | `kds-manager-delays-panel` + overdue ticket list |
| `efficiency_score` | `efficiencyScore` + `kds-manager-efficiency-score` |
| `manager_alerts` | `kds-manager-alerts` panel |

## Artifact

Summary written to `artifacts/kds-manager-view-era177-smoke-summary.json` (gitignored).

See also: [kds-manager-view-era102-setup.md](./kds-manager-view-era102-setup.md)
