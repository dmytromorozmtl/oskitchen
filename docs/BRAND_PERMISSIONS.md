# Brand permissions

## Roles (target matrix)

| Capability | Owner | Staff (all brands) | Staff (assigned brand) |
|------------|-------|--------------------|------------------------|
| View brands | ✓ | ✓ | assigned only |
| Manage brands | ✓ | optional | assigned only |
| Manage storefront | ✓ | optional | brand scope |
| Manage menus | ✓ | optional | brand scope |
| View reports | ✓ | ✓ | brand scope |

## Current enforcement

- Server actions check workspace ownership via `workspace.ownerUserId`.  
- `isSuperAdminEmail` (platform root `workspace.moroz@gmail.com`) retains bypass per `lib/platform-owner.ts`.  
- `lib/brands/brand-permissions.ts` centralizes future checks — call from actions when staff roles arrive.

## Guidance

Avoid duplicating email string literals; always import `isSuperAdminEmail`.
