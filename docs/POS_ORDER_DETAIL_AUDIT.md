# POS order detail — architecture audit

**Scope:** POS checkout → `Order` row → Order Detail (`/dashboard/orders/[orderId]`), lifecycle, blockers, branches, CRM, activity, navigation.  
**Date:** 2026-05-14

## 1. POS checkout & order creation

| Topic | Current (before polish) | Issue | Priority | Fix |
| --- | --- | --- | --- | --- |
| Checkout | `checkoutPosSale` → `createOrderViaCenter` with `orderType: POS_SALE`, `creationSource: POS` | Metadata lacked explicit pickup intent | P1 | Persist `sourceMetadataJson.pos.fulfillmentIntent` (`PICKUP_NOW` / `DELIVERY` / `DINE_IN`) |
| Customer | Placeholder `@local.kitchenos.invalid` when no email | Shown raw in header | P1 | `customer-display` + `OrderCustomerSummary` |
| Service date | `pickupDate` often null | All `CONFIRMED` orders treated as needing date | P0 | `requiresScheduledServiceDate()` — POS pickup-now exempt |

## 2. Lifecycle & FoodOps stage

| Topic | Issue | Priority | Fix |
| --- | --- | --- | --- |
| `deriveOrderLifecycleStage` | `CONFIRMED` + null `pickupDate` → `NEEDS_FULFILLMENT_INFO` always | P0 | Gate on `requiresScheduledServiceDate` |
| Duplicate labels | DB `CONFIRMED` + stage + phase all uppercase | P2 | `OrderStatusSummary` + `OrderOperationalStateBadge` |

## 3. Blockers & branches

| Topic | Issue | Priority | Fix |
| --- | --- | --- | --- |
| `MISSING_FULFILLMENT_DATE` | Same blanket rule as lifecycle | P0 | Align with fulfillment requirements |
| `NEEDS_PRODUCTION` branch | Shown even when scheduling missing | P1 | `NEEDS_FULFILLMENT_SCHEDULING` branch; suppress kitchen branch until satisfied |
| Routing “0 stops” | Implied incompleteness for pickup | P2 | Fulfillment tab explains pickup does not need routes |

## 4. Next actions

| Topic | Issue | Priority | Fix |
| --- | --- | --- | --- |
| “Send to production” | Allowed by enum graph though misleading | P1 | `validateOrderDbStatusTransition` blocks `PREPARING` when service date required but missing; UI uses `resolveOrderNextActionBundle` |

## 5. CRM & guests

| Topic | Issue | Priority | Fix |
| --- | --- | --- | --- |
| CRM link | No `kitchenCustomer` for walk-in | P2 | Clarified as optional guest |
| Marketing | Placeholder domain | P3 | Already skipped in `upsertCustomerFromOrder`; display rules hide in UI |

## 6. Activity

| Topic | Issue | Priority | Fix |
| --- | --- | --- | --- |
| Sparse events | Only checkout + order created | P2 | Added `POS_PAYMENT_RECORDED`, `POS_RECEIPT_CREATED`; humanized labels in `activity-service` |

## 7. Navigation

| Topic | Issue | Priority | Fix |
| --- | --- | --- | --- |
| Duplicate “Preorders” | `/dashboard/menus` under Orders & Sales as Preorders + Menus group | P1 | Commerce group: POS, Order hub, Orders, Storefront, Channels — **menus link removed from Commerce** |
| Group title | “Orders & Sales” | P2 | Renamed **Commerce** |

## 8. Platform / integrity

| Topic | Priority | Fix |
| --- | --- | --- |
| Support diagnostics | P2 | `/platform/workspaces/[workspaceId]` POS counts |
| Integrity rules library | P3 | `lib/integrity/pos-integrity-rules.ts` (extend over time) |

## 9. Remaining limitations

- Mixed-cart split (ready-now vs kitchen vs packing) is **heuristic** from work items + recipe presence, not full recipe graph per line.
- `fulfillmentIntent: SCHEDULED_PICKUP` requires POS UI to set metadata (not yet a dedicated POS screen).
- Sticky mobile action bar not implemented (P3).
