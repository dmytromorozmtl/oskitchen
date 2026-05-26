# POS — Final completion and polish

## Routes (do not remove)

- `/dashboard/pos`
- `/dashboard/pos/terminal`
- `/dashboard/pos/registers`
- `/dashboard/pos/shifts`
- `/dashboard/pos/transactions`
- `/dashboard/pos/receipts`
- `/dashboard/pos/reports`
- `/dashboard/settings/pos`

## Product rules (non-negotiable)

1. **Ready-now / counter POS** must not require a future pickup date when `requiresScheduledServiceDate` returns false for that profile (`lib/fulfillment/fulfillment-requirements.ts`).
2. **Made-to-order** routes to kitchen/production when the catalog + order shape requires it.
3. **Scheduled pickup** requires date/window when rules say so (metadata `scheduledPickup` on POS).
4. **Delivery** requires address before operational completion.
5. **Guest placeholder email** (`@local.kitchenos.invalid`) must not display as a real customer email — use `formatCustomerPrimaryLabel` / `formatCustomerContactSubtitle`.
6. **No fake Stripe Terminal**; no raw card data in UI, logs, or audits.
7. **Comp / void / refund placeholders** require permission + reason + audit when implemented as mutable actions.

## Implementation anchors

- Blockers: `services/orders/order-blocker-service.ts` (`POS_TRANSACTION_MISSING`, `RECEIPT_MISSING` for `POS_SALE`).
- Lifecycle + transitions: `services/orders/order-lifecycle-service.ts`, `services/workflows/order-lifecycle-service.ts`.
- Fulfillment intent: POS metadata helpers in `lib/fulfillment/fulfillment-requirements.ts`.

## Remaining polish (P2)

- Loading skeletons on grid + cart during slow networks.
- Clear “external terminal paid” attestation copy (already directionally supported via payment modes).
