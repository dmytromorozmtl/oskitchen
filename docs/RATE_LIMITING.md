# Rate limiting

KitchenOS uses a pluggable adapter selected by environment variables.

## Adapters

| Adapter | Env | File |
|---------|-----|------|
| Memory (default) | — | `services/security/rate-limit-memory-adapter.ts` |
| Upstash REST | `RATE_LIMIT_ADAPTER=upstash`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | `services/security/rate-limit-redis-adapter.ts` |
| TCP Redis | `RATE_LIMIT_ADAPTER=redis`, `REDIS_URL` | `services/security/rate-limit-tcp-redis-adapter.ts` |

Entry: `getActiveRateLimitAdapter()` in `services/security/rate-limit-adapter.ts`.  
Policies: `lib/rate-limit/rate-limit-policies.ts`.  
Consumption: `consumeRateLimitToken()` in `services/security/rate-limit-service.ts`.

## Production requirements

- Set **`RATE_LIMIT_ADAPTER=upstash`** (or `redis`) in staging/production.
- Run `npm run check-env` — warns when `NODE_ENV=production` and no distributed backend is configured (`rateLimitProductionWarning()`).
- Webhook ingest distributed limit (`checkWebhookIngestDistributedLimit`) is a **no-op** on memory adapter.

## Storefront

Additional limits: `lib/storefront/storefront-rate-limit.ts` (cart, checkout, contact, etc.).

## Public API

Policies: `public_api_orders_post`, `public_api_customers_get` (see route handlers under `app/api/public/v1/`).

## Verification

**Requires staging verification:** two app instances share the same counter when Upstash is configured.
