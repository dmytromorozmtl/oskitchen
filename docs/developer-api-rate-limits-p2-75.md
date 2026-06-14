# Developer API rate limits + OpenAPI + sandbox (P2-75)

**Policy:** `developer-api-rate-limits-p2-75-v1`  
**Status:** **LIVE** — per-key limiting, OpenAPI spec, sandbox keys  
**Updated:** 2026-06-16

Gap closure: Developer API with per-key rate limiting, OpenAPI 3.0 spec, and sandbox environment.

## Per-key rate limiting

Dual-bucket enforcement on `/api/public/v1/*`:

| Bucket | Policy | Window | Max |
|--------|--------|--------|-----|
| Production key burst | `public_api_key_burst` | 60s | 600 |
| Sandbox key burst | `public_api_sandbox_key_burst` | 60s | 120 |
| Per-route GET | `public_api_v1_get` | 60s | 120 |
| Per-route POST | `public_api_v1_post` | 60s | 120 |

Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`.

## OpenAPI spec

- **Production:** `/api/openapi.json`
- OpenAPI 3.0.3 with bearer API key security
- Public v1 routes include 401, 403, 429, 503 responses
- Sandbox server URL included in `servers` array

## Sandbox keys

- Prefix: `kos_test_` (vs production `kos_`)
- Create via **Sandbox key** checkbox on `/dashboard/developer/api-keys`
- Lower burst limit (120/min) for safe integration testing
- Same `/api/public/v1/*` surface — tenant-scoped data

## Upstream

- [public-api-rate-limit-e2e-v1](../lib/api-public/public-api-rate-limit-e2e-policy.ts) — E2E rate limit policy

## CI

```bash
npm run check:developer-api-rate-limits-p2-75
```

## Artifact

`artifacts/developer-api-rate-limits-p2-75.json`
