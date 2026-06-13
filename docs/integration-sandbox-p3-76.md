# Integration sandbox mode (P3-76)

**Policy:** `integration-sandbox-p3-76-v1`  
**Department:** Backend  
**Upstream:** `integration-sandbox-p1-33-v1`  
**Registry:** [`artifacts/integration-sandbox-p3-76-registry.json`](../artifacts/integration-sandbox-p3-76-registry.json)

---

## Scope

| Tier | Coverage |
|------|----------|
| CLI registry | 18 LIVE integrations via `check:integration-sandbox` |
| Dashboard (wave 2) | Integration health → sandbox mode panel (configured/missing, no secrets) |
| Example env | `.env.integration-sandbox.example` documents all merchant test keys |

---

## Verify

```bash
npm run check:integration-sandbox
npm run check:integration-sandbox-p3-76
npm run audit:integration-sandbox-p3-76
npm run test:ci:integration-sandbox-p3-76:cert
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml` (P3-76 cert)

---

## Status

P1-33 credential registry + smoke fleet wired. P3-76 wave 2 surfaces sandbox readiness on `/dashboard/integrations/health` without exposing secret values.
