# Order lifecycle completion (Commercial MVP)

This document describes the **Prisma `OrderStatus` pipeline** hardening: validation, audit, CRM side-effects, and dashboard UX.

## Code map

| Path | Role |
|------|------|
| `lib/workflows/order-lifecycle-rules.ts` | Allowed transitions on the DB enum, guards (line items, delivery address for DELIVERY, payment before COMPLETED). |
| `services/workflows/order-lifecycle-service.ts` | `listAllowedOrderStatusTransitions`, `describeOrderNextBestAction`, `auditOrderDbStatusChange`. |
| `actions/orders.ts` | `updateOrderStatus` enforces guards, writes audit, recomputes CRM metrics on COMPLETED, revalidates key routes. |
| `components/orders/order-detail-operations.tsx` | Client controls: validated status buttons, confirm for complete/cancel, internal notes editor. |
| `app/dashboard/orders/[orderId]/page.tsx` | Next-best-action card, production/packing/route summaries, customer lookup link, internal notes. |

## Status graph (DB enum)

- `PENDING` → `CONFIRMED` or `CANCELLED`
- `CONFIRMED` → `PREPARING`, `PENDING`, or `CANCELLED`
- `PREPARING` → `READY`, `CONFIRMED`, or `CANCELLED`
- `READY` → `COMPLETED`, `PREPARING`, or `CANCELLED`
- `COMPLETED` / `CANCELLED` → terminal

Wider operational phases (`statusDetail`, production/packing/route entities) remain **orthogonal**; this layer prevents invalid **core order status** jumps.

## Guards

1. **Line items**: Cannot advance to `CONFIRMED`+ without at least one `OrderItem`.
2. **Delivery address**: For `DELIVERY`, `READY` and `COMPLETED` require `deliveryAddressJson` present.
3. **Payment**: For `COMPLETED`, if `paymentStatus` is set it must normalize to one of: `paid`, `partial`, `external`, `not_required` (case-insensitive).

## Audit and CRM

- Every successful `updateOrderStatus` emits `ORDER_STATUS_CHANGED` via `auditLog` (PII masking on entity label path as configured).
- `COMPLETED` triggers `recomputeMetricsForOrderEmail` for the order’s customer email (same pattern as order creation).
- Internal kitchen notes updates log `ORDER_INTERNAL_NOTES_UPDATED` with **metadata only** (character count), not raw note text.

## UX

- Order detail shows **Pipeline & next action** with allowed transition buttons.
- **Complete** and **Cancel** require explicit confirmation (Alert Dialog).
- Server errors surface inline with optional **Open fix** deep link when the guard supplies `fixHref`.

## Honest limitations (P2/P3)

- Automated alignment of `statusDetail` / production batch completion / packing verification with `OrderStatus` is **not** fully encoded here; teams may still need manual coordination until deeper workflow hooks exist.
- Channel-specific “sent to production” may create work items separately; guards do not yet verify production work completion before `READY`.

## Verification

- `npm run typecheck`
- `npm run build`
- Manual: create order → confirm → prepare → ready → complete; attempt invalid skips and delivery-without-address cases on `/dashboard/orders/[orderId]`.
