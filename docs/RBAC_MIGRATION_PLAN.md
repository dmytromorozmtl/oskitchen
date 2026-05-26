# RBAC Migration Plan

**Date:** 17 May 2026  
**Related:** `lib/permissions.ts`, `lib/permissions/`, `docs/RBAC_FINAL_ARCHITECTURE.md`

## Current state (two systems)

| System | Import path | `hasPermission` signature | Used by |
|--------|-------------|-------------------------|---------|
| **Legacy dashboard / POS** | `@/lib/permissions` | `hasPermission(role, PermissionKey)` | `services/pos/pos-checkout-service.ts`, `components/permissions/permission-gate.tsx` |
| **Workspace matrix** | `@/lib/permissions/index` | `hasPermission(granted: Set<PermissionKey>, required)` | Workspace RBAC services, future staff matrix |

These are **different functions** with the same name. Do **not** blanket `export *` from index in `lib/permissions.ts` — it would break POS.

## Permission key divergence (sample)

| Legacy `PermissionKey` (`lib/permissions.ts`) | Workspace key (`lib/permissions/permissions.ts`) |
|-----------------------------------------------|--------------------------------------------------|
| `manage_orders` | `orders.manage` |
| `manage_menus` | `menus.manage` |
| `pos_access` | (map via role catalog) |
| `pos_comp` | sensitive action / approval rules |
| `view_developer` | `developer.access` (if enabled) |

Full workspace keys: see `PERMISSIONS` in `lib/permissions/permissions.ts`.

## Migration phases

### Phase A — Documentation & lint (now)

- [x] Document dual system (this file).
- [x] `lib/permissions/legacy.ts` + `hasLegacyPermission` alias.
- [x] ESLint `no-restricted-imports` on `@/lib/permissions` and `_experiments/*`.
- [x] `tests/unit/legacy-permissions.test.ts`.

### Phase B — Server enforcement (P1)

- [x] `lib/permissions/require-workspace-permission.ts` — `requireWorkspacePermissionActor()`.
- [x] `actions/settings-center.ts` — `canAccessSettingsSection` (legacy OR workspace bridge).
- [x] `actions/orders.ts` — `orders.manage` on create/update mutations.
- [ ] Remaining action domains (production, packing, integrations) — incremental.
- [ ] Keep legacy matrix for POS until POS uses workspace roles end-to-end.

### Phase C — UI alignment (P2)

- [x] `permission-gate.tsx` accepts workspace permission set from server (`workspaceGranted`).
- [x] `WorkspacePermissionGate` + `WorkspacePermissionsProvider`.
- [ ] Remove duplicate checks in page components (incremental).

### Phase D — Granular staff templates (P2+)

- [x] `CAPABILITY_TO_WORKSPACE` + `workspacePermissionsFromStaffTemplate`.
- [x] `requireWorkspacePermissionActor()` loads `StaffMember.roleType`.
- [ ] UI: template picker on staff invite (see `docs/RBAC_PHASE_D.md`).
- [ ] Deprecate coarse STAFF default when all staff linked.

### Phase E — Legacy deprecation (P3)

- [ ] When POS uses workspace matrix, delete root `lib/permissions.ts` shim for non-POS.

## Rules for engineers

1. **POS / comp / register:** `@/lib/permissions` (legacy).
2. **Workspace settings / staff / new modules:** `@/lib/permissions/index`.
3. Never add a third permission file without architecture review.
