# Meal Plans — ready report

## What changed

The Meal Plans module evolved from a single-form capture page into a full
Meal Subscription Command Center while preserving the legacy surface and
data.

### Routes

- New: `/dashboard/meal-plans` (overview), `/dashboard/meal-plans/new`,
  `/dashboard/meal-plans/active`, `/dashboard/meal-plans/cycles`,
  `/dashboard/meal-plans/needs-review`, `/dashboard/meal-plans/customers`,
  `/dashboard/meal-plans/templates`, `/dashboard/meal-plans/generated`,
  `/dashboard/meal-plans/paused`, `/dashboard/meal-plans/reports`,
  `/dashboard/meal-plans/settings`, `/dashboard/meal-plans/{planId}`.
- Preserved: `/dashboard/meal-subscriptions` (now linked to the new
  center with a "legacy" banner; the form continues to function and
  mirrors into the new model).

### Data model

Additive new tables in
`prisma/migrations/20260511230000_meal_plans_command_center`:

- `meal_plans`, `meal_plan_cycles`, `meal_plan_selections`,
  `meal_plan_events`, `meal_plan_templates`.

Plus enums: `MealPlanType`, `MealPlanStatus`, `MealPlanFrequency`,
`MealPlanFulfillmentMode`, `MealPlanBillingMode`,
`MealPlanGenerationMode`, `MealPlanCycleStatus`, `MealPlanEventType`.

`CustomerSubscription` is untouched. `MealPlan.legacySubscriptionId`
keeps the bridge.

### Helpers + services

- `lib/meal-plans/meal-plan-types.ts` — enums, labels, terminology.
- `lib/meal-plans/meal-plan-status.ts` — badges + transition rules.
- `lib/meal-plans/meal-plan-schedules.ts` — date math.
- `lib/meal-plans/meal-plan-generation.ts` — pure preview builder.
- `lib/meal-plans/meal-plan-permissions.ts` — role-based access matrix.
- `lib/meal-plans/meal-plan-templates.ts` — built-in starter pack.
- `services/meal-plans/meal-plan-service.ts` — CRUD, status, cycles,
  selections, KPIs, legacy backfill.
- `services/meal-plans/meal-plan-order-generator.ts` — preview + draft
  order generation.

### Server actions

`actions/meal-plans.ts` exports actions for create, update, status
change, cycle materialisation, selection add/remove, cycle skip, draft
generation, legacy backfill, and template creation.

### CRM integration

- Customer detail page now lists meal plans for the customer with status,
  frequency, fulfillment, and next order date.
- Customer timeline receives "Meal plan created" / "Meal plan → STATUS"
  events.
- Plan creation upserts the customer with `source = MEAL_PLAN`.

### Order generation

- Draft orders are `PENDING` only. The cycle row owns the `orderId` and
  refuses to regenerate.
- Allergy and dietary tags propagate into the order notes so kitchen,
  packing, and delivery roles see them.
- The generator revalidates `/dashboard/orders`, `/dashboard/order-hub`,
  and `/dashboard/customers` so dependent surfaces refresh.

### Documentation

- `docs/MEAL_PLANS_MODULE_AUDIT.md`
- `docs/MEAL_PLAN_ARCHITECTURE.md`
- `docs/MEAL_PLAN_DATA_MODEL.md`
- `docs/MEAL_PLAN_WIZARD.md`
- `docs/MEAL_PLAN_ORDER_GENERATION.md`
- `docs/MEAL_PLAN_CYCLES.md`
- `docs/MEAL_PLAN_CRM_INTEGRATION.md`
- `docs/MEAL_PLAN_PRODUCTION_PACKING_ROUTES.md`
- `docs/MEAL_PLAN_TEMPLATES.md`
- `docs/MEAL_PLAN_BILLING_LIMITATIONS.md`
- `docs/MEAL_PLAN_QA_CHECKLIST.md`
- `docs/MEAL_PLANS_READY_REPORT.md` (this file)

## Remaining limitations

- **Billing is informational.** No Stripe / payment provider integration
  yet. `STRIPE_PLACEHOLDER` is honestly labeled as such. Auto-confirmed
  orders remain disabled.
- **Mixed-fulfillment plans** generate a single-fulfillment order today.
  Splitting one cycle into pickup + delivery orders is a follow-up.
- **Auto-scheduler** is not wired. Cycles are materialised on demand from
  the plan detail page. A cron worker can be added later.
- **Templates → wizard** is a one-way reference today. Operators choose a
  template manually; we don't yet pre-seed selections on the first cycle.
- **CRM segments** don't have built-in rules for "has active meal plan",
  "paused subscriber", or "high recurring LTV". Easy to add later.
- **Storefront request flow** for customers to request a plan is a stub
  in the docs only.
- **Customer portal** for self-service pause / change does not exist.

## Next recommendations

- Wire a daily cron to call `materializeUpcomingCycles` for every active
  plan so cycles stay ahead of the operator.
- Add an Order Hub filter chip "from meal plan".
- Add an Order Hub badge that surfaces `Order.notes` allergy strings.
- Expose meal-plan-driven follow-ups in the CRM follow-up center
  (e.g., auto-task "Confirm allergy with new subscriber").
- When the payment integration ships, flip
  `AUTO_CREATE_CONFIRMED_ORDERS` from "reserved" to "available" and add
  payment status tracking on the cycle.
- Build the storefront meal-plan request form and an admin review queue.

## Build

- `npm run typecheck` ✅
- `npm run build` ✅ (see final phase output)
