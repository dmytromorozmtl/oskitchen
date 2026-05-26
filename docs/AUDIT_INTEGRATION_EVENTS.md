# Integration / Webhook Audit Events

## Today

- Stripe verified webhooks log `STRIPE_WEBHOOK_RECEIVED` with `{ eventType }` metadata (no payload secrets).

## Planned / extend

- WooCommerce / Shopify / Resend delivery webhooks should log signature verification outcome and processing result using `source: WEBHOOK` or `SALES_CHANNEL`, `category: WEBHOOKS` or `SALES_CHANNELS`, actions such as `WEBHOOK_FAILED`, `WEBHOOK_SIGNATURE_INVALID` (metadata: channel id, event type only).

Link UI rows to Integration Health / Webhook logs screens as those modules expose stable entity ids.
