# P1-22 — Integration Health Center hero section

**Policy:** `integration-health-center-hero-p1-22-v1`  
**Registry:** [`artifacts/integration-health-center-hero-p1-22.json`](../artifacts/integration-health-center-hero-p1-22.json)

## Contract

Homepage (`app/page.tsx`) wires `LandingIntegrationHealthMoat` immediately after the hero via `afterHero`. The moat section includes:

1. **Live integration counter** — counts derived from `SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS` via `countSyncHealthMarketingMaturity()` (LIVE / BETA / SKIPPED / total).
2. **Health dashboard visual** — embedded `SyncHealthDashboardMarketing` (compact, illustrative sync health table).

CTA links to `/integration-health-center`.

## Verify

```bash
npm run check:integration-health-center-hero-p1-22
```
