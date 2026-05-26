# POS Workflow Completion — Final (MVP)

## Principles (non-negotiable)

- **No fake card processing** — no PAN storage, no simulated Stripe Terminal.  
- **External terminal** = staff attestation that payment was taken on an external device.  
- **Walk-in / counter** must not require a future pickup date.  
- **Made-to-order** routes to production/kitchen when product metadata requires it (`services/pos/pos-kitchen-routing-service.ts`).  
- **Checkout** creates: Order (`creationSource: POS`), `POSTransaction`, payments, receipt row when applicable, activity + audit entries (`services/pos/pos-checkout-service.ts`).

## Key modules

| Concern | Path |
|---------|------|
| Types / rules | `lib/pos/*`, `lib/orders/pos-order-rules.ts` |
| Checkout | `services/pos/pos-checkout-service.ts` |
| Register / shift | `services/pos/pos-register-service.ts`, `pos-shift-service.ts` |
| Receipts | `services/pos/pos-receipt-service.ts` |
| CRM / guest | `lib/customers/customer-display.ts`, `services/crm/guest-customer-service.ts` |

## Lifecycle linkage

If a `POS_SALE` order lacks a `POSTransaction`, the **order blocker** `POS_TRANSACTION_MISSING` fires and **confirms / production** are guarded — data teams can reconcile without pretending payment succeeded.

## Terminal UX checklist

- Large touch targets, sticky cart, search, category filters, shift/register context — iterate under `app/dashboard/pos/terminal`.
