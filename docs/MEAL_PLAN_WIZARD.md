# New Meal Plan Wizard

Route: `/dashboard/meal-plans/new`

Single-screen wizard (no client state, no multi-step navigation) backed by
a single `createMealPlanFormAction`. Fields are grouped to mirror the
conceptual steps in the spec.

## Sections

1. **Customer** — email (required), name, phone, company. Email is
   normalized and upserted into the CRM via `upsertCustomerByEmail`. New
   plans default `source = MEAL_PLAN`.
2. **Plan details** — name (required), type, frequency, meals/cycle,
   servings/meal.
3. **Schedule &amp; fulfillment** — start date (required), optional end
   date, fulfillment mode (pickup / delivery / mixed), optional brand and
   location.
4. **Preferences** — allergies, dietary, favorite items, disliked items.
   All accept comma-separated strings; the action splits them into JSON
   arrays.
5. **Billing &amp; generation** — billing mode, optional price per cycle,
   generation mode. `AUTO_CREATE_CONFIRMED_ORDERS` is filtered out of the
   dropdown via `isMealPlanGenerationModeAllowed`.
6. **Notes** — free text. Stored on the plan and used as the seed for
   generated order notes.

## After save

- Plan is created and the form action redirects to
  `/dashboard/meal-plans/{planId}`.
- The first cycle is materialised in `NEEDS_SELECTION` status.
- `MealPlanEvent.PLAN_CREATED` is logged.
- `CustomerTimelineEvent` is appended for the customer.
