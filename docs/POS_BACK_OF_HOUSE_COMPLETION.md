# POS + Back-of-House Completion

## Strategic role

POS is **operational**, not a isolated checkout: it must feed **kitchen routing**, **inventory signals**, **CRM**, **analytics**, and **audit** without pretending to process cards in-browser.

## Routes

`/dashboard/pos`, `/terminal`, `/registers`, `/shifts`, `/transactions`, `/receipts`, `/reports`, `/dashboard/settings/pos`.

## Rules (non-negotiable)

- Walk-in / counter: **no future pickup date** requirement (`lib/fulfillment/fulfillment-requirements.ts` + POS normalization).  
- Ready-now: may complete when paid and no kitchen/packing dependency.  
- Made-to-order: routes to production (`services/pos/pos-kitchen-routing-service.ts`).  
- External terminal: **attestation only** — no PAN storage, no fake Stripe Terminal.  
- Guest placeholder emails: hidden from marketing surfaces (`lib/customers/customer-display.ts`).  
- Integrity: POS sale without `POSTransaction` → blocker `POS_TRANSACTION_MISSING` (`services/orders/order-blocker-service.ts`).

## Depth checklist (P1)

- Variance approval thresholds + manager override audit.  
- Modifier fidelity on kitchen tickets.  
- Receipt reprint policy when `RECEIPT_MISSING` fires.
