# P0-14 — Shopify webhook → KDS E2E

**Policy:** `p0-14-shopify-webhook-kds-e2e-v1`  
**Extends:** `p0-3-shopify-webhook-kds-live-smoke-v1` (live smoke)

Synthetic E2E proof: HMAC-signed test payload → `WebhookEvent` → `KitchenTask` → KDS ticket visible on `/dashboard/kitchen`.

## Chain steps

| Step | Check |
|------|-------|
| `hmac_self_check` | `X-Shopify-Hmac-Sha256` roundtrip via webhook secret |
| `test_payload` | Synthetic `orders/create` payload with `GOLDEN-SHOPIFY-1` SKU |
| `webhook_event_persisted` | `WebhookEvent` row + `processed=true` |
| `kitchen_task_linked` | `KitchenTask.relatedOrderId` set |
| `kds_ticket_visible` | Order imported + `kds-ticket-{orderId}` on kitchen display |

## Commands

```bash
# Policy + wiring gate (CI)
npm run check:shopify-webhook-kds-e2e-p0-14

# Playwright E2E (requires DATABASE_URL + SHOPIFY_SMOKE_CONNECTION_ID + E2E creds)
npm run test:e2e:shopify-webhook-kds-e2e
```

## Env

- `DATABASE_URL` — webhook ingest + kitchen import
- `SHOPIFY_SMOKE_CONNECTION_ID` (or `CHANNEL_SMOKE_CONNECTION_ID`) — Shopify connection with shop domain + webhook secret
- `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` — authed KDS page
- `ENABLE_KDS_V1_CERTIFIED=true` — non-production KDS gate

## Artifact

`artifacts/shopify-webhook-kds-e2e.json` — wiring registry for P0-14 E2E chain.
