# Meal plan templates

Templates speed up new plan creation by pre-filling type, frequency,
meals/cycle, fulfillment default, dietary preset, and default item
hints.

## Starter pack

`lib/meal-plans/meal-plan-templates.ts` ships these built-ins:

- 5 Meals Weekly Individual
- Family Dinner Bundle
- Corporate Lunch Rotation
- Fitness Meal Plan
- Senior Meal Support
- Bakery Weekly Box
- Café Office Breakfast
- Custom Plan

Each built-in is added to the workspace with one click from
`/dashboard/meal-plans/templates`. The page stops offering a built-in
once it has been added.

## Custom templates

Operators can save their own templates. Each `MealPlanTemplate` row has:
- `name` (unique per workspace)
- `type`, `frequency`, `fulfillmentDefault`
- `mealsPerCycle`, `servingsPerMeal`
- `defaultItemsJson`, `dietaryPresetJson`
- `builtInKey` (set if originated from a starter)
- `active` toggle

## Wizard integration (current)

For this milestone, templates are visible on the Templates page and used
to seed the wizard defaults by manual reference. A future iteration can
add a "Use template" picker directly inside the wizard form.

## Limitations

- Templates do not auto-link to real `Product` rows; `defaultItemsJson`
  is operator hints only. The wizard does not yet pre-populate selections
  on the first cycle from a template.
- Templates do not enforce dietary presets at generation time; allergy
  matching is computed against `MealPlan.allergiesJson` only.
