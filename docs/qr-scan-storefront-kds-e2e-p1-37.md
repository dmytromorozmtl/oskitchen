# QR scan→storefront→KDS E2E (P1-37)

**Policy:** `qr-scan-storefront-kds-e2e-p1-37-v1`

Gap closure for QA task P1-37: prove QR → checkout → WebhookEvent → KitchenTask → KDS.

## Chain

```
QR scan → storefront checkout → order.created webhook → KitchenTask → KDS ticket
```

| Step | Implementation |
|------|----------------|
| `scan_qr_entry` | Guest opens `/q/{slug}/{table}` |
| `storefront_menu` | Add item from `/s/{slug}/menu` |
| `storefront_checkout` | Pay-later checkout → internal order id |
| `webhook_event_persisted` | `OutboundWebhookDelivery` for `order.created` |
| `kitchen_task_linked` | `KitchenTask` with `relatedOrderId` |
| `verify_kds` | KDS ticket `kds-ticket-{orderId}` within 15s |

## Files

- Policy: `lib/qa/qr-scan-storefront-kds-e2e-p1-37-policy.ts`
- Chain: `services/qa/qr-scan-storefront-kds-e2e-p1-37.ts`
- Smoke helpers: `services/qa/qr-scan-storefront-kds-smoke.ts`
- E2E spec: `e2e/qr-scan-storefront-kds-e2e.spec.ts`

## CI

```bash
npm run check:qr-scan-storefront-kds-e2e-p1-37
```

Live Playwright:

```bash
E2E_QR_SCAN_STOREFRONT_KDS=true E2E_LOGIN_EMAIL=... E2E_LOGIN_PASSWORD=... \
  ENABLE_KDS_V1_CERTIFIED=true npm run test:e2e:qr-scan-storefront-kds-e2e
```

## Artifact

`artifacts/qr-scan-storefront-kds-e2e-p1-37.json`
