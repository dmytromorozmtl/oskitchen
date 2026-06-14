# Maintenance mode panel perf budget (P2-53)

**Policy:** `maintenance-mode-panel-perf-budget-p2-53-v1`  
**LHCI:** `lighthouserc.maintenance-mode-panel.cjs`

Gap P2-53 adds a Lighthouse perf budget for dashboard pages hosting `MaintenanceModePanel`.

## Host pages

| Path | Panel variant |
|------|---------------|
| `/dashboard/today` | compact (owner briefing) |
| `/platform/implementations` | platform |

## Budget thresholds (dashboard)

| Metric | Max |
|--------|-----|
| FCP | 2500 ms |
| LCP | 4000 ms |
| CLS | 0.1 |
| TBT | 350 ms |
| Performance score | ≥ 0.85 |

Component wiring: `data-testid="maintenance-mode-panel"`, lazy-loaded platform sections via `next/dynamic`.

## CI wiring check

```bash
npm run check:maintenance-mode-panel-perf-budget-p2-53
```

## Live LHCI (authed dashboard)

Host pages require session cookies. Run against a staging server with auth:

```bash
E2E_MAINTENANCE_MODE_PANEL_PERF=true \
E2E_LOGIN_EMAIL=… E2E_LOGIN_PASSWORD=… \
LHCI_BASE_URL=https://staging.example.com \
npm run lighthouse:maintenance-mode-panel
```

Contract tests run in CI without live LHCI.

## Artifact

`artifacts/maintenance-mode-panel-perf-budget-p2-53.json`
