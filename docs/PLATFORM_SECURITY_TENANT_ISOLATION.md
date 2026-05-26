# Platform security & tenant isolation

## Route guard

- `app/platform/layout.tsx` calls `requirePlatformAccess()` so non-staff users redirect to `/dashboard`.

## Permission guard

- Sensitive modules call `assertPlatformPermission` on the server (e.g. support read, tools run).

## Tenant scope

- Prisma queries in platform pages are intentionally **cross-tenant** for operators; customer `/dashboard/*` routes must continue to scope by membership.
- Platform mutations must include `targetWorkspaceId` in audit when applicable (`platform-support`, `platform-impersonation`).

## Secrets

- Do not select `*Encrypted` fields in platform UIs.
- Search is bounded (`take` per entity) to reduce accidental bulk export.

## Impersonation

- Time-limited cookie session; super-admin only to start; audit start/end.
