# Grubhub integration (BETA)

OS Kitchen ships a **BETA** Grubhub Marketplace connector: signed webhooks, order poll import, menu push, and canonical normalization.

## Competitor parity

| Capability | Competitors | OS Kitchen Grubhub BETA |
|------------|-------------|-------------------------|
| Order ingest | Native apps | Webhook + poll → `external_orders` + kitchen `orders` |
| Menu sync | Partner portal | `PUT /api/integrations/grubhub/menu` |
| Webhook security | HMAC | `verifyGrubhubWebhookSignature` |

## Endpoints

```text
POST /api/webhooks/grubhub/orders?cid=<connection-id>
PUT  /api/integrations/grubhub/menu
```

## Required environment

```bash
GRUBHUB_API_KEY=
GRUBHUB_MERCHANT_ID=
GRUBHUB_WEBHOOK_SECRET=
```

## How to test

```bash
node ./node_modules/vitest/vitest.mjs run tests/unit/grubhub-order-import-canonical.test.ts tests/unit/webhook-grubhub-route-security.test.ts
```

## Honesty

Registry status is **BETA**, not LIVE. Partner approval required for production traffic.
