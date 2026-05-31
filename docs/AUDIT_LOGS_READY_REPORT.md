# Audit Trail Center — Ready Report

## Summary

OS Kitchen now ships an enterprise-oriented **Audit Trail Center** at `/dashboard/audit-logs` with structured logging, redaction, retention/export primitives, privileged exports, and a security-focused tab preset. Legacy `/dashboard/security/audit-logs` redirects without breaking bookmarks.

## Data model

- `AuditLog` extended with taxonomy fields, severity, source, HTTP context hashes, JSON snapshots, diff, redaction flag (legacy IP/UA columns retained but cleared on new writes).
- `AuditRetentionPolicy` (1:1 workspace) and `AuditExport` (history of compliance exports).

## Event taxonomy

See `docs/AUDIT_EVENT_TAXONOMY.md`. Central catalogue in `lib/audit/audit-types.ts` / `lib/audit/audit-actions.ts`.

## Writer + redaction

- `auditLog()` + `auditLogLegacyCompat()` (`services/audit/audit-service.ts`, `lib/audit/audit-log.ts`).
- Redaction engine `lib/audit/audit-redaction.ts`.

## UI + filters

- KPI row, tabs, GET-filter form, export history, cursor pagination, detail sheet (`app/dashboard/audit-logs/*`).
- URL parser `lib/audit/audit-search-params.ts` (kept out of `"use server"` modules for client compatibility).

## Entity timelines

`getAuditTimeline()` available; drawer shows related rows. Embed on entity pages as follow-up.

## Security / integration / import / billing / AI views

Tab presets documented per topic files; Stripe billing webhook auditing implemented. Other channel webhooks and AI/automation hooks are staged in docs for incremental instrumentation.

## Permissions + retention

Documented in `docs/AUDIT_LOGS_PERMISSIONS.md` and `docs/AUDIT_RETENTION_POLICY.md`.

## Performance

Server-side pagination (50 rows + cursor), indexed filters in Prisma schema, export capped at 5,000 rows synchronous generation.

## Limitations / next recommendations

1. **Automated retention job** — policy stored; needs worker to enforce deletes/archives.
2. **Async export queue** — large tenants need background jobs + `fileUrl` on `AuditExport`.
3. **Broader instrumentation** — reports downloads, copilot, channel webhooks, auth login/failure.
4. **Suspicious activity rules** — replace heuristic KPI with dedicated detector + `SECURITY_SUSPICIOUS_ACTIVITY` events.
5. **Staff vs owner role matrix** — `UserProfile.role` is coarse; align with staff capability matrix for accountant/viewer rules.

## Verification

`npm run typecheck` and `npm run build` succeed after these changes.
