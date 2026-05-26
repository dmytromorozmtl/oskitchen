# Platform integrations & webhooks

## Integrations (`/platform/integrations`)

- Lists `IntegrationConnection` with user email, provider, status, updated time.
- Does **not** select encrypted token columns.
- Repair/replay flows belong in `platform-integrations-service` + audited actions (future).

## Webhooks (`/platform/webhooks`)

- Stub page — operational DLQ/replay UI pending.

## Providers

Shopify, WooCommerce, Stripe, etc. are values on `IntegrationProvider` enum in Prisma — UI is provider-agnostic list.
