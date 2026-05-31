# DoorDash integration (BETA)

OS Kitchen ships a **BETA** DoorDash connector for ghost kitchens and multi-channel operators. It covers marketplace order ingest (webhooks + poll import), menu push, and Drive delivery APIs. Production traffic still requires DoorDash partner-approved credentials and correct API hosts.

## Competitor parity

| Capability | Square / Toast | OS Kitchen DoorDash BETA |
|------------|----------------|---------------------------|
| Marketplace order ingest | Partner apps | Webhook + poll import → `external_orders` + kitchen `orders` |
| Menu sync | Via aggregator | `PUT /api/integrations/doordash/menu` |
| Drive delivery | Third-party | `DoorDashSyncService` (Drive v2) |
| Webhook security | HMAC | `verifyDoorDashWebhookSignature` + idempotent `WebhookEvent` store |

## What ships

- **Webhook ingress:** `POST /api/webhooks/doordash/orders?cid=<connection-id>`
- **Order normalization:** `normalizeDoorDashOrder` → `NormalizedKitchenOrder`
- **Poll import:** `fetchDoorDashOrders(userId)` for cron / manual sync
- **Menu sync:** `DoorDashMenuSyncService.pushMenu` from active OS Kitchen menus
- **Drive delivery:** quotes and delivery creation via Drive v2 client
- **RBAC:** `integrations.manage` via `requireIntegrationsActor`

## Required environment

```bash
DOORDASH_API_KEY=           # Partner API key / JWT signing material
DOORDASH_MERCHANT_ID=       # Store / merchant identifier
DOORDASH_WEBHOOK_SECRET=    # Webhook HMAC secret (per connection or env fallback)
DOORDASH_CRON_OWNER_USER_ID= # Optional: owner user id for scheduled poll import
```

## How to test locally

1. Create an `IntegrationConnection` with `provider: DOORDASH` and encrypted webhook secret.
2. Register webhook URL with DoorDash developer portal.
3. Send a signed test payload:

```bash
BODY='{"event_id":"evt-1","order":{"id":"dd-test-1","customer":{"name":"Test Guest"},"items":[{"name":"Bowl","quantity":1,"price":1200}]}}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$DOORDASH_WEBHOOK_SECRET" -hex | awk '{print $2}')
curl -X POST "http://localhost:3000/api/webhooks/doordash/orders?cid=<connection-id>" \
  -H "Content-Type: application/json" \
  -H "x-doordash-signature: $SIG" \
  -d "$BODY"
```

4. Run unit tests:

```bash
node ./node_modules/vitest/vitest.mjs run tests/unit/doordash-order-import-canonical.test.ts tests/unit/webhook-doordash-route-security.test.ts
```

## Honesty note

Registry status is **BETA**, not **LIVE**. OS Kitchen does not claim DoorDash is production-certified until your merchant program validates API traffic. Missing credentials keep the integration in preparation mode.
