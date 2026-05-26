# Beta permissions

## Rule

**Same access matrix as Growth** — `canAccessGrowthModule` (see `lib/growth/growth-permissions.ts`).

Eligible:

- Workspace `OWNER`
- Platform superadmin (`workspace.moroz@gmail.com` + `SUPER_ADMIN` bootstrap)
- Platform roles: `PLATFORM_ADMIN`, `GROWTH_ADMIN`, `PARTNER_ADMIN`, `SUPPORT_ADMIN`

## Navigation & routing

- `gtmSurfaceAccess` in `app/dashboard/layout.tsx` feeds `DashboardShell`, `ModuleRouteGate`, and nav filtering so GTM staff can open `/dashboard/growth` and `/dashboard/beta-applications` without being workspace owners.

## Server enforcement

- `app/dashboard/beta-applications/layout.tsx` calls `assertBetaProgramAccess()` on every child render.

## Applicant data handling

- Never expose beta pipeline components to tenant `STAFF` without GTM roles.
- Founder notes + internal tags are founder-only fields.
