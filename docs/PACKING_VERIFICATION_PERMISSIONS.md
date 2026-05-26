# Packing verification permissions

## Roles (target matrix)

| Role | Intended capability |
|------|---------------------|
| Packer | Run scan, verify items, log issues. |
| Packing lead | Resolve issues, send back to packing. |
| Manager | Override with reason (spec). |
| Owner / admin | Full tenant admin. |
| Driver | Route handoff read/confirm (future). |
| Kitchen staff | View issues returned to production (future). |
| Viewer | Read-only sessions/scans (future). |
| Platform superadmin | `workspace.moroz@gmail.com` / `isSuperAdminEmail` — full override per validation helper. |

## Code today

- Server actions use `requireSessionUser()` — any authenticated tenant user with dashboard access can invoke actions unless you add **role guards** per action.
- `canSupervisorOverride(role, email)` currently returns true for **OWNER** or superadmin email only.

## Recommended hardening (P1)

1. Import `getUserRole` (or your existing RBAC helper) in each packing-verification action.
2. Deny `supervisorOverrideVerificationAction` unless `canSupervisorOverride`.
3. Deny destructive actions (send-back, complete-as-pass) for `VIEWER`.
4. Add optional `PACKING_LEAD` / `MANAGER` enum values if Prisma `UserRole` is extended, or map existing roles.

## Security

- Never return full payment or credential payloads in verify responses.
- Token lookup already scoped by `userId` on `Order` and session.
