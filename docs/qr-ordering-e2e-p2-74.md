# QR ordering E2E — scan to KDS (P2-74)

**Policy:** `qr-ordering-e2e-p2-74-v1`  
**Status:** **LIVE** — full QR ordering chain to KDS  
**Updated:** 2026-06-16

Gap closure: QR scan → storefront checkout → WebhookEvent → KitchenTask → KDS ticket.

## Full chain

```
qr_scan → storefront_checkout → webhook_event → kitchen_task → kds_ticket
```

| Step | Component | Detail |
|------|-----------|--------|
| QR scan | `/q/{slug}/{table}` | Guest deep link from table QR |
| Checkout | `QrOrderingClient` | Menu + cart → POST `/api/public/qr-order` |
| Webhook | `order.created` | OutboundWebhookDelivery persisted |
| KitchenTask | `STORE_FRONT` source | Linked to order |
| KDS | Playwright + badge | `kds-qr-table-badge` on ticket |

## Upstream policies

- [P1-37](../docs/qr-scan-storefront-kds-e2e-p1-37.md) — QA E2E chain test
- P2-32 — base QR scan→storefront→KDS E2E policy

## Dashboard UI

`/dashboard/qr-codes` shows the **QR ordering E2E — scan to KDS** panel (`qr-ordering-e2e-panel`).

## Flow benchmark

Six scenarios: full chain, empty cart block, table encoding, multi-item, webhook link, KitchenTask link.

## CI

```bash
npm run check:qr-ordering-e2e-p2-74
```

## Artifact

`artifacts/qr-ordering-e2e-p2-74.json`
