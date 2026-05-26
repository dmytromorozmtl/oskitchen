# Order Creation Center — ready report

## What changed

`/dashboard/orders/new` is now a 6-step **Order Creation Center** that
supports 11 order types and 7 fulfillment shapes without breaking the
existing weekly-preorder flow.

### New files

- `lib/orders/order-types.ts`
- `lib/orders/order-status.ts`
- `lib/orders/order-fulfillment.ts`
- `lib/orders/order-payment.ts`
- `lib/orders/order-creation-modes.ts`
- `lib/orders/order-validation.ts`
- `services/orders/order-creation-service.ts`
- `actions/order-creation.ts`
- `components/dashboard/orders/order-center.tsx`
- 9 documentation files under `docs/ORDER_CREATION_*.md`

### Updated files

- `prisma/schema.prisma` — additive columns on `Order` and `OrderItem`.
- `prisma/migrations/20260526100000_order_creation_center/migration.sql` —
  Postgres additive migration.
- `app/dashboard/orders/new/page.tsx` — replaces the old preorder form
  with the `OrderCenter` client component, gated by a permission check.
- Null-safety fixes (because `OrderItem.productId` is now optional):
  - `app/dashboard/packing/page.tsx`
  - `app/order/[token]/page.tsx`
  - `actions/channel-command-center.ts`
  - `actions/orders.ts`
  - `actions/packing-verify.ts`
  - `actions/storefront-order.ts`
  - `app/dashboard/brands/[brandId]/reports/page.tsx`
  - `lib/ingredient-demand/demand-calculation.ts`
  - `services/analytics/analytics-service.ts`
  - `services/packing-verification/verification-service.ts`
  - `services/packing/generate-packing-queue.ts`
  - `services/production/generate-production.ts`

## Active weekly menu logic

The active weekly menu is only required for `PREORDER`. The order-type
chooser disables the preorder card if no menu is active, but every
other order type remains creatable.

## Supported order types

`MANUAL_ORDER`, `PREORDER`, `RESTAURANT_ORDER`, `CAFE_ORDER`,
`BAKERY_ORDER`, `BAR_EVENT_ORDER`, `CATERING_ORDER`, `MEAL_PLAN_ORDER`,
`STOREFRONT_ORDER`, `SALES_CHANNEL_ORDER`, `CUSTOM_ORDER` (the last
three are write-only data shapes — created by their own ingestion code
paths, not the Center UI).

## Customer flow

- Existing customer (via `KitchenCustomer.id`).
- Guest / new (name, email, phone optional).
- Walk-in customer when nothing is provided.
- CRM upsert + metrics recompute run fire-and-forget after save.

## Item flow

- Catalog products (workspace-wide).
- Active menu products (filtered automatically when type = preorder).
- Custom lines (no `productId`, just `title` + price).

## Fulfillment flow

- Pickup, Delivery, Dine-in, Event delivery, Catering loadout,
  Third-party delivery, Custom.
- Service date, time window start/end.
- Delivery address JSON for any delivery-style fulfillment.
- Delivery / kitchen / packing notes.

## Payment & status

- 7 payment modes — none auto-complete.
- 10 widened statuses — stored in `statusDetail` and bucketed into the
  6-value DB enum.
- Storefront / sales-channel types are restricted to Requested or
  Confirmed initial statuses.

## Business modes

All seven KitchenOS profiles (restaurant, café, bakery, bar, catering,
meal prep, ghost kitchen) are addressed through the modes config and
order-type cards.

## Post-creation

After save the page redirects to `/dashboard/orders?created=<id>`. The
Order Hub already surfaces the newly created order with the matching
status. Production, packing, and route generation remain explicit
operator actions in their dedicated modules.

## Permissions

Page + action enforce `OWNER | ADMIN | MANAGER | CUSTOMER_SERVICE |
CATERING_SALES`. `workspace.moroz@gmail.com` always bypasses.

## Remaining limitations

- Stripe / terminal payments are not enabled (placeholders only).
- The "send to production" / "create packing" / "create route" CTAs are
  not yet wired into the post-create page. The modules that drive them
  are unchanged and can be visited directly.
- Meal-plan cycle picker is not yet inline; meal-plan-driven order
  generation is handled by the Meal Plan module.
- Bar event mode does not include alcohol-specific compliance fields.

## Next recommendations

1. Inline `MealPlanCycle` and `CateringQuote` selectors in the Items
   step.
2. Add a `creationSource = STOREFRONT` / `CHANNEL_IMPORT` audit on the
   existing storefront and channel ingestion paths.
3. Implement Stripe checkout for `MANUAL_ORDER` once Stripe is enabled
   workspace-wide (already gated by the Billing module).
4. Build a post-create "next step" drawer offering production / packing
   / route creation as explicit, opt-in actions.
