# System Health, Data Integrity, Error Recovery (Final)

## Routes

- `/dashboard/system-health/data-integrity`  
- `/dashboard/error-recovery`  
- `/platform/tools`, `/platform/integrations`, `/platform/webhooks`

## Detection themes

Orders without items, POS integrity (txn/receipt), delivery address, pickup date requirements, mapping to deleted products, stuck imports/webhooks/jobs, billing inconsistencies.

## Actions

Retry (safe), open fix route, create task, assign support, ignore-with-reason (audited). **No silent destructive fixes.**

## Alignment

Integrity rules should stay consistent with **order blockers** so operators see the same language in Order detail, Today, and Health.
