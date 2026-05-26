# Distributed rate limiting — implementation notes

## Goals

- **Distributed** counters for public/beta traffic when Redis-compatible service is available.
- **Safe memory fallback** for local dev and emergency operation.
- **Provider-safe** webhook ceilings that only engage when a **distributed** adapter is active (avoid splitting Woo/Shopify retries across instances mid-window).

## Layout

| Path | Role |
|------|------|
| `lib/rate-limit/rate-limit.ts` | In-process fixed window (legacy + memory adapter backend) |
| `lib/rate-limit/rate-limit-policies.ts` | Named policies (`book_demo`, `webhook_ingest`, …) |
| `lib/rate-limit/rate-limit-keys.ts` | Stable hashed keys for buckets |
| `lib/rate-limit/rate-limit-adapter-types.ts` | Adapter interface |
| `lib/rate-limit/rate-limit-env.ts` | `RATE_LIMIT_ADAPTER`, Upstash env detection |
| `services/security/rate-limit-adapter.ts` | `getActiveRateLimitAdapter()`, `rateLimitProductionWarning()` |
| `services/security/rate-limit-memory-adapter.ts` | Wraps `checkRateLimit` |
| `services/security/rate-limit-tcp-redis-adapter.ts` | TCP Redis via `REDIS_URL` when `RATE_LIMIT_ADAPTER=redis` |
| `services/security/rate-limit-service.ts` | `consumeRateLimitToken`, `checkWebhookIngestDistributedLimit` |

## Environment

- `RATE_LIMIT_ADAPTER` — `memory` (default) | `upstash` | `redis`.
- **Upstash:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- **TCP Redis:** `REDIS_URL` when `RATE_LIMIT_ADAPTER=redis` (standard `redis` client; Node runtime only).

## Policies wired

- Public/support/beta/demo/sales forms → `consumeRateLimitToken` with IP- or user-based keys.
- Enterprise public API `POST /api/public/v1/orders` → `public_api_orders_post` policy.
- Webhooks → `checkWebhookIngestDistributedLimit` when the active adapter is **not** `memory` (Upstash or TCP Redis), using `webhookReceiverRateLimitKey(provider, connectionId, topic)` and a high `webhook_ingest` ceiling.

## Health / honesty

- `rateLimitProductionWarning()` returns a string in **production** when the selected distributed backend is missing or `memory` is explicitly used — surfaced on `/trust/status` and in `loadExtendedHealthSnapshot().rateLimit`.

## Tests

- `tests/unit/rate-limit.test.ts` — async memory path.
- `tests/unit/rate-limit-production-warning.test.ts` — production memory warning.
- Load / abuse characterization: `docs/RATE_LIMIT_LOAD_TEST.md`.
