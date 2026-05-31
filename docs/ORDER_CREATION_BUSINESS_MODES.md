# Business mode adaptation

OS Kitchen supports a wide range of food businesses. The Order Creation
Center adapts to each through `lib/orders/order-creation-modes.ts`.

## Restaurant

- Pick `RESTAURANT_ORDER`.
- Catalog + custom lines.
- Pickup / delivery / dine-in.
- Default status: Confirmed.

## Café

- Pick `CAFE_ORDER`.
- Catalog + custom lines (specials).
- Pickup / dine-in.
- Default payment: Cash.

## Bakery

- Pick `BAKERY_ORDER`.
- Catalog (cakes, breads) + custom line (custom cake order).
- Recommends `preparedDate` per line.
- Pickup / delivery.

## Bar (event / private booking)

- Pick `BAR_EVENT_ORDER`.
- Catalog (package products) + custom lines.
- Event delivery / pickup / custom.
- No unsupported alcohol compliance claims — modes that touch alcohol
  are out of scope for this iteration.

## Catering

- Pick `CATERING_ORDER`.
- Catalog + custom lines.
- Quote-style: default Requested + Manual invoice.
- Catering loadout / event delivery / pickup.
- Catering quote → order conversion lives in the Catering module; this
  page is for direct entry.

## Meal prep

- Pick `MEAL_PLAN_ORDER` for plan-generated orders or `PREORDER` for a
  weekly preorder against the active menu.
- Default status: Draft (meal plan) or Confirmed (preorder).

## Ghost kitchen / multi-brand

- All types respect `brandId` / `locationId` if supplied (the page
  does not yet show selectors — defaults to workspace).

## Storefront / Sales channel

- The Order Creation Center does **not** create these directly. Use the
  dedicated import paths. The taxonomy is included so the data model
  can store them when the storefront / channel flows write to it.
