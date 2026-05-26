# POS Terminal — Architecture

## Goals

1. **Single order spine** — POS checkout calls `createOrderViaCenter` so lifecycle, CRM hooks, and limits match manual + storefront flows.
2. **Explicit commerce records** — `POSTransaction`, `POSPayment`, `POSReceipt`, and `POSAuditEvent` give finance-friendly artifacts without storing card data.
3. **Honest payments** — No in-app card capture; placeholders and external-terminal paths only mark paid when staff confirms.

## Layering

| Layer | Responsibility |
| --- | --- |
| `lib/pos/*` | Types, routing hints, hardware/offline copy, permission key constants. |
| `services/pos/*` | Checkout orchestration, register/shift CRUD, CRM touch-up, analytics event, kitchen enqueue, inventory impact rows, receipt text. |
| `actions/pos.ts` | Server actions for checkout (zod) + form wrappers returning `void` for Next forms. |
| `app/dashboard/pos/*` | UI routes + `PosSubnav`; plan gate in `layout.tsx`. |
| `components/dashboard/pos-terminal-client.tsx` | Client cart + offline guard for placeholder card modes. |

## Checkout sequence (`pos-checkout-service`)

1. `canUseFeature(userId, "pos_terminal")`.
2. Optional `COMPED` guard via `hasPermission(..., "pos_comp")` (manager/owner style).
3. Validate register (+ optional open shift).
4. Build `OrderCreateInput` (`orderType: POS_SALE`, `statusKey: CONFIRMED`, lines, fulfillment, payment).
5. `createOrderViaCenter` → `Order` + items.
6. Persist `POSTransaction`, `POSPayment` (status mirrors order payment), `POSReceipt`, `POSAuditEvent` in a DB transaction.
7. `auditLog` (`POS_CHECKOUT_COMPLETED`), `logPosCheckoutAnalytics`, `enqueueKitchenRoutingForPosOrder`, `recordPendingInventoryImpactsForPosOrder`, `syncPosOrderToCrm`.

## Integration touchpoints

- **Production**: `pos-kitchen-routing-service` creates batches/work items when routing ≠ `NO_KITCHEN_REQUIRED` / `READY_NOW`.
- **Inventory**: `PosInventoryImpactEvent` rows with `PENDING_CONFIGURATION` until recipe/stock rules exist.
- **CRM**: `syncPosOrderToCrm` recomputes metrics when an email is resolvable post-order.
- **Platform**: `/platform/pos` lists workspaces with recent POS activity (sanitized aggregates only).

## Non-goals (current release)

- Native Stripe Terminal, Epson USB, or cash-drawer pulse control.
- Offline-tolerant checkout without server round-trip.
- Full table-service floor plan / coursing.
