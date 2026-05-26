# Meal plan ↔ CRM integration

## On plan create

- `upsertCustomerByEmail` is invoked with the wizard email. The customer
  is created if missing (`source = MEAL_PLAN`) or matched if present.
- `CustomerTimelineEvent.sourceType = "meal_plan"` is appended on create,
  status change, and order generation. The event surfaces in the customer
  detail timeline.

## On order generation

- `recomputeMetricsForOrderEmail` is fired (best-effort) so the customer's
  LTV, AOV, and last-order date stay accurate.
- The order itself is reachable from the cycle row on the plan detail
  page and from the "Generated orders" tab.

## On the customer detail page

A new "Meal plans" section lists every plan for the customer with
status, frequency, meals/cycle, and next order date. It links back to
the plan detail page.

## What the CRM does **not** do

- Plans don't currently appear on the CRM segment evaluator. Adding
  built-in segments like `has-active-meal-plan` is a follow-up.
- Plan-driven follow-up tasks are stored as `CustomerFollowUp` rows when
  manually created; auto-followups are out of scope for this milestone.

## Privacy

- Kitchen, packing, and driver roles never see the full plan detail
  page. They consume order-scoped data via Order Hub / Today Board /
  Production / Packing / Routes.
- Allergies and dietary preferences flow from the plan onto the order
  notes so they survive the role boundary.
- `lib/meal-plans/meal-plan-permissions.ts` declares the scopes; the
  Command Center pages defer to the existing dashboard auth gate.
