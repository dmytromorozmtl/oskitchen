# Uber Eats integration (LIVE)

OS Kitchen ships a **LIVE** Uber Eats Marketplace connector: OAuth order ingest, signed webhooks → kitchen orders (KDS), menu push, and bidirectional status sync.

## Competitor comparison

| Capability | Toast / legacy POS | OS Kitchen Uber Eats LIVE |
|------------|-------------------|---------------------------|
| Order ingest | Native Uber tablet | Webhook + poll → `external_orders` + kitchen `orders` (KDS) |
| KDS ticket | Manual re-entry | Automatic on webhook — no duplicate entry |
| Menu sync | Partner portal only | `PUT /api/integrations/uber-eats/menu` from OS Kitchen |
| Webhook security | Vendor-managed | `verifyUberEatsWebhookSignature` + idempotent events |
| Status updates | One-way | Kitchen bump → Uber API PATCH (`READY_FOR_PICKUP`, `COMPLETED`) |

## Sales pitch

> "Uber Eats orders land on your KDS automatically. Bump ready in OS Kitchen — Uber gets the status. One screen, zero re-keying."

## Endpoints

```text
POST /api/webhooks/uber-eats/orders?cid=<connection-id>
PUT  /api/integrations/uber-eats/menu
GET  /api/integrations/uber-eats/oauth/callback
```

## Required environment

```bash
UBER_EATS_CLIENT_ID=
UBER_EATS_CLIENT_SECRET=
UBER_EATS_STORE_ID=
UBER_EATS_WEBHOOK_SECRET=
```

## How it works

1. **OAuth** — Merchant connects via `/api/integrations/uber-eats/oauth/callback`.
2. **Webhook** — Uber sends `order.placed` to the per-connection URL; signature verified.
3. **KDS import** — `processUberEatsInboundOrder` persists `external_orders` and creates a kitchen `order` via `importUberEatsOrderToKitchen`.
4. **Status push** — When staff bump an order (`updateOrderStatus`), `syncUberEatsStatusFromKitchenOrder` PATCHes Uber.

## How to test

```bash
node ./node_modules/vitest/vitest.mjs run \
  tests/unit/uber-eats-order-import-canonical.test.ts \
  tests/unit/uber-eats-webhook-signature.test.ts \
  tests/unit/uber-eats-kitchen-import.test.ts \
  tests/unit/uber-eats-status-sync.test.ts
```

## Honesty

Registry status is **LIVE** for Uber Eats. G3/G4 production uptime proof is still measured per-tenant — see Integration Health DoD panel.
