# Platform roles & permissions

## Product roles → Prisma `PlatformRole`

Defined in `lib/platform/platform-permissions.ts` (union of permission strings) and assigned via `PlatformUserRole`:

| Product concept | Prisma role(s) | Notes |
|-----------------|------------------|--------|
| Founder | Email allowlist (`lib/platform-owner.ts`) | Full permission set; row upserted as `SUPER_ADMIN` |
| Superadmin | `SUPER_ADMIN` | Full set |
| Platform admin | `PLATFORM_ADMIN` | Ops + billing + tools; impersonation **end** only in map — start remains super-admin in code today |
| Support | `SUPPORT_ADMIN` | Read + reply + assign + escalate |
| Implementation | `IMPLEMENTATION_ADMIN` | Read + workspace write + tools |
| Growth | `GROWTH_ADMIN` | Read + org write |
| Partner | `PARTNER_ADMIN` | Read |
| Read-only auditor | `STANDARD_USER` platform row | Read bundle only |

## Permission strings

See `PlatformPermission` in `lib/platform/platform-permissions.ts` (`platform:access`, `platform:support:reply`, …).

## Founder lockout

`workspace.moroz@gmail.com` is always treated as founder (`isSuperAdminEmail`) and receives **all** permissions in `resolvePlatformPermissions`.

## Changing policy

1. Add the string to `PlatformPermission` and `ALL`.
2. Map Prisma roles in `resolvePlatformPermissions`.
3. Gate UI with `filterNavForPermissions` and server routes with `assertPlatformPermission`.
