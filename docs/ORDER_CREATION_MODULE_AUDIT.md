# Order creation audit (OS Kitchen)

**Date:** 2026-05-11
**Scope:** `/dashboard/orders/new`, `actions/orders.ts → createOrder`,
the `Order` / `OrderItem` Prisma models, and adjacent CRM, packing,
production, and route triggers.

## TL;DR

The current `/dashboard/orders/new` page is a **weekly preorder form**
hard-coded to one shape of business (meal prep style). It blocks the
page entirely when no active weekly menu exists. Items must come from a
single active menu. The form supports manual but only manual-as-preorder
flow.

This is not a general Order Creation Center — it is a single preorder
intake form mislabeled as the only way to create an order.

## Findings

| # | Area | Current state | Why limiting | Affected business types | Fix | Priority |
|---|------|---------------|--------------|--------------------------|-----|----------|
| 1 | Page entry gate | Hard error if no active weekly menu | Blocks all order creation | Restaurant, café, bar, bakery, catering | Render order-type chooser first, then conditionally require menu | P0 |
| 2 | Order types | Implicit single "preorder" type | No vocabulary for kitchen/catering/bar/etc. | All non-meal-prep | New `OrderCreationType` taxonomy + matching UI | P0 |
| 3 | OrderItem.productId | Required + Restrict FK | Cannot capture custom lines | Bakery, catering, bar, manual one-off | Make optional + add title/unit price/notes/modifiers | P0 |
| 4 | OrderStatus enum | 6 values (PENDING/CONFIRMED/PREPARING/READY/COMPLETED/CANCELLED) | Cannot express DRAFT / REQUESTED / IN_PRODUCTION / READY_FOR_PACKING / PACKED / READY_FOR_PICKUP / OUT_FOR_DELIVERY | Catering, meal prep, third-party | Widen via `statusDetail` string column; keep DB enum | P1 |
| 5 | FulfillmentType enum | 2 values (PICKUP, DELIVERY) | Cannot model dine-in, event delivery, catering loadout, 3PD, custom | Restaurant, bar, catering, ghost kitchen | Widen via `fulfillmentDetail` string column | P1 |
| 6 | Payment | Not modeled | No way to mark pay-later / invoice / paid externally | All | Add `paymentMode` + `paymentStatus` strings | P1 |
| 7 | Customer | Inline name/email/phone | No link to existing `KitchenCustomer` | All | Optional `customerId` FK + lookup step | P1 |
| 8 | Items source | Only `Product` rows | Cannot reference channel-mapped products, custom items, or catalog items | All | OrderItem allows nullable `productId`, plus custom item fields | P0 |
| 9 | Time window | Only `pickupDate` (date) | No window or specific time | Restaurant, catering | Add `fulfillmentWindowStart/End` timestamps | P2 |
| 10 | Delivery address | Not on Order | Cannot capture delivery details | Anyone using delivery | Add `deliveryAddressJson` | P1 |
| 11 | Notes | Single `notes` field | Cannot separate kitchen / packing / delivery / allergy / dietary | All | Add 5 typed note fields | P2 |
| 12 | Subtotals / tax / fees / discount | Not stored | Only `total` recorded | All | Add 4 decimal columns | P2 |
| 13 | Source metadata | Mostly missing (`channelTraceJson` only for channel imports) | Cannot link to catering quote / meal plan / storefront in one place | Catering, meal plan, storefront | Add `creationSource` + `sourceMetadataJson` | P1 |
| 14 | External order id / provider | Only `ExternalOrder` join | Hard to query | Sales channels | Mirror on Order (`channelProvider`, `externalOrderId`) | P3 |
| 15 | Validation | Plan-month limit + body shape | OK but only meal-prep shape | All | Pluggable per-type validation | P1 |
| 16 | CRM upsert | Always email-based | OK but ignores existing `KitchenCustomer` link | All | Honor `customerId` when present | P2 |
| 17 | Production/packing/route side-effects | None — orders sit at PENDING | OK but the next-step UX has nothing | All | Post-create "next step" menu (opt-in, never silent) | P2 |
| 18 | Empty state | "Activate a weekly menu" full page block | Blocks every business type | Non-meal-prep | Show in-context warning only inside weekly preorder mode | P0 |
| 19 | Permissions | None — anyone signed in | Wrong for kitchen staff | Larger teams | Reuse `lib/staff/staff-permissions` via a new `canCreateOrder` capability | P1 |
| 20 | Channel imports | Outside this page (separate ingestion) | OK | Sales channel | Keep — but link them in the source switcher as read-only references | P3 |

## Priority legend

- **P0** — Cannot create non-meal-prep orders today.
- **P1** — Workflow value gap.
- **P2** — UX polish.
- **P3** — Future.

## Safety contract

1. `/dashboard/orders/new` keeps working when no active weekly menu exists.
2. Existing `createOrder` action keeps working unchanged — the legacy
   path remains for any external caller / test seed.
3. No fake payments.
4. Production / packing / routes side effects are never triggered
   silently — they appear in a post-create menu as opt-in actions.
5. `OrderItem.productId` becomes nullable, but no existing row changes.
6. The `Order` and `OrderItem` migration is purely additive (new
   optional columns + a JSON column for source metadata).
7. `workspace.moroz@gmail.com` bypasses any role gate.
8. Strict TypeScript and stable Prisma client.
