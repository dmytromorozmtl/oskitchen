# Public POST abuse review (Era 17)

**Policy:** `era17-public-post-abuse-v1`  
**Status:** `p1_public_post_guards_expanded` — six high-risk routes hardened in Cycle 23

## Scope

Rate-limit or guard **P1 public POST surfaces** that were missing abuse controls. Does **not** add global webhook rate limits (provider retries must not be blocked).

## Hardened routes (Cycle 23)

| Route | Guard | Policy |
|-------|-------|--------|
| `POST /api/storefront/experiment/auto-conclude/approve` | `enforceStorefrontRouteRateLimit` | `storefront_experiment_api` |
| `POST /api/storefront/experiment/auto-conclude/reject` | same | same |
| `POST /api/storefront/experiment/orchestrator/approve` | same (POST added; GET already guarded) | same |
| `POST /api/iot/temperature` | `requireIngestBearerSecret` + `enforceIngestRateLimit` | `iot_ingest` |
| `POST /api/billing/portal` | `enforceBillingApiRateLimit` | `billing_portal` |
| `POST /api/billing-portal` | same (legacy alias) | `billing_portal` |

Matrix source: `lib/security/public-post-abuse-matrix.ts`

## Limitations

- No DDoS / WAF parity claim
- Webhooks remain signature-first (see `docs/PUBLIC_POST_RATE_LIMITING.md`)
- In-memory rate counters reset on cold start until Redis/Upstash configured

## Validation

```bash
npm run test:ci:public-post-abuse-era17:cert
npm run test:ci:public-post-fail-closed
```
