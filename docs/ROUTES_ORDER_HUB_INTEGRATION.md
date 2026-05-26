# Routes ↔ Order Hub integration

## Data link

`DeliveryStop.orderId` → `Order.id` (cascade on order delete). Order Hub can read `Order.deliveryStops` to surface:

- Route assignment (id + date)
- Stop sequence number
- Latest stop status (`STOP_STATUS_LABEL`)
- Failed reason (when `FAILED`)
- Delivery window
- Driver name (route-level)

## Status feedback

When a stop transitions to `DELIVERED` or `FAILED`, dispatch records the change as a `DeliveryEvent` and recomputes the route counts. Pushing to `Order.status` is deliberately not automatic — many orders carry their own lifecycle and we do not want a race against POS/storefront updates. Operators can mark the order `COMPLETED` from Order Hub when ready.

## Failed delivery follow-up

The recommended follow-up loop for a failed delivery:

1. Stop set to `FAILED` with a reason in the route detail page.
2. Operator opens the order in Order Hub.
3. Operator creates a `KitchenTask` (existing module) to reschedule or refund.
4. Optional: schedule a new stop on another route (manual move via reorder + Order Hub link).

Automatic task creation is intentionally not wired yet to avoid duplicating tasks when several operators are responding simultaneously.

## Reschedule

Re-dispatching a stop is currently manual: remove from the failed route and add to a new route via order-import flow. A first-class "move stop" action will be added once we settle on the desired event log shape.
