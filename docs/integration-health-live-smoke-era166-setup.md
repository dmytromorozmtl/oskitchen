# Integration Health LIVE dashboard setup (Era 166)

Era 166 certifies the Integration Health LIVE dashboard with Round 2 fleet wiring: health scores, 7-day trends, and predictive alerts for all 18 LIVE surfaces (17 providers + dashboard).

## Dashboard surfaces

| Path | Role |
|------|------|
| `app/dashboard/integration-health/live/page.tsx` | LIVE Integration Health dashboard route |
| `services/integrations/integration-health-live-service.ts` | Health scores, trends, alerts loader |
| `components/integrations/integration-health-live-panel.tsx` | Fleet health UI panel |
| `lib/integrations/integration-health-live-policy.ts` | Dashboard policy + expected LIVE count |

## Round 2 fleet (era149–era165)

Each LIVE registry provider has a Round 2 wiring cert referenced in `INTEGRATION_HEALTH_LIVE_SMOKE_ERA166_PROVIDER_CERTS`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:integration-health-live-era166` | Full era166 cert + Round 2 fleet audit |
| `npm run smoke:integration-health-live-era166 -- --wiring-only` | Cert + wiring only (skip 17 provider runs) |
| `npm run test:ci:integration-health-live-smoke-era166` | Era166 + era91 + service tests |
| `npm run test:ci:integration-health-live-smoke-era166:cert` | Wiring cert only (CI gate) |

## Human activation

1. Confirm all 17 Round 2 provider wiring certs (era149–era165) exist in repo.
2. Open Dashboard → Integration Health → LIVE — verify health scores, trends, and alerts.
3. Run `npm run smoke:integration-health-live-era166` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `health_scores` | Per-integration health score + band |
| `trends` | 7-day sparkline + direction |
| `alerts` | Env missing, not connected, connection alerts |

## Artifact

Summary written to `artifacts/integration-health-live-smoke-era166-smoke-summary.json` (gitignored).

See also: [integration-health-live-smoke-setup.md](./integration-health-live-smoke-setup.md)
