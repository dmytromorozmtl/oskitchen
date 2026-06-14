# P1-21 — Rate-limit regression (200+ requests / 60s → 429)

**Policy:** `rate-limit-regression-p1-21-v1`  
**Registry:** [`artifacts/rate-limit-regression-p1-21.json`](../artifacts/rate-limit-regression-p1-21.json)

## Contract

Production `api_mutation` policy: **120 requests / 60 seconds** (`lib/rate-limit/rate-limit-policies.ts`).

Regression sends **201 mutation requests** (200+) to a priority route and expects **429** on request **121**.

P1-18 retains a fast N+1 smoke (6 requests, simulated max 5) for CI speed on all priority routes.

## Verify

```bash
npm run check:rate-limit-regression-p1-21
npm run check:rate-limit-regression
```
