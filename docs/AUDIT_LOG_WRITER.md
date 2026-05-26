# Audit Log Writer

## Entry point

`auditLog(input: AuditLogInput)` — `services/audit/audit-service.ts`

## Behaviour

- Never throws to business callers; failures logged via `logger.error`.
- Redacts `before`, `after`, `metadata` through `audit-redaction.ts`.
- Computes shallow object diff when both `before` and `after` are plain objects.
- Persists `ipHash` / `userAgentHash` instead of raw IP/UA on new rows (`ipAddress` / `userAgent` forced null).
- `auditLogLegacyCompat` infers `category` from `action` + `entityType` for legacy `recordAuditLog` calls.

## Actor fields

Populate `actor.userId` (and optionally `staffId`, `email`, `role`) when known so filters and exports remain useful.
