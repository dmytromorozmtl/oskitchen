# Audit Entity Timelines

## API

`getAuditTimeline(scope, entityType, entityId, take?)` in `services/audit/audit-query-service.ts` returns recent `AuditLog` rows for the same entity within the caller’s workspace scope.

## UI usage

The audit detail drawer loads related rows for the same `entityType` + `entityId` when present.

## Next steps

Embed timeline panels on entity pages (orders, customers, imports, routes, etc.) by calling a thin server wrapper or passing `entityType`/`entityId` into a shared component.
