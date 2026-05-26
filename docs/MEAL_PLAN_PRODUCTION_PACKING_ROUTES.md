# Meal plan ↔ production / packing / routes

Once a cycle is generated, the resulting `Order` becomes the canonical
artefact. The meal plan is just metadata. This keeps the rest of the
platform unchanged.

## Today Board / Order Hub

- Generated orders appear in Order Hub like any other order.
- `OrderItems` are seeded from `MealPlanSelection` rows.
- `Order.notes` carries the plan name, fulfillment mode, allergy warnings,
  dietary tags, and plan-level notes (built by `buildOrderNotesFromPreview`).
- `Order.pickupDate` is the cycle start date.

## Production

- Production work items are derived from `OrderItems`, so production
  inherits all the meal plan output without any extra integration.
- The generated `OrderItems` reference real `Product` rows, which means
  prep, station routing, and ingredient costing all continue to work.

## Packing

- Packing follows the same flow — labels, packaging rules, and verification
  events run off the order.
- Order notes carry allergy and dietary tags so packers see them on the
  packing screen.

## Routes / delivery

- Plans with `fulfillmentMode = DELIVERY` produce orders with
  `fulfillmentType = DELIVERY`.
- Delivery stops, addresses, and route assignment behave the same way as
  any other order.

## Limitations / follow-ups

- The current generator inherits `Order.fulfillmentType = PICKUP` for
  `MIXED` plans, since the order schema is single-fulfillment. A follow-up
  could split a mixed cycle into two orders.
- The generator doesn't currently assign a delivery route automatically;
  operators do so from Order Hub or Routes.
- Production batch grouping by meal-plan source is supported via
  `Order.notes` (the plan name is always included). A first-class
  `productionBatch.mealPlanId` link is a roadmap item.
