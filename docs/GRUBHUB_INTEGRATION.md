# Grubhub integration (LIVE)

OS Kitchen ships a **LIVE** Grubhub Marketplace connector: OAuth, signed webhooks → kitchen orders (KDS), menu push, and bidirectional status sync.

## Competitor comparison

| Capability | Legacy tablet apps | OS Kitchen Grubhub LIVE |
|------------|-------------------|---------------------------|
| Order ingest | Partner tablet | Webhook + poll → `external_orders` + kitchen `orders` (KDS) |
| KDS ticket | Manual re-entry | Automatic on webhook |
| Menu sync | Partner portal | `PUT /api/integrations/grubhub/menu` |
| Webhook security | HMAC | `verifyGrubhubWebhookSignature` + idempotent events |
| Status updates | One-way | Kitchen bump → Grubhub API PATCH |

## Sales pitch

> "Grubhub orders land on your KDS automatically — menu sync and status push included."

## Endpoints

```text
POST /api/webhooks/grubhub/orders?cid=<connection-id>
GET  /api/integrations/grubhub/oauth/callback
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
node ./node_modules/.bin/vitest run \
  tests/unit/grubhub-kitchen-import.test.ts \
  tests/unit/grubhub-status-sync.test.ts \
  tests/unit/grubhub-menu-sync.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.
