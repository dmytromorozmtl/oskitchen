# Meal plan order generation

`services/meal-plans/meal-plan-order-generator.ts` owns the generation
pipeline. The pipeline is intentionally cautious: it always previews
before creating, never auto-confirms, never duplicates orders, and never
charges.

## Modes

| Mode | Behaviour |
|------|-----------|
| `MANUAL_ONLY` | Operators only — generator is invoked only by explicit user click. |
| `PREVIEW_BEFORE_CREATE` (default) | UI shows preview-style summary on the cycle row and the "Generate draft" button only enables when the cycle has selections. |
| `AUTO_CREATE_DRAFT_ORDERS` | Same generator can be invoked by a future scheduler. Still creates `PENDING` orders only. |
| `AUTO_CREATE_CONFIRMED_ORDERS` | **Rejected** in the action layer. Reserved for a future payment integration. |

## Preview

`previewCycleGeneration(scope, cycleId)`:

1. Loads the cycle + plan + customer + selections.
2. Loads the linked products.
3. Calls the pure builder `buildMealPlanGenerationPreview`.
4. Appends a `MealPlanEvent.ORDER_PREVIEWED` audit row.
5. Returns:
   - `ok` (boolean — no blocking errors),
   - per-line objects with quantity, unit price, allergy warnings,
   - subtotal,
   - allergy/dietary warnings synthesised from product allergens × plan
     allergies,
   - blocking errors (no selections, no product links, missing products,
     etc.).

## Draft generation

`generateDraftOrderForCycle(scope, cycleId)`:

1. Runs the preview. If `ok` is false, returns the joined error message.
2. Re-loads the cycle and refuses if it's already generated.
3. Opens a Prisma transaction and:
   1. creates the `Order` with `status = PENDING`, `customerEmail` /
      `customerName` / `customerPhone` from the CRM record,
      fulfillment from `MealPlan.fulfillmentMode`, `pickupDate` from
      `cycle.cycleStartDate`, generated notes from `buildOrderNotesFromPreview`,
      and `publicLookupToken` from the standard order utilities,
   2. creates `OrderItems` for every selection with a `productId`,
   3. flips `MealPlanCycle.status = GENERATED`, stores `orderId` and
      `generatedAt`,
   4. appends `MealPlanEvent.ORDER_DRAFT_GENERATED`,
   5. bumps `MealPlan.nextOrderDate` to the next anchor.
4. Outside the transaction: appends a `CustomerTimelineEvent` and calls
   `recomputeMetricsForOrderEmail`. Failures are logged and don't roll the
   order back.
5. Server action revalidates `/dashboard/meal-plans/{planId}`,
   `/dashboard/orders`, `/dashboard/order-hub`, and
   `/dashboard/customers`.

## Safety guarantees

- **No duplicate orders per cycle.** The cycle keeps `orderId`. The action
  also re-checks the cycle status before invoking the generator.
- **No auto-confirm.** The order is created `PENDING`; Order Hub is the
  next step.
- **No auto-charge.** Billing mode is informational only. Stripe is a
  placeholder enum until a real integration ships.
- **Selections with no product** are surfaced as blocking errors. The
  operator must link a real product before generating.
- **Allergy/dietary** notes propagate into the order notes so kitchen,
  packing, and delivery roles see them on the order detail page.
