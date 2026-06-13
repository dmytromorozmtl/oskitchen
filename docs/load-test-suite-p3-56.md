# Load test suite (P3-56)

**Policy:** `load-test-suite-p3-56-v1`  
**Department:** QA  
**Registry:** [`artifacts/load-test-suite-p3-56-registry.json`](../artifacts/load-test-suite-p3-56-registry.json)

---

## Scope

Three k6 load scenarios:

| Module | Script | Target | VUs | p95 SLA |
|--------|--------|--------|-----|---------|
| **Webhook burst** | `scripts/load/webhook-burst-p3-56.k6.js` | `/api/webhooks/woocommerce` | 20 | 2000ms |
| **KDS refresh** | `scripts/load/kds-refresh-p3-56.k6.js` | `/api/health` (poll cadence) | 15 | 1500ms |
| **POS checkout concurrency** | `scripts/load/pos-checkout-concurrency-p3-56.k6.js` | `/api/pos/terminal` | 8 | 3000ms |

Unsigned webhook and unauthenticated POS probes must fail fast (401/400/404) — never 500.

---

## Run

```bash
npm run check:load-test-suite-p3-56
npm run audit:load-test-suite-p3-56
BASE_URL=http://localhost:3000 npm run test:k6:load-webhook-burst-p3-56
BASE_URL=http://localhost:3000 npm run test:k6:load-kds-refresh-p3-56
BASE_URL=http://localhost:3000 npm run test:k6:load-pos-checkout-p3-56
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`
