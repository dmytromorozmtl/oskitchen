# Permissions & RBAC (consolidation pass)

## Current state

- Prisma `UserRole`: `OWNER`, `STAFF`
- Platform roles: `lib/platform-admin.ts`, `lib/platform/platform-permissions.ts`, `requirePlatformAccess`

## New workspace permission layer

| Path | Responsibility |
|------|------------------|
| `lib/permissions/roles.ts` | Future role vocabulary (catalog) |
| `lib/permissions/permissions.ts` | `PermissionKey` + defaults per `UserRole` |
| `lib/permissions/guards.ts` | `hasPermission` |
| `services/permissions/permission-service.ts` | `resolveWorkspacePermissions` (superadmin bypass) |

## Staff navigation

`lib/nav-role-filter.ts` now allows operational paths including **orders**, **order hub**, **error recovery**, and **system health** for `STAFF`.

## Founder invariant

`workspace.moroz@gmail.com` → `isSuperAdminEmail` continues to unlock owner-equivalent permission sets **without** weakening `/platform` guards.

## Next

- Persist fine-grained staff grants (`StaffMember.permissionsJson` already exists) — map into `resolveWorkspacePermissions`.
