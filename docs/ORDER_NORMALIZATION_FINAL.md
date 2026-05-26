# Order normalization (final)

- **Implementation:** `lib/order-normalization.ts` (and channel re-export if present)
- **Persist:** `lib/integrations/persist-external-order.ts` writes `ExternalOrder` + JSON payload
- **Principles:** Preserve `rawPayloadJson`; map totals/customer/fulfillment; dedupe by `(connectionId, externalOrderId)` where connection exists

Validation hardening should stay shared between webhooks and manual sync to avoid divergent rules.
