# DoorDash integration (LIVE)

OS Kitchen ships a **LIVE** DoorDash connector: OAuth, signed webhooks → kitchen orders (KDS), menu sync, Drive delivery, and bidirectional status sync.

## Competitor comparison

| Capability | Toast / legacy POS | OS Kitchen DoorDash LIVE |
|------------|-------------------|--------------------------|
| Marketplace ingest | Partner tablet apps | Webhook + poll → `external_orders` + kitchen `orders` (KDS) |
| KDS ticket | Manual re-entry | Automatic on webhook |
| Menu sync | Aggregator portal | `PUT /api/integrations/doordash/menu` |
| Drive delivery | Third-party | `DoorDashSyncService` (Drive v2) |
| Status updates | One-way | Kitchen bump → Marketplace PATCH (`ready_for_pickup`, `delivered`) |
| Webhook security | Vendor-managed | `verifyDoorDashWebhookSignature` + idempotent events |

## Sales pitch

> "DoorDash orders hit your KDS instantly. Bump ready in OS Kitchen — DoorDash gets the update. Menu sync and Drive delivery in one place."

## Endpoints

```text
POST /api/webhooks/doordash/orders?cid=<connection-id>
PUT  /api/integrations/doordash/menu
GET  /api/integrations/doordash/oauth/callback
```

## Required environment

```bash
DOORDASH_API_KEY=
DOORDASH_MERCHANT_ID=
DOORDASH_WEBHOOK_SECRET=
DOORDASH_OAUTH_CLIENT_ID=      # optional — OAuth flow
DOORDASH_OAUTH_CLIENT_SECRET=
```

## How it works

1. **OAuth** — Merchant connects via `/api/integrations/doordash/oauth/callback`.
2. **Webhook** — DoorDash sends order events; signature verified per connection.
3. **KDS import** — `processDoorDashInboundOrder` → `importDoorDashOrderToKitchen`.
4. **Menu sync** — `DoorDashMenuSyncService.pushMenu` from active OS Kitchen menus.
5. **Status push** — `syncDoorDashStatusFromKitchenOrder` on `updateOrderStatus`.

## How to test

```bash
node ./node_modules/vitest/vitest.mjs run \
  tests/unit/doordash-kitchen-import.test.ts \
  tests/unit/doordash-status-sync.test.ts \
  tests/unit/doordash-order-import-canonical.test.ts
```

## Honesty

Registry status is **LIVE** for DoorDash. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.
