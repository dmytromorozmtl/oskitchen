# Support & audit logs

## Ticket detail

When `workspaceId` is set, the detail page loads recent `AuditLog` rows for that workspace from **24h before ticket creation** to now (cap 25). This gives coarse operational context without dumping entire histories.

## Future

- Correlate `relatedEntityType` / `relatedEntityId` with audit `entityType` / `entityId`.  
- Emit audit entries on every ticket mutation from actions (currently `SupportTicketEvent` covers lifecycle).
