# P0-13 — WooCommerce webhook → KDS E2E

**Policy:** `p0-13-woocommerce-webhook-kds-e2e-v1`  
**Extends:** `p0-2-woocommerce-webhook-kds-live-smoke-v1` (live smoke)

Synthetic E2E proof: test payload → `WebhookEvent` → `KitchenTask` → KDS ticket visible on `/dashboard/kitchen`.

## Chain steps

| Step | Check |
|------|-------|
| `test_payload` | Synthetic `order.created` payload with `GOLDEN-WOO-1` SKU |
| `webhook_event_persisted` | `WebhookEvent` row + `processed=true` |
| `kitchen_task_linked` | `KitchenTask.relatedOrderId` set |
| `kds_ticket_visible` | Order imported + `kds-ticket-{orderId}` on kitchen display |

## Commands

```bash
# Policy + wiring gate (CI)
npm run check:woocommerce-webhook-kds-e2e-p0-13

# Playwright E2E (requires DATABASE_URL + CHANNEL_SMOKE_CONNECTION_ID + E2E creds)
npm run test:e2e:woocommerce-webhook-kds-e2e
```

## Env

- `DATABASE_URL` — webhook ingest + kitchen import
- `CHANNEL_SMOKE_CONNECTION_ID` — WooCommerce connection with webhook secret
- `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` — authed KDS page
- `ENABLE_KDS_V1_CERTIFIED=true` — non-production KDS gate

## Artifact

`artifacts/woocommerce-webhook-kds-e2e.json` — wiring registry for P0-13 E2E chain.
