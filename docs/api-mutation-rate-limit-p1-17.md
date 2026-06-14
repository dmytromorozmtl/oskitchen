# P1-17 — API mutation route rate limits

**Policy:** `p1-17-api-mutation-rate-limit-v1`

All `/api` mutation handlers (POST/PUT/PATCH/DELETE) must be rate-limited via one of:

| Coverage | Mechanism |
|----------|-----------|
| `middleware` | Edge `enforceApiMutationRateLimitMiddleware` → `enforceApiRateLimit` |
| `dedicated` | Route-level `enforceApiRateLimit`, `enforceRateLimit`, storefront/public API guards |
| `exempt_class` | Webhook IP ingest, cron secret, storefront, public API key stacks |

## Audit

```bash
npm run audit:api-mutation-rate-limit          # assert 0 uncovered
npm run audit:api-mutation-rate-limit:write    # refresh artifacts
npm run check:api-mutation-rate-limit-p1-17    # P1-17 policy gate (CI)
```

**Target:** `uncoveredMutationRoutes === 0`

Artifacts:

- `artifacts/api-mutation-rate-limit-audit.json` — full route matrix
- `artifacts/api-mutation-rate-limit-p1-17.json` — P1-17 summary

## Middleware

`middleware.ts` calls `enforceApiMutationRateLimitMiddleware` for every non-exempt mutation under `/api/*`.
