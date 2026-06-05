# Skip / Just Eat integration (LIVE)

OS Kitchen ships a **LIVE** Skip (Canada) and Just Eat (UK/EU) connector: OAuth, signed webhooks → kitchen orders (KDS), and bidirectional status sync.

## Competitor comparison

| Capability | Legacy tablet apps | OS Kitchen Skip / Just Eat LIVE |
|------------|-------------------|----------------------------------|
| Order ingest | Partner tablet | Webhook + poll → `external_orders` + kitchen `orders` (KDS) |
| KDS ticket | Manual re-entry | Automatic on webhook |
| Webhook security | Vendor-managed | `verifySkipWebhookSignature` + idempotent events |
| Status updates | One-way | Kitchen bump → Skip API PATCH |

## Sales pitch

> "Skip and Just Eat orders land on your KDS automatically — one screen for Canada and UK delivery channels."

## Endpoints

```text
POST /api/webhooks/skip/orders?cid=<connection-id>
GET  /api/integrations/skip/oauth/callback
```

## Required environment

```bash
SKIP_CLIENT_ID=
SKIP_CLIENT_SECRET=
SKIP_RESTAURANT_ID=
SKIP_WEBHOOK_SECRET=
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/skip-kitchen-import.test.ts \
  tests/unit/skip-status-sync.test.ts \
  tests/unit/skip-marketplace.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.
