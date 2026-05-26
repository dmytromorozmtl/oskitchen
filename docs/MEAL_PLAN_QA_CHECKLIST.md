# Meal plan QA checklist

Manual smoke tests after the Meal Plans Command Center ships.

## Backwards compatibility

- [ ] Legacy `/dashboard/meal-subscriptions` form still creates a row in
      `customer_subscriptions`.
- [ ] After legacy create, a matching `meal_plans` row appears in the new
      Command Center with `legacySubscriptionId` set.
- [ ] Existing `CustomerSubscription` rows are visible in the new center
      after a first visit (lazy backfill).

## Wizard

- [ ] `/dashboard/meal-plans/new` creates a plan with the given customer.
- [ ] Customer is auto-created in the CRM with `source = MEAL_PLAN`.
- [ ] First cycle is materialised in `NEEDS_SELECTION`.
- [ ] Plan detail page opens after submit.

## Detail / cycles / generation

- [ ] Editing the plan saves and appends a `PLAN_UPDATED` event.
- [ ] Adding a selection flips the cycle to `READY_TO_GENERATE`.
- [ ] Removing all selections keeps the cycle editable.
- [ ] Generating a draft creates a `PENDING` order that opens in Order Hub.
- [ ] The cycle row shows the order link and status flips to `GENERATED`.
- [ ] Re-clicking "Generate draft" on a generated cycle returns an error.
- [ ] Skipping a cycle moves it to `SKIPPED` and adds an event.

## Pause / resume / cancel

- [ ] Pausing a plan sets `pausedUntil`, `pauseReason`, status `PAUSED`,
      and appends `PLAN_PAUSED`.
- [ ] Resuming clears pause fields and appends `PLAN_RESUMED`.
- [ ] Cancelling sets `CANCELLED`, appends `PLAN_CANCELLED`, and the
      plan moves to the Paused / cancelled tab.

## Templates

- [ ] Built-in starter pack appears at `/dashboard/meal-plans/templates`.
- [ ] One-click add inserts a template and removes it from the pack.
- [ ] Custom template form saves and appears in the user's templates.

## CRM

- [ ] Customer profile shows the plan in the "Meal plans" section.
- [ ] Customer timeline shows plan create + status changes + order
      generation events.
- [ ] Customer metrics (LTV / AOV) refresh after order generation.

## Reports

- [ ] `/dashboard/meal-plans/reports` shows active / paused / cycles
      generated / meals due / delivery vs pickup / churn share.
- [ ] Estimated recurring revenue is non-zero for priced plans.

## Permissions

- [ ] Owner sees everything.
- [ ] Superadmin (`workspace.moroz@gmail.com`) sees everything.
- [ ] Kitchen role does **not** see the Command Center via PII tabs
      (limited to dietary/order-scoped reads — verified via the auth gate
      on the dashboard).

## Safety

- [ ] Generation never creates a `CONFIRMED` order automatically.
- [ ] Generation never charges the customer.
- [ ] Cancelling the underlying order does not delete the cycle row
      (the cycle keeps its history with a null `orderId`).
- [ ] All meal plan changes append a `MealPlanEvent`.

## Build

- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes with no new warnings.
