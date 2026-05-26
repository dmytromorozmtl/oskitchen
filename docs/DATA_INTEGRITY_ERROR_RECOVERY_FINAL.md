# Data Integrity + Error Recovery — Final (MVP)

## Routes

- `/dashboard/system-health/data-integrity`  
- `/dashboard/error-recovery`  
- `/platform/tools`, `/platform/integrations`, `/platform/webhooks`

## Services / libs

- `services/integrity/integrity-service.ts`  
- `lib/integrity/integrity-rules.ts`, `lib/integrity/pos-integrity-rules.ts`  
- `services/recovery/error-recovery-service.ts` (and related dashboard actions)

## Detection themes

Align integrity rules with **order blockers**:

- Orders without items  
- POS sale without `POSTransaction` (**POS_ORDER_WITHOUT_TRANSACTION** in integrity; **POS_TRANSACTION_MISSING** on order blockers)  
- POS placeholder email treated as real in customer surfaces  
- Delivery without address  
- Scheduled pickup missing date when required  
- Mapping / deleted product / route stop anomalies  
- Failed webhooks / imports / notifications

## Recovery actions

Retry (webhook/notification/import), open entity, create task, assign support, mark ignored **with reason** — **never** silent destructive fixes.

## Safe auto-fix

Only when idempotent and provably safe (e.g. requeue a stuck non-destructive job); otherwise human confirmation.
