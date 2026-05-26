# Forecast — Meal Plans & Catering sources

## Meal Plans

When `MEAL_PLANS` is selected, the engine pulls
`meal_plan_cycles` whose `cycle_start_date` falls in the run window and
whose status is one of `UPCOMING`, `NEEDS_SELECTION`, `READY_TO_GENERATE`.
For each cycle we read `meal_plan_selections` and multiply each
`selection.quantity` by `mealPlan.servingsPerMeal` to estimate plate
counts. The contribution carries a note like
`Committed via meal plan "Family Plan"` so operators trace the source.

We never include `GENERATED`, `SKIPPED`, `PAUSED`, or `CANCELLED`
cycles because those are either already orders or explicitly suppressed.

## Catering accepted events

When `ACCEPTED_CATERING_EVENTS` is selected, we pull
`catering_quotes` with status `ACCEPTED` or `CONVERTED_TO_ORDER` whose
`event_date` falls in the run window. For each quote we walk its
`catering_quote_items` and either:

- Bump the linked product's accumulator (`item.productId`), or
- Add a free-text catering line keyed by `catering:<quoteId>:<title>`.

The contribution note references the event name and customer.

## Why not pipeline quotes?

By design the engine excludes quotes that are still `DRAFT`, `SENT`,
`VIEWED`, `NEEDS_REVISION`. Operators can later toggle a "scenario only"
mode for pipeline quotes via the wizard, but the default is to only
trust accepted commitments — never speculative pipeline.

## Why not auto-create downstream orders?

We never auto-generate orders from this module. The forecast is a
**planning surface**; turning a forecast into orders requires explicit
operator action (e.g. "Send to production" creates a draft batch only).
