# Audit Logs UI

## Routes

- `/dashboard/audit-logs` — Audit Trail Center (server page + `audit-logs-view.tsx` client).
- `/dashboard/audit-logs/retention` — retention policy form (owner/admin/superadmin).
- `/dashboard/security/audit-logs` — redirects to canonical route with `tab=security`.

## Features

- KPI cards (today, warnings, critical, webhooks heuristic, permissions heuristic, imports heuristic, billing, suspicious heuristic).
- Tabs: Activity, Security, Data changes, Integrations, Imports, Billing, AI / Automation, Exports.
- Filter form (GET, deep-linkable) + reset.
- Table with severity badges, load-more pagination (cursor).
- Detail sheet (lazy fetch via `getAuditLogDetailAction`); sensitive JSON stripped for non-privileged roles.
- Export CSV/JSON (privileged) + export history list.

## Empty states

Implemented in `audit-logs-view.tsx` for: no events, no security events (security tab), no filter matches.
