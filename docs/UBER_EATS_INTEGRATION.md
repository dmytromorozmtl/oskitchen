# Uber Eats integration (BETA)

OS Kitchen ships a **BETA** Uber Eats Marketplace connector: OAuth order ingest, signed webhooks, menu push, and status updates. Production traffic still requires Uber partner approval.

## Competitor parity

| Capability | Competitors | OS Kitchen Uber Eats BETA |
|------------|-------------|---------------------------|
| Order ingest | Native apps | Webhook + poll → `external_orders` + kitchen `orders` |
| Menu sync | Partner portal | `PUT /api/integrations/uber-eats/menu` |
| Webhook security | HMAC | `verifyUberEatsWebhookSignature` + idempotent events |
| Status updates | API PATCH | `updateOrderStatus` via OAuth |

## Endpoints

```text
POST /api/webhooks/uber-eats/orders?cid=<connection-id>
PUT  /api/integrations/uber-eats/menu
```

## Required environment

```bash
UBER_EATS_CLIENT_ID=
UBER_EATS_CLIENT_SECRET=
UBER_EATS_STORE_ID=
UBER_EATS_WEBHOOK_SECRET=
```

## How to test

```bash
node ./node_modules/vitest/vitest.mjs run tests/unit/uber-eats-order-import-canonical.test.ts tests/unit/uber-eats-webhook-signature.test.ts
```

## Honesty

Registry status is **BETA**, not LIVE. OS Kitchen does not claim Uber official partnership until your integration is certified.
