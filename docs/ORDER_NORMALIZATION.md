# Order normalization

**Canonical types:** `lib/order-normalization.ts` — `NormalizedKitchenOrder`, matching helpers.

**Channel re-exports:** `lib/channels/order-normalization.ts` — stable import path for channel UI.

**Persistence:** `lib/integrations/persist-external-order.ts` writes `external_orders` with `raw_payload_json` preserved.

Duplicate detection and SKU routing remain implementation details of webhook handlers — extend there before UI promises complete automation.
