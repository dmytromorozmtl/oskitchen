# Webhooks — production guide

## Endpoints (`/api/...`)

| Provider | Route | Secret env |
|----------|-------|------------|
| Stripe | `webhooks/stripe` | `STRIPE_WEBHOOK_SECRET` |
| Shopify | `webhooks/shopify/orders-create`, `orders-updated`, `products-update`, `app-uninstalled` | `SHOPIFY_APP_SECRET` + platform signing |
| WooCommerce | `webhooks/woocommerce` | `WOOCOMMERCE_WEBHOOK_SECRET` |
| Uber Eats | `webhooks/uber-eats/orders` | Provider-specific verification (see adapter) |
| Uber Direct | `webhooks/uber-direct` | Provider-specific verification |

Also see **`docs/WEBHOOK_SECURITY.md`** for historical notes.

## Requirements

1. **HTTPS** public URL (production domain).
2. **Raw body** available for HMAC / Stripe signature verification (Next.js route handlers configured accordingly).
3. **Idempotency:** Ignore duplicate event IDs where stored.
4. **Logging:** Persist failures to webhook log table / observability — no secret payloads in logs (use `lib/logger.redactForLog`).

## Retry rules

- Stripe / Shopify / Woo retry automatically — handlers must be **idempotent**.
- On processing failure, return **5xx** cautiously; prefer **200 + dead-letter** pattern if duplicates would corrupt state (tune per integration).

## Local testing

- **Stripe:** `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- **Shopify:** Dev store + ngrok/tunnel URL for dev app
- **WooCommerce:** Use WP webhook delivery logs + tunnel

## Production testing

1. Send provider test events.
2. Confirm DB side-effects (orders, products, subscription rows).
3. Verify signature rejection when secret wrong (negative test).

## Operational checklist

- [ ] Secrets rotated after accidental exposure
- [ ] Dashboard webhook viewer shows recent attempts
- [ ] Replay tool Owner-only
