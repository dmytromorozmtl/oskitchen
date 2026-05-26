# Production webhook URLs

Replace `https://yourdomain.com` with your canonical HTTPS origin (`NEXT_PUBLIC_APP_URL`).

| System | URL |
|--------|-----|
| **Stripe** | `https://yourdomain.com/api/webhooks/stripe` |
| **WooCommerce** | `https://yourdomain.com/api/webhooks/woocommerce` |
| **Shopify** | `https://yourdomain.com/api/webhooks/shopify/orders-create` |
| | `https://yourdomain.com/api/webhooks/shopify/orders-updated` |
| | `https://yourdomain.com/api/webhooks/shopify/products-update` |
| | `https://yourdomain.com/api/webhooks/shopify/app-uninstalled` |
| **Uber Eats** | `https://yourdomain.com/api/webhooks/uber-eats/orders` |
| **Uber Direct** | `https://yourdomain.com/api/webhooks/uber-direct` |
| **Cron (Vercel)** | `https://yourdomain.com/api/cron/reminders` |

## Signature verification

| Route | Status |
|-------|--------|
| Stripe | **Required** — `stripe-signature` + `STRIPE_WEBHOOK_SECRET` |
| Shopify | Verify per Shopify HMAC docs + `SHOPIFY_APP_SECRET` |
| WooCommerce | HMAC with `WOOCOMMERCE_WEBHOOK_SECRET` |
| Uber | Provider-specific — treat as **high risk** without secrets |
| Cron | **Bearer `CRON_SECRET`** (Vercel injects when env set) |

## Retry behavior

- External platforms retry on non-2xx — handlers should be **idempotent** (duplicate `externalEventId` ignored where implemented).
- Vercel Cron **does not** retry failures — monitor logs.

## Idempotency

- Store provider event IDs; skip duplicates.

## Replay flow

- Owner uses dashboard webhook log / replay tooling where implemented — never replay blindly into live accounting without checks.

## Testing

- **Stripe:** Stripe CLI `stripe listen`
- **Shopify:** Dev store + webhook delivery UI
- **WooCommerce:** Woo → Status → Webhooks delivery log
- **Cron:** `curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/reminders`
