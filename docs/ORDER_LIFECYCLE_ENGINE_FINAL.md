# Order Lifecycle Engine — Final (MVP)

## Source of truth (code)

| Layer | Path |
|-------|------|
| Types | `lib/orders/order-lifecycle-types.ts` |
| Stage derivation | `lib/orders/order-lifecycle-status.ts` |
| Stage graph (narrative) | `lib/orders/order-lifecycle-transitions.ts` |
| Blocker catalog | `lib/orders/order-blockers.ts` |
| Blocker derivation | `services/orders/order-blocker-service.ts` |
| DB transition guards | `lib/orders/order-lifecycle-guards.ts` + `services/workflows/order-lifecycle-service.ts` |
| Lifecycle view | `services/orders/order-lifecycle-service.ts` |
| Next actions | `services/orders/order-next-action-service.ts` |

## Blocker codes (including POS integrity)

All blockers carry: label, explanation, severity, `fixHref`, `recommendedAction` via `ORDER_BLOCKER_META` / `toOrderBlocker`.

**Recent additions:** `POS_TRANSACTION_MISSING`, `RECEIPT_MISSING` — for `creationSource === "POS"` and `orderType === "POS_SALE"`, ensures register audit trail coherence without faking payments.

## Guard rules (summary)

- No production path while **critical** blockers exist (items, unmapped channel lines, integration failure, **missing POS transaction** for POS sales).  
- Fulfillment blockers gate **SEND_TO_PRODUCTION** (e.g. missing delivery address, missing fulfillment date when required — see `lib/fulfillment/fulfillment-requirements.ts`).  
- **COMPLETE** respects payment / packing / production blockers as implemented in `validateIntentAgainstDb`.  
- Destructive transitions must remain **explicit**, **audited**, and never silent (enforce in workflow services / server actions).

## Activity + audit

Successful transitions should continue to emit **activity** and **audit** events from the workflow layer (extend when adding new intents).

## Documentation debt

Long enum lists in the product spec (payment / fulfillment enums) are **partially** modeled as strings/JSON today; expand Prisma only with migrations and backward compatibility.
