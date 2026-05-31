# Audit Logs Module Audit (Pre–Audit Trail Center)

> **Update (implementation):** Canonical route `/dashboard/audit-logs` now exists; `/dashboard/security/audit-logs` redirects with `tab=security`. Model, writer, redaction, retention/export tables, and UI described below have been superseded by the Enterprise Audit Trail Center — see `docs/AUDIT_LOGS_READY_REPORT.md`.

OS Kitchen audit logging before the Enterprise Audit & Activity Trail transformation.

## Current routes and UI

| Route | Behavior |
| --- | --- |
| `/dashboard/security/audit-logs` | **Legacy:** now redirects to `/dashboard/audit-logs?from=security&tab=security`. |
| `/dashboard/audit-logs` | **Canonical:** Audit Trail Center (KPIs, tabs, filters, table, detail drawer, export). |

## Current data model (`AuditLog`)

| Field | Notes |
| --- | --- |
| `id` | UUID |
| `organizationId`, `workspaceId` | Optional org/workspace scope |
| `userId` | Optional actor (`UserProfile`) |
| `action` | Free string (120) |
| `entityType`, `entityId` | Optional target |
| `metadataJson` | Optional JSON |
| `ipAddress`, `userAgent` | Stored in **plain text** (PII / fingerprinting risk) |
| `createdAt` | Timestamp |

**Missing vs enterprise needs:** `category`, `severity`, `source`, `actorStaffId`, `actorEmail`, `actorRole`, `entityLabel`, HTTP context (`route`, `method`, `requestId`), hashed IP/UA, `beforeJson` / `afterJson` / `diffJson`, `redactionApplied`, retention policy row, export job row.

**Risk:** Plain IP and full user-agent in DB — **P1 compliance** (minimize PII; prefer hashes for new writes). Legacy columns retained; new writes dual-write hash fields where possible.

## Current writers

| Helper | Location | Behavior |
| --- | --- | --- |
| `recordAuditLog` | `lib/audit-log.ts` | `prisma.auditLog.create` with `.catch(() => undefined)` — **swallows all errors**; no redaction; no taxonomy; optional `workspaceId` often **omitted** (e.g. production actions) so events **do not appear** in UI that filters only by `workspaceId ∈ owned workspaces`). |
| `recordPlatformAudit` | `lib/platform-audit.ts` | Tenant-agnostic row; `workspaceId` null — correct for platform but invisible to workspace-only UI. |

**Call sites:** `actions/brands.ts` (with `workspaceId`), `actions/production.ts` and `services/production/generate-production.ts` (**often no `workspaceId`**).

**Gaps:** No settings/order/import/billing/webhook coverage via central writer; no failed-action logging; no structured severity/source.

| Issue | Current | Risk / impact | Fix | Pri |
| --- | --- | --- | --- | --- |
| 1 | UI workspace-only filter | Production logs missing from list | Resolve `workspaceId` from owner when absent; query `OR userId = actor` | P1 |
| 2 | No redaction | Secrets in `metadataJson` if callers mistake | Redaction engine + `redactionApplied` | P0 |
| 3 | Plain IP/UA | PII retention | New `ipHash` / `userAgentHash`; keep legacy reads | P1 |
| 4 | No taxonomy | Unsearchable, inconsistent | `category`, `severity`, `source`, action registry | P1 |
| 5 | No before/after | No change accountability | `beforeJson` / `afterJson` / `diffJson` | P1 |
| 6 | No permissions on page | Any session user hitting URL sees form (no explicit gate in page) | `audit-permissions` + `notFound` / redirect | P0 |
| 7 | No export | Compliance gap | `AuditExport` + CSV/JSON with formula-safe CSV | P1 |
| 8 | No retention policy model | Ad-hoc DB growth | `AuditRetentionPolicy` + docs for legal hold | P2 |
| 9 | No pagination | Loads 100 max, no cursor | Indexed pagination + date range | P2 |
| 10 | No security / suspicious view | SOC2-style gaps | Security tab + heuristics on query | P2 |
| 11 | No entity timeline API | Support cannot trace order | `getAuditTimeline(entityType, entityId)` | P1 |
| 12 | Superadmin not explicit | Platform admin same as owner | `SUPERADMIN` source + bypass read | P2 |
| 13 | Deletes possible via Prisma | Immutability not enforced in app | No delete UI; server actions never delete | P0 |
| 14 | Empty state only one string | Poor onboarding | Contextual empty states per tab | P2 |

## Permissions (before)

Page used `requireSessionUser` only — **no role-based audit capability check**.

**P0** — Introduce `lib/audit/audit-permissions.ts`: owner/admin full, manager operational subset, staff none by default; `workspace.moroz@gmail.com` full bypass.

## Export / retention (before)

None in-app.

## Event coverage (before)

Brands + production paths only; platform impersonation via `recordPlatformAudit`.

## Recommendations summary

1. Extend `AuditLog` additively + new `AuditRetentionPolicy` + `AuditExport`.
2. Central `auditLog()` with redaction, diff, non-throwing write (log failures to server logger only).
3. Canonical `/dashboard/audit-logs` + redirect from `/dashboard/security/audit-logs`.
4. Query service: workspace OR owner `userId` for legacy rows.
5. Audit Trail Center UI: KPIs, tabs, filters, table, detail drawer, export, retention sub-route.
6. Instrument critical paths (settings saves, order create, sample webhooks) + migrate `recordAuditLog` to enriched writer.

See `docs/AUDIT_LOGS_ARCHITECTURE.md` and `docs/AUDIT_LOGS_READY_REPORT.md` for the implemented design.
