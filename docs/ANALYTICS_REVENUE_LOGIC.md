# Revenue logic

## Gross revenue

`SUM(orders.total)` for non-cancelled orders inside the selected window
(`createdAt BETWEEN from AND to`). Statuses considered:
`PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`.

## Net revenue

`gross_revenue − SUM(orders.total WHERE status = CANCELLED)`.

We intentionally do not subtract refunds or chargebacks because those are
not modelled by the existing schema. Operators are warned via the UI copy
that net revenue currently equals gross minus cancellations.

## Fees & discounts

`Order.total` is the agreed customer total. Channel and catering-specific
fees live on `CateringQuote` rows (`serviceFee`, `deliveryFee`,
`setupFee`, `staffingFee`, `discount`); the catering analytics tab uses
those to build event-level revenue context. For order-level fee breakdown
we surface the order detail link.

## Catering revenue

`SUM(catering_quotes.total)` where status is one of
`ACCEPTED`, `CONVERTED_TO_ORDER` and the quote `updatedAt` falls in the
window. This counts an accepted quote once even after conversion (the
matching order is also counted in gross revenue when status progresses).

## Meal plan revenue

Orders with a populated `mealPlanCycle` join. We don't compute a
forward-looking MRR — we surface the **actual** revenue contributed by
meal-plan-generated orders in the window.

## Pickup vs delivery

Orders are bucketed by `fulfillmentType`. Catering-style staffing/setup
fees are excluded from the basic split (they are surfaced in the
Catering tab instead).
