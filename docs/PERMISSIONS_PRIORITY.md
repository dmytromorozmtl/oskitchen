# Permissions priority

OS Kitchen uses two overlapping permission systems during the workspace migration. This document defines **which wins** when they disagree.

## 1. Legacy `UserProfile.role` (deprecated)

- Values: `OWNER`, `STAFF` (and related session/bootstrap checks).
- Used for: initial session shape, coarse dashboard gates, legacy code paths not yet migrated to workspaces.
- **Status:** deprecated — do not add new features that rely only on `UserProfile.role`.

## 2. `WorkspacePermission` keys (primary)

- Scoped per workspace member (`WorkspaceMember` + permission keys).
- Used for: dashboard modules, actions, services via `requireTenantActor`, `hasWorkspacePermission`, approval flows.
- **Status:** source of truth for authorization on new and migrated features.

## Conflict resolution

| Situation | Rule |
|-----------|------|
| Legacy role allows, workspace permission denies | **Deny** (workspace wins) |
| Legacy role denies, workspace permission allows | **Allow** (workspace wins) |
| Neither defined | **Deny** (fail closed) |

Implement checks with workspace permissions first; treat `UserProfile.role` as a fallback only for unmigrated routes.

## Roadmap

- **Q4 2026:** Remove legacy role checks from actions/services; session carries workspace membership + permission set only.
- Until then: when touching an action, prefer `requireTenantActor` + workspace permission helpers over `role === "OWNER"`.

## Related code

- `services/permissions/` — approval and permission resolution
- `lib/scope/require-tenant-actor.ts` — tenant + workspace context
- `eslint/rules/require-owner-scope.js` — owner scoping on queries
