# Growth Permissions

| Role / condition | Growth access |
| --- | --- |
| `UserRole.OWNER` | Yes (workspace founder). |
| Platform superadmin (`workspace.moroz@gmail.com` or `SUPER_ADMIN` row) | Yes. |
| `GROWTH_ADMIN`, `PLATFORM_ADMIN`, `PARTNER_ADMIN`, `SUPPORT_ADMIN` | Yes (platform staff). |

Normal workspace **STAFF** without platform roles: **no access** (redirect `/dashboard`).

Sensitive metrics (revenue, churn, pipeline) must remain behind this gate — do not embed Growth widgets in tenant-facing pages.
