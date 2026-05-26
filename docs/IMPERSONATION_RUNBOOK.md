# Platform impersonation runbook

**Code:** `actions/platform-impersonation.ts`, `lib/platform/platform-impersonation.ts`

## Behavior

- Only **super-admin** may start impersonation (`requireSuperAdmin`).
- Cannot impersonate another super-admin (`isTargetSuperAdminProtected`).
- Session cookie: `PLATFORM_IMPERSONATION_COOKIE`, **max 1 hour** (`PLATFORM_IMPERSONATION_MAX_SECONDS`).
- Audit events: `platform.impersonation.start` / `platform.impersonation.end` via `recordPlatformAudit`.

## Operational procedure

1. Support ticket must document **reason** (stored in session row, max 500 chars).
2. Start impersonation from Platform Admin UI → redirects to `/platform/dashboard`.
3. Perform minimum necessary actions; end session via **End impersonation** (calls `endPlatformImpersonation`).
4. Weekly review: query audit logs for `platform.impersonation.*` in last 7 days.

## Security gaps (roadmap)

- MFA before impersonation — **not implemented**
- Real-time alert to security channel — **not implemented**
- Shorter TTL for production — configurable via constant only today

## Incident response

If unauthorized impersonation suspected: revoke platform role, rotate `CRON_SECRET` / session secrets per security playbook, review `ImpersonationSession` table for active rows.
