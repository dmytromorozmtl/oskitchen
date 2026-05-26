# Rate limit — short load test (P1)

Use this **after** `RATE_LIMIT_ADAPTER=upstash` or `redis` is configured in staging/preview, to confirm legitimate webhook retries and public forms are not throttled at expected volumes.

## Preconditions

- Target host has the same env as production (adapter + Redis credentials).
- You have a **non-production** API token or session for public API tests.

## 1. Webhook ingress (high threshold)

The `webhook_ingest` policy allows **5000** hits / minute / `(provider, connectionId, topic)` bucket when distributed.

1. From WooCommerce **staging**, trigger ~20 order updates in a row (or use partner “replay delivery” if available).
2. Expect **no 429** on signed requests.
3. Optionally tail logs — no secret material.

If you see **429**, confirm you are not accidentally on `memory` adapter across many instances (each instance has its own counter in memory mode).

## 2. Public form (low threshold)

1. Submit the book-demo or contact form from one IP **slowly** under the policy max (e.g. &lt; 6/min for book_demo).
2. Then exceed the max with scripted requests from the same IP.
3. Expect **429** with a generic message — no internal key leakage.

## 3. Public API (`POST /api/public/v1/orders`)

Use a **test** workspace API key. Ramp concurrent POSTs (e.g. `hey` or `k6`) toward but not past `public_api_orders_post` (120/min per key+IP). Confirm 429 only appears beyond policy.

## 4. Storefront checkout critical path

Run:

```bash
BASE_URL=http://localhost:3000 STORE_SLUG=hello npm run test:k6:storefront-checkout
```

What it covers:

- `GET /s/[storeSlug]/menu`
- `GET /api/storefront/catalog`
- `GET /api/storefront/cart`
- `PATCH /api/storefront/cart`
- optional `POST /api/storefront/shipping/quote` when `CHECKOUT_FULFILLMENT=DELIVERY`
- `GET /s/[storeSlug]/checkout`

Important boundary:

- Final storefront order placement currently goes through a Next.js Server Action, not a stable public REST route.
- This means the k6 script validates the anonymous checkout path up to submit-ready state and protects pre-submit latency regressions.
- Keep Playwright storefront checkout E2E as the source of truth for actual order-submit correctness.

## Pass criteria

- Webhooks: no false 429 under normal partner retry patterns when distributed adapter is active.
- Abuse: 429 appears for scripted public abuse without leaking limiter internals.
- Storefront checkout critical path stays below agreed latency thresholds without tripping single-IP throttling artifacts.
