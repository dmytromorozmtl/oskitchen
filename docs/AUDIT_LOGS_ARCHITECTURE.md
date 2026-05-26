# Audit Logs Architecture

## Layers

1. **Writer** — `auditLog()` in `services/audit/audit-service.ts` (server-only). Resolves `workspaceId` from owner when omitted, applies redaction, optional shallow diff, hashes IP/UA (`AUDIT_HASH_SALT` optional).
2. **Legacy adapter** — `recordAuditLog` in `lib/audit-log.ts` → `auditLogLegacyCompat()` maps old call sites into taxonomy + redaction.
3. **Query** — `services/audit/audit-query-service.ts`: workspace scope (owned workspaces OR legacy `userId` + `workspaceId: null`), tab presets, manager category restrictions, KPI counts, pagination, entity timeline.
4. **Export** — `services/audit/audit-export-service.ts`: synchronous CSV/JSON (cap 5,000 rows), `AuditExport` row, self-audit `AUDIT_EXPORT_GENERATED`.
5. **UI / actions** — `app/dashboard/audit-logs/*`, `actions/audit-center.ts` (server actions only; URL parsing in `lib/audit/audit-search-params.ts`).

## Principles

- Append-only for end users (no delete API in product UI).
- Workspace-scoped visibility via `buildAuditWhere`.
- Secrets never persisted; sensitive keys stripped in `lib/audit/audit-redaction.ts`.
- Superadmin email `workspace.moroz@gmail.com` bypasses sensitive-detail restrictions (`lib/audit/audit-permissions.ts`).
