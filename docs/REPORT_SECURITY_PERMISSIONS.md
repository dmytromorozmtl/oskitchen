# Reports security &amp; permissions

`lib/reports/report-permissions.ts:canDoReports(scope, permission)` decides
who can read or export each report.

## Permissions

| Permission | Description |
|------------|-------------|
| `reports.read.operations` | Production / packing / delivery / staff / inventory / purchasing-status reports |
| `reports.read.financial` | Revenue / margin / sales-by-channel / sales-by-product / catering / meal-plan financials |
| `reports.read.customer_pii` | Customer master list with email / phone visible |
| `reports.read.audit` | Audit log report (export history) |
| `reports.export` | Allowed to generate a CSV export |
| `reports.saved.manage` | Save, pin, duplicate, and delete saved report views |

Workspace registry keys mirror the table above (`reports.read.*`, `reports.export`, `reports.saved.manage`). `canDoReports()` checks canonical `granted` permissions first, then legacy role strings. Server mutations use `requireReportReadActor`; hub pages use `requireReportsPageAccess`.
| `reports.saved.manage` | Save / duplicate / pin / delete saved reports |

## Role matrix

| Role | operations | financial | customer_pii | audit | export | saved |
|------|:---------:|:---------:|:------------:|:-----:|:------:|:-----:|
| owner | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| superadmin (`workspace.moroz@gmail.com`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| manager | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| accountant | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| kitchen_lead / kitchen / production | ✓ (ops) | ✗ | ✗ | ✗ | ✓ (kitchen_lead) | ✗ |
| packer / packing | ✓ (ops) | ✗ | ✗ | ✗ | ✗ | ✗ |
| driver / dispatcher | ✓ (ops) | ✗ | ✗ | ✗ | ✗ | ✗ |
| sales | ✓ (ops) | ✗ | ✗ | ✗ | ✓ | ✗ |
| viewer | ✓ (ops) | ✗ | ✗ | ✗ | ✗ | ✗ |

## PII masking

`services/reports/report-service.ts` applies `maskEmail` and `maskPhone`
to customer reports and meal-plan subscription reports when the viewer
lacks `reports.read.customer_pii`. The delivery report only shows full
customer name / address to roles in `{owner, admin, manager}`.

## Formula injection

Every CSV cell goes through `csvEscapeCell` from
`lib/import-export/csv-format.ts`, which prefixes cells starting with
`=`, `+`, `-`, `@` with a single quote. This is the same code path the
legacy `/api/export` endpoint uses.

## Audit reports

The `audit_log_report` registry entry surfaces `ExportJob` rows. It
requires `reports.read.audit` (admin) and superadmin can always view.
The legacy `audit_logs` CSV export remains gated by `isSuperAdminEmail`
on `/api/export?type=audit_logs`.
