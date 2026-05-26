# Meal Plan architecture

## Goals

- Turn the single-form "Meal subscriptions" capture page into a real
  recurring-order operations module without breaking the legacy form.
- Provide a clear path from a customer → plan → cycles → selections →
  preview → **draft** order → Order Hub → production / packing / routes.
- Stay additive at the database layer; keep `CustomerSubscription` untouched
  and mirror legacy rows into the new model.
- Never auto-charge or auto-confirm orders.

## Layer map

```
UI: app/dashboard/meal-plans/*
  ↓ uses server actions
Actions: actions/meal-plans.ts
  ↓ delegates to services
Services: services/meal-plans/
  - meal-plan-service.ts          (CRUD, status, cycles, backfill, KPIs)
  - meal-plan-order-generator.ts  (preview + safe draft generator)
  ↓ uses helpers + Prisma
Helpers: lib/meal-plans/
  - meal-plan-types.ts        (enums + terminology + UI labels)
  - meal-plan-status.ts       (status badges + transition rules)
  - meal-plan-schedules.ts    (date math)
  - meal-plan-generation.ts   (pure preview builder)
  - meal-plan-permissions.ts  (role-based access)
  - meal-plan-templates.ts    (built-in starter pack)
Prisma: prisma/schema.prisma → MealPlan, MealPlanCycle, MealPlanSelection,
                               MealPlanEvent, MealPlanTemplate
Migration: prisma/migrations/20260511230000_meal_plans_command_center
```

## Key flows

### Create plan

1. UI submits the wizard form to `createMealPlanFormAction`.
2. Action calls `services/meal-plans.createMealPlan`.
3. Service upserts the `KitchenCustomer` through `upsertCustomerByEmail`
   (so the CRM sees the customer immediately, with `source = MEAL_PLAN`).
4. Service creates the `MealPlan`, the first `MealPlanCycle`
   (`NEEDS_SELECTION`), and a `PLAN_CREATED` event.
5. Service appends a `CustomerTimelineEvent` so the customer profile shows
   the new plan. Failures here are logged but don't block the create.

### Cycle generation

1. Operator opens the plan detail page or the Cycles tab.
2. Operator adds at least one selection that points at a real `Product`.
3. Cycle transitions automatically to `READY_TO_GENERATE`.
4. Operator hits "Generate draft" → `generateCycleDraftAction` calls
   `services/meal-plans/meal-plan-order-generator.generateDraftOrderForCycle`.
5. Generator runs `previewCycleGeneration` first; if the preview has
   blocking errors, generation is rejected with that error message.
6. Generator opens a transaction and:
   - creates an `Order` with status `PENDING`,
   - creates `OrderItems` for each selection with a `productId`,
   - sets the cycle's `status = GENERATED`, `orderId`, `generatedAt`,
   - appends `ORDER_DRAFT_GENERATED` event,
   - bumps `MealPlan.nextOrderDate` to the next anchor.
7. Outside the transaction, the generator appends a CRM timeline event and
   recomputes customer metrics. Failures are logged.

### Pause / resume / cancel

- `setMealPlanStatusAction` validates the transition via
  `canTransitionMealPlan` and updates the plan. Pause stores `pausedUntil`
  and `pauseReason`; resume clears them.
- Every status change appends a `MealPlanEvent` and a CRM timeline event.

### Backfill

- The first time the Command Center loads with `MealPlan` count = 0, the
  service `backfillLegacySubscriptions` mirrors every `CustomerSubscription`
  into a `MealPlan` with `legacySubscriptionId` set. Idempotent.

## Generation safety

- `MealPlanGenerationMode.AUTO_CREATE_CONFIRMED_ORDERS` is reserved but
  rejected in the action layer (`isMealPlanGenerationModeAllowed`).
- Cycles refuse to regenerate once `orderId` is set or status is
  `GENERATED`.
- All draft orders are `PENDING`. Order Hub is the canonical surface for
  confirmation, production, packing, and routes.

## Multi-business support

`mealPlanTerminologyForMode` adapts the page title and CTA labels to the
workspace's business type (Meal Prep, Catering, Café, Bakery, Restaurant,
Bar, Ghost / Cloud / Multi-brand).
