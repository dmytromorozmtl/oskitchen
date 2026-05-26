# Executive permissions

Implementation: `lib/executive/executive-permissions.ts`.

## Matrix

| Permission | Owner | Manager | Admin | Accountant | Sales | Kitchen / Packer / Driver | Viewer | Other staff | Superadmin |
|------------|:-----:|:-------:|:-----:|:----------:|:-----:|:-------------------------:|:------:|:-----------:|:----------:|
| `executive.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `executive.read.operations` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `executive.read.financial` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `executive.read.customer_pii` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `executive.read.brand_location` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `executive.export` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `executive.insights.manage` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

## How it is applied

- The overview page filters KPI cards via
  `canViewExecutive(scope, kpi.requiredPermission)` so a role without
  `executive.read.financial` never sees revenue / margin cards.
- Sub-pages (`/revenue`, `/profitability`, `/report`) return a
  permission-denied card if the required permission is missing.
- Brand / location comparison is restricted to
  `executive.read.brand_location`.
- Insight resolve / dismiss actions check `executive.insights.manage`.

## Superadmin

`isSuperAdminEmail(scope.email)` always returns full access. The
production check matches `workspace.moroz@gmail.com` (or whatever
`PLATFORM_OWNER_EMAIL` is configured to).
