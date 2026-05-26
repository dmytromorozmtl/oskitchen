# POS order type & fulfillment rules

## Types (`lib/orders/order-source-types.ts`)

- **POS operational subtypes** (UX / rules projection): `POS_SALE`, `POS_WALK_IN`, `POS_PICKUP`, `POS_READY_NOW`, `POS_MADE_TO_ORDER`, `POS_CATERING_PICKUP`, `POS_MEAL_REDEMPTION_PLACEHOLDER`.
- Persisted today: `orderType = POS_SALE`, `creationSource = POS`, widened fulfillment on `fulfillmentDetail` + `sourceMetadataJson.pos`.

## Fulfillment intents (`lib/fulfillment/fulfillment-requirements.ts`)

- **POS + `PICKUP_NOW`** (default for counter pickup): no `pickupDate` required; display “Pickup now”.
- **POS + `DELIVERY` / catering-style details**: `pickupDate` (service date) required for scheduling parity with other channels.
- **Preorder / meal plan / non-POS pickup**: `pickupDate` still required (weekly preorder safety).
- **Metadata override**: `pos.scheduledPickup: true` or `pos.fulfillmentIntent: "SCHEDULED_PICKUP"` forces date requirement.

## Services

- `services/orders/pos-order-normalization-service.ts` — build `FulfillmentRequirementContext` from Prisma order.
- `services/fulfillment/fulfillment-requirement-service.ts` — `evaluateFulfillmentForOrder`.
- `services/orders/order-next-action-service.ts` — operator primary/secondary actions.

See also: `docs/POS_FULFILLMENT_LOGIC.md`, `docs/POS_ORDER_DETAIL_AUDIT.md`.
