# Integration status page (P3-70)

**Policy:** `integration-status-page-p3-70-v1`  
**Department:** Marketing  
**Public URL:** `/status`  
**Upstream:** [`artifacts/live-integrations-staging-smoke-summary.json`](../artifacts/live-integrations-staging-smoke-summary.json) · [`docs/INTEGRATION_LAUNCH_STATUS.md`](./INTEGRATION_LAUNCH_STATUS.md)  
**Registry:** [`artifacts/integration-status-page-p3-70-registry.json`](../artifacts/integration-status-page-p3-70-registry.json)

---

## Public page

Honest integration status for **18 LIVE surfaces** (17 providers + Integration Health probe):

- **Platform health** — `/api/health` checks (app, database, observability)
- **Integration fleet** — per-channel staging smoke status (verified / monitoring pending / smoke failed)
- **No fake uptime %** — only staging smoke results until merchant credentials enable monitoring

Primary keyword: **integration status**

---

## Verify

```bash
npm run check:integration-status-page-p3-70
npm run audit:integration-status-page-p3-70
npm run test:ci:integration-status-page:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

---

## Status

Published — fleet data from last `smoke:live-integrations-staging` run. Most providers SKIPPED pending merchant credentials (June 2026).
