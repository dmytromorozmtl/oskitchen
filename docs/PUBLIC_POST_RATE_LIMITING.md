# Public POST rate limiting

## Implementation

- `lib/rate-limit/rate-limit-policies.ts` — named policies.
- `services/security/rate-limit-service.ts` — `consumeRateLimitToken`.
- `lib/rate-limit/client-ip.ts` — `getRequestClientIp` / `getClientIpFromRequest`.
- `lib/api/public-post-guard.ts` — marketing Turnstile guards, ingest bearer + `enforceIngestRateLimit`.
- `lib/billing/billing-api-rate-limit.ts` — authenticated billing checkout/portal limits.
- `lib/security/public-post-abuse-matrix.ts` — Era 17 P1 route coverage matrix (`era17-public-post-abuse-v1`).

## Covered surfaces

| Surface | Key | Policy |
|---------|-----|--------|
| Book demo | `book_demo:{ip}` | `book_demo` |
| Contact sales | `contact_sales:{ip}` | `contact_sales` |
| Partner lead | `partner_lead:{ip}` | `partner_lead` |
| ROI calculator lead | `roi_lead:{ip}` | `roi_lead` |
| Support ticket | user or IP bucket | `support_*` |
| Public API `POST /api/public/v1/orders` | `public_api_orders_post:{userId}:{ip}` | high ceiling |
| Storefront checkout / cart / analytics / forms | per-route | see `lib/storefront/rate-limit-config.ts` |
| Billing checkout | `billing_checkout:{userId}:{ip}` | `billing_checkout` |
| Billing portal | `billing_portal:{userId}:{ip}` | `billing_portal` |
| IoT temperature ingest | `iot_ingest:{ip}:{deviceId}` | `iot_ingest` |
| Experiment auto-conclude / orchestrator approve | per IP | `storefront_experiment_api` |

See **`docs/public-post-abuse-review-era17.md`** for Cycle 23 hardened routes.

## Webhooks

- **No** global rate limit on `/api/webhooks/*` — provider retries must not be blocked. Signature verification is the primary abuse control.

## Limitations

- In-memory counters reset on cold start — acceptable for closed beta; migrate to Redis for scale.
- No DDoS / WAF parity claim.
