# LIVE Integration Health Dashboard

Phase 1 capstone — monitors every **LIVE** registry integration with health scores, 7-day trends, and predictive alerts.

## Route

`/dashboard/integration-health/live`

## Scoring

- **Connected integrations** use `services/integration-health/health-scoring-engine.ts` (connection status, sync freshness, webhook reliability).
- **Env-only rows** score platform `requiredEnv` readiness until a workspace connection exists.
- Fleet score is the average of all LIVE integration scores.

## Policy

- Policy id: `integration-health-live-dashboard-v1`
- Expected LIVE count: `LIVE_INTEGRATION_REGISTRY_LIVE_COUNT` (17)

## Files

- `services/integrations/integration-health-live-service.ts`
- `components/integrations/integration-health-live-panel.tsx`
- `app/dashboard/integration-health/live/page.tsx`
