# Order Detail UX + Next Actions — Final (MVP)

## Goals

One order page should answer: **what happened**, **what is blocked**, and **what to do next** — without showing raw UUIDs as the primary title.

## Implemented surfaces

- **Services:** `services/orders/order-detail-service.ts` (loads order + blockers + lifecycle + next actions + activity).  
- **Components:** `components/orders/order-detail-header.tsx`, `order-status-summary.tsx`, `order-detail-panels.tsx`, `order-detail-tab-nav.tsx`, related cards.  
- **Next actions:** `resolveOrderNextActionBundle` in `services/orders/order-next-action-service.ts` (includes mapping, delivery date, POS txn/receipt, production/pickup progression).

## UX rules

1. **Title:** prefer receipt number / human-friendly label (`formatOrderPageTitle`).  
2. **Source badge:** POS / Manual / Channel — derive from `creationSource`, `orderType`, imports.  
3. **Blockers:** always derived from `blockersFromPreloaded` so Today / Hub / Detail agree.  
4. **Tabs:** Overview is mandatory; deepen Production / Packing / Fulfillment / Audit per persona.

## Remaining P1

- Full tab parity (9 tabs) where not yet routed in UI.  
- Audit tab: **permission-gated** + redacted payload (see `lib/audit/audit-redaction.ts` patterns).
