# Reports Center — ready report

## What changed

- New audit `docs/REPORTS_MODULE_AUDIT.md`.
- Additive Prisma migration `20260514000000_reports_center` introducing
  one table (`SavedReport`). Existing `ExportJob` is reused for history.
- `lib/reports/*` — types, registry, filters, permissions, terminology.
- `services/reports/report-service.ts` — 19 runners, CSV builder,
  history helpers, saved-report listing.
- `actions/reports.ts` — save / duplicate / pin / delete + form wrapper
  and a server-action wrapper around CSV export.
- `app/api/export/report/route.ts` — filtered CSV export endpoint.
- `app/dashboard/reports/**` — Command Center, Library, Saved, History,
  Executive, Operations, Financial, Settings, per-report generator.
- `components/dashboard/reports/**` — subnav, filter bar, save form,
  print button.
- 9 new docs in `docs/REPORTS_*.md` and `docs/REPORT_*.md`.

## Report registry

19 reports across 12 categories — see `docs/REPORT_REGISTRY.md`.
Every entry carries title, description, category, business-modes,
required permission, supported filters, columns, legacy export href,
generator route, and status.

## Report library

`/dashboard/reports/library` filters by category and optionally by the
viewer's business mode. Each card shows formats, last-generated date
(from `ExportJob`), Open / Export CSV / Legacy export buttons.

## Report generator

`/dashboard/reports/[reportKey]` renders the filter bar, KPI cards,
warnings, preview table (first 25 rows), and the save form. CSV export
honours the active filter set.

## Saved reports

`SavedReport` with `(userId, name)` unique. Operations: save, duplicate,
pin, delete. Pinned reports surface on the Reports Center landing page.

## Export history

Reuses `ExportJob`. The new export endpoint writes
`type = report:<reportKey>` rows that the history page surfaces.

## Executive reports

`executive_weekly_summary` and `executive_monthly_summary` aggregate
revenue, AOV, repeat rate, production / packing / delivery rates, catering
accepted, top products and produce a deterministic
`Next recommendations` row (see `docs/EXECUTIVE_REPORTS.md`).

## Business-mode packs

See `docs/BUSINESS_MODE_REPORT_PACKS.md`. Terminology adapts to the
detected `kitchenSettings.businessType`.

## Permissions

See `docs/REPORT_SECURITY_PERMISSIONS.md`. `canDoReports(scope, perm)`
gates every read and export. PII is masked when the viewer lacks
`reports.read.customer_pii`. Superadmin always wins.

## Remaining limitations

- Server-side PDF is not implemented. The print button uses
  `window.print()` and renders an existing print-friendly layout.
- Scheduled email reports are not implemented. The settings page calls
  this out explicitly.
- Reports that require future "alerts when metric breaches threshold"
  are not in scope — analytics module already covers that surface.
- Rows are capped to 5,000 per report run; large workspaces will need
  per-tenant paginated exports in a future pass.

## Next recommendations

- Add a `RecentReportRun` (preview-only) table if we want to keep
  zero-export runs auditable.
- Wire scheduled reports once the notification platform is ready.
- Add print-only stylesheet for prettier PDF output via browser print.
- Promote `ExportJob` into a richer `ReportExport` view with explicit
  `reportKey` column (currently encoded into `type`).
