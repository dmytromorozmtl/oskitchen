# Webhook center (final)

- **Route:** `/dashboard/sales-channels/webhooks`
- **Endpoints card:** Outside plan gate — lists registry webhook URLs with copy buttons (`CopyTextButton`)
- **Event log:** Inside `PlanGate` feature `webhook_replay` (legacy parity)
- **Security:** Signature flags shown; raw payload viewer remains future work behind support tooling

Existing API routes (`/api/webhooks/woocommerce`, `/api/webhooks/shopify/*`, …) must stay stable for partners.
