# Shopify & Stripe async webhook extension

## Shopify

- **Implemented:** async enqueue + worker path mirrors WooCommerce when `WEBHOOK_ASYNC_QUEUE=true`.
- **Honest status:** remains **BETA** in `lib/capabilities/capability-matrix.ts` — tenant-specific HMAC + topic coverage must be validated in staging.

## Stripe

- **Not queued:** `/api/webhooks/stripe` remains **fully synchronous** after signature verification and `billingEvent` idempotency.
- **Reason:** billing events need immediate deterministic handling; moving to async requires outbox + idempotency keys beyond this pass.

## Capability matrix

- See `shopify` row gaps and `stripe_checkout` row for billing webhook expectations.
