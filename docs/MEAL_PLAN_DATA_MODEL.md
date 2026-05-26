# Meal Plan data model

## Tables

| Table | Purpose |
|-------|---------|
| `meal_plans` | The recurring plan itself. Holds customer link, schedule, fulfillment, dietary fields, billing mode, generation mode. |
| `meal_plan_cycles` | One row per recurring cycle. Tracks status, selections, generated order link. |
| `meal_plan_selections` | Per-cycle selections — product or free-text item. |
| `meal_plan_events` | Append-only audit log (plan + cycle level). |
| `meal_plan_templates` | Operator-defined and built-in starter templates. |

`customer_subscriptions` (legacy) is preserved unchanged and linked via
`MealPlan.legacySubscriptionId`.

## Enums

`MealPlanType`: `INDIVIDUAL | FAMILY | CORPORATE_LUNCH | OFFICE_ROTATION | FITNESS_PLAN | SENIOR_MEALS | CUSTOM | TRIAL_PLAN`

`MealPlanStatus`: `DRAFT | ACTIVE | PAUSED | CANCELLED | EXPIRED | NEEDS_REVIEW | COMPLETED`

`MealPlanFrequency`: `WEEKLY | BIWEEKLY | MONTHLY | CUSTOM_RRULE`

`MealPlanFulfillmentMode`: `PICKUP | DELIVERY | MIXED`

`MealPlanBillingMode`: `PAY_LATER | MANUAL_INVOICE | STRIPE_PLACEHOLDER | FREE_TRIAL`

`MealPlanGenerationMode`: `MANUAL_ONLY | PREVIEW_BEFORE_CREATE | AUTO_CREATE_DRAFT_ORDERS | AUTO_CREATE_CONFIRMED_ORDERS` (last value is rejected by the action layer)

`MealPlanCycleStatus`: `UPCOMING | NEEDS_SELECTION | READY_TO_GENERATE | GENERATED | SKIPPED | PAUSED | CANCELLED`

`MealPlanEventType`: `PLAN_CREATED | PLAN_UPDATED | PLAN_PAUSED | PLAN_RESUMED | PLAN_CANCELLED | PLAN_EXPIRED | PLAN_ARCHIVED | CYCLE_CREATED | CYCLE_SKIPPED | CYCLE_SELECTIONS_CHANGED | CYCLE_READY | ORDER_PREVIEWED | ORDER_DRAFT_GENERATED | CUSTOMER_REQUEST | NOTE_ADDED | OTHER`

## JSON fields

| Field | Shape | Notes |
|-------|-------|-------|
| `MealPlan.allergiesJson` | `string[]` | Inherits from CRM if missing; surfaced on every generated order. |
| `MealPlan.dietaryPreferencesJson` | `string[]` | Vegetarian, halal, kosher, etc. |
| `MealPlan.favoriteItemsJson` | `string[]` | Operator hints; not enforced. |
| `MealPlan.dislikedItemsJson` | `string[]` | Operator hints. |
| `MealPlan.pickupWindowJson` | `{ dayOfWeek, start, end }` (optional) | Schema-on-read. |
| `MealPlan.deliveryWindowJson` | `{ dayOfWeek, start, end }` (optional) | Schema-on-read. |
| `MealPlan.deliveryAddressJson` | Address payload | Schema-on-read. |
| `MealPlanTemplate.defaultItemsJson` | `string[]` | Used by wizard prefill. |
| `MealPlanTemplate.dietaryPresetJson` | `string[]` | Used by wizard prefill. |
| `MealPlanEvent.metadataJson` | Free-form | Audit log payload. |

## Indexes

`meal_plans`: `user_id`, `(user_id, status)`, `customer_id`, `next_order_date`, `brand_id`, `location_id`.
`meal_plan_cycles`: `(meal_plan_id, cycle_start_date)`, `(meal_plan_id, status)`, `(status, cycle_start_date)`; unique on `order_id`.
`meal_plan_selections`: `cycle_id`, `product_id`.
`meal_plan_events`: `(meal_plan_id, created_at)`, `cycle_id`.
`meal_plan_templates`: unique `(user_id, name)`, `(user_id, active)`.

## Foreign keys

- `MealPlan.customerId` → `KitchenCustomer` (cascade delete preserves
  data only if the customer is deleted, which is rare).
- `MealPlan.brandId` → `Brand` (set null on delete).
- `MealPlan.locationId` → `Location` (set null on delete).
- `MealPlanCycle.orderId` → `Order` (set null on delete — preserve the
  cycle record even if the order is removed).
- `MealPlanSelection.productId` → `Product` (set null).
- `MealPlanSelection.menuId` → `Menu` (set null).

## Migration strategy

`prisma/migrations/20260511230000_meal_plans_command_center/migration.sql`
creates all enums + tables additively (no drops, no renames). Safe to run
on existing workspaces with `CustomerSubscription` data.
