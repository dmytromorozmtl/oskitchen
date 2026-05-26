# Audit Logs Permissions

Source: `lib/audit/audit-permissions.ts`

| Capability | Who |
| --- | --- |
| View audit logs | Superadmin email, owner, admin, manager |
| Sensitive detail (`before`/`after`/`diff`) | Superadmin, owner, admin |
| Export | Superadmin, owner, admin |
| Retention policy | Superadmin, owner, admin |

Managers: security/developer/auth/permissions categories are filtered out at query layer unless superadmin.

Superadmin constant: `workspace.moroz@gmail.com` (`lib/platform-owner.ts`).
