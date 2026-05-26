# Delivery stops

## Model

`DeliveryStop` (extended): adds `customerEmail`, `customerPhone`, `customerId`, `deliveryNotes`, `packingStatus`, `paymentStatus`, `latitude/longitude`, `mapsUrl`, `deliveredAt`, `failedReason`, `proofJson`.

## Statuses

`PENDING`, `PACKED`, `READY`, `LOADED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, `SKIPPED`, `RETURNED`.

`canTransitionStop` (in `lib/routes/route-stops.ts`) enforces forward-only paths with `RETURNED` allowed from terminal states. Server action `updateStopStatusAction` rejects illegal transitions before writing.

## Failed delivery workflow

Failed reasons (`FailedDeliveryReason`): `CUSTOMER_UNAVAILABLE`, `WRONG_ADDRESS`, `DRIVER_ISSUE`, `ORDER_NOT_PACKED`, `WEATHER_TRAFFIC`, `PAYMENT_ISSUE`, `OTHER`. Submitted from the stop form alongside the status change. The transaction:

1. Updates the stop (status + reason + optional notes).
2. Recomputes route counters and `DeliveryRouteStatus`.
3. Inserts a `DeliveryEvent` (`STOP_FAILED`, with reason in `metadataJson`).

Order Hub follow-up (KitchenTask creation, customer notification) is wired in the integration layer — see `ROUTES_ORDER_HUB_INTEGRATION.md`.

## Reorder

`reorderStopAction` uses `applyReorder` to compute new sequences and writes them in one transaction, emitting `STOP_REORDERED`. Manual only — never automatic.

## Maps

`mapsSearchUrl` and `mapsDirectionsUrl` are derived from the structured address (`addressJson`) when available, falling back to the customer name. Phone links are normalized through `callPhoneHref` (strips non-digits, ensures `tel:`).
