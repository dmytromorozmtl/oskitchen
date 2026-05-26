# Meal plan cycles

## Lifecycle

```
UPCOMING ──add selection──▶ READY_TO_GENERATE ──generate──▶ GENERATED
   │                              │
   └──remove all selections──▶ NEEDS_SELECTION
                                  │
                                  └──skip──▶ SKIPPED
plan paused ──▶ PAUSED                ─▶ CANCELLED (plan cancelled)
```

- `UPCOMING` — materialised but no operator interaction yet.
- `NEEDS_SELECTION` — first cycle on a fresh plan, or a cycle whose
  selections were all removed.
- `READY_TO_GENERATE` — has at least one selection, no order yet.
- `GENERATED` — has an order. Cannot be edited or regenerated.
- `SKIPPED` — operator chose to skip this cycle. Plan moves forward.
- `PAUSED` — cycle paused (used when the parent plan is paused).
- `CANCELLED` — plan cancelled while the cycle was open.

## Materialisation

`materializeUpcomingCycles(planId, count=4)`:

- Reads the latest cycle (or plan start date if none).
- Projects `count` anchors using `lib/meal-plans/meal-plan-schedules`.
- Stops at `endDate` (if set).
- Inserts cycles where they don't already exist on
  `(meal_plan_id, cycle_start_date)`.

## Generation

See `MEAL_PLAN_ORDER_GENERATION.md`. The cycle keeps `orderId` for the
generated order. Drafts can be edited or cancelled in Order Hub; this
does **not** automatically reset the cycle. The `order_id` foreign key
uses `SET NULL` on delete so the cycle row outlives the order.
