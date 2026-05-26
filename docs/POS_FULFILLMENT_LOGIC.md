# POS fulfillment logic

## Source of truth

- **Requirements:** `lib/fulfillment/fulfillment-requirements.ts` (`requiresScheduledServiceDate`, `inferFulfillmentIntent`, `pickupDateDisplayLabel`).
- **Blockers:** `services/orders/order-blocker-service.ts` — `MISSING_FULFILLMENT_DATE` only when `requiresScheduledServiceDate` is true and `pickupDate` is null on `CONFIRMED`.
- **Lifecycle stage:** `lib/orders/order-lifecycle-status.ts` — same rule for `NEEDS_FULFILLMENT_INFO` vs `READY_FOR_PRODUCTION`.
- **DB transition guard:** `lib/workflows/order-lifecycle-rules.ts` — cannot move to `PREPARING` if scheduled service date is required but missing.

## Fulfillment types (conceptual map)

| Intent | Calendar date | Route |
| --- | --- | --- |
| Walk-in / counter / pickup-now | Optional (defaults to “Pickup now” copy) | Not required |
| Scheduled pickup | Required when flagged | Not required |
| Delivery | Required + address for later pipeline | Required when dispatching |

## POS checkout metadata

`sourceMetadataJson.pos.fulfillmentIntent` set at checkout:

- `DELIVERY` for delivery basket
- `DINE_IN` for dine-in detail
- otherwise `PICKUP_NOW` for counter pickup
