# Security Audit Events

## Tab preset

`filters.tab === "security"` narrows to `SECURITY`, `AUTH`, `PERMISSIONS`, or elevated severities.

## Instrumented examples

- `ROLE_PERMISSION_CHANGED` — custom staff role upsert (`actions/staff.ts`).
- `STAFF_INVITED` — staff create action.
- Platform audits — `recordPlatformAudit` uses `source: SUPERADMIN`, `category: SECURITY`.

## Heuristic “suspicious” KPI

Counts rows matching `SECURITY_SUSPICIOUS` action (future) or `CRITICAL` severity — tune as rules mature.

## Failed auth

Login/failure events require auth subsystem hooks (placeholder until Supabase auth audit stream is integrated).
