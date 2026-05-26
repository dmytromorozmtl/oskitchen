# RBAC Phase D — Granular Staff Templates

**Status:** Foundation shipped (May 2026)  
**Trigger:** Pilot feedback on staff access (Week 2+)

---

## What Phase D does

Maps `StaffMember.roleType` (MANAGER, PACKER, VIEWER, …) → workspace permission keys via declarative capabilities.

```
StaffRoleType → STAFF_TEMPLATE_CAPABILITIES → CAPABILITY_TO_WORKSPACE → PermissionKey set
```

---

## Files

| File | Role |
|------|------|
| `lib/permissions/permission-matrix.ts` | Capability definitions + templates |
| `lib/permissions/capability-to-workspace.ts` | Capability → workspace keys |
| `lib/permissions/staff-template-workspace-permissions.ts` | Template resolver |
| `services/permissions/permission-service.ts` | Uses `staffRoleType` in context |
| `lib/permissions/require-workspace-permission.ts` | Loads linked `StaffMember` |

---

## Runtime behavior

1. User logs in (session).
2. `requireWorkspacePermissionActor()` resolves `dataUserId` (owner).
3. If `StaffMember.linkedUserId === sessionUser.id` → use `roleType` template.
4. Else fall back to `UserProfile.role` OWNER/STAFF coarse matrix.

---

## Template examples

| Template | Can manage orders | Production | Packing | Billing |
|----------|-------------------|------------|---------|---------|
| MANAGER | ✓ | ✓ | ✓ | — |
| PACKER | — | — | ✓ | — |
| VIEWER | — | — | — | — |
| ACCOUNTING | — | — | — | exports only |

---

## UI follow-up (Phase D.2)

- [ ] Staff invite UI shows template label + capability summary
- [ ] Settings → Team → edit template per member
- [ ] `PermissionGate` reads resolved `granted` set (Phase C)

---

## Deprecation (Phase D.3)

When all surfaces use workspace matrix:

- Move `lib/permissions.ts` shim to legacy-only POS
- Remove coarse `STAFF_OPS` default for linked staff

See `docs/RBAC_MIGRATION_PLAN.md` Phase D.

---

## Tests

```bash
npm test -- tests/unit/staff-template-workspace-permissions.test.ts
```

---

## Pilot feedback → template changes

1. Collect confusions from Week 1 daily ops.
2. Adjust `STAFF_TEMPLATE_CAPABILITIES` in `permission-matrix.ts`.
3. Re-run `verify:staff-parity` + staff E2E.
