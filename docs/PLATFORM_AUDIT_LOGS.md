# Platform audit logs

## UI

`/platform/audit` uses `listPlatformAuditTail` from `services/platform/platform-audit-service.ts`:

- Rows where `category === "PLATFORM"` **or** `action` starts with `platform.`.

## Writing audits

`recordPlatformAudit` (`lib/platform-audit.ts`) delegates to `auditLog` with `category: "PLATFORM"` and `source: "SUPERADMIN"`.

## Fields shown

When, `actorEmail`, action, category, entity label/type, workspace id. Raw `metadataJson` is intentionally not dumped in the table UI to reduce accidental secret display — link to a redacted detail view if needed later.
