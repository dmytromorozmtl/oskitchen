# P1-20 — Production cron heartbeat monitoring

**Policy:** `p1-20-cron-heartbeat-monitoring-v1`  
**Registry:** [`artifacts/cron-heartbeat-monitoring-p1-20.json`](../artifacts/cron-heartbeat-monitoring-p1-20.json)

## Contract

`GET /api/health` exposes `checks.cronExecution.ok`. When any critical production cron heartbeat is **stale** or **failing**, `ok` is `false` and the endpoint returns **503 degraded**.

Critical slugs (fast-running schedulers):

- `webhook-jobs`
- `storefront-edge-sync`
- `storefront-cart-recovery`
- `doordash-sync`
- `grubhub-sync`
- `kds-overdue-alerts`

Evidence is loaded via `loadCriticalCronExecutionHealth()` → `summarizeCriticalCronExecutionEvidence()`.

## Verify

```bash
npm run check:cron-heartbeat-monitoring-p1-20
npm run validate:production-crons
```
