# Reports Center — architecture

## Layers

| Layer | Files | Responsibility |
|-------|-------|----------------|
| Types | `lib/reports/report-types.ts` | `ReportKey`, `ReportFilters`, `ReportDefinition`, permissions enum |
| Registry | `lib/reports/report-registry.ts` | Source of truth — what reports exist |
| Filters | `lib/reports/report-filters.ts` | URL parsing / serialisation, date presets |
| Permissions | `lib/reports/report-permissions.ts` | `canDoReports` + `canViewReport` + superadmin bypass |
| Terminology | `lib/reports/report-terminology.ts` | Business-mode-specific copy |
| Runners + CSV | `services/reports/report-service.ts` | `runReport`, `buildReportCsv`, `listSavedReports`, `listReportExportHistory`, `recordReportExport` |
| Actions | `actions/reports.ts` | `saveReportAction`, `duplicateSavedReportAction`, `toggleSavedReportPinAction`, `deleteSavedReportAction`, `exportReportCsvAction` |
| API | `app/api/export/report/route.ts` | Filtered CSV export endpoint (does not replace legacy `/api/export`) |
| UI | `app/dashboard/reports/**` + `components/dashboard/reports/**` | Command Center, Library, Saved, History, Executive / Operations / Financial / Settings, per-report generator |

## Data model

Only one additive table is introduced; the existing `ExportJob` table
already provides the audit / history trail we surface in the UI.

```prisma
model SavedReport {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String
  reportKey   String   @db.VarChar(80)
  name        String   @db.VarChar(255)
  description String?
  filtersJson Json?
  columnsJson Json?
  pinned      Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([userId, name])
}
```

## Request lifecycle

1. URL — e.g. `/dashboard/reports/revenue_report?from=2026-05-01&to=2026-05-08`.
2. `parseReportFilters(searchParams)` produces a typed `ReportFilters`.
3. `runReport(key, ctx)` looks up the registry entry, enforces permissions
   via `canViewReport`, dispatches to the runner.
4. Runner uses `prisma` to fetch rows, computes summary KPIs, masks PII
   if the actor lacks `reports.read.customer_pii`.
5. UI renders KPI cards + a preview table (top 25 rows).
6. "Export CSV" hits `/api/export/report?key=…` which re-runs the report
   then writes a row to `ExportJob` (`type=report:<key>`).

## Legacy compatibility

`/api/export?type=orders|customers|products|production|inventory|...` is
untouched. Every legacy link from the previous card grid is captured in
`ReportDefinition.legacyExportHref` and is still surfaced next to the new
"Export CSV" CTA.

## Performance

- Every runner caps the dataset to `MAX_EXPORT_ROWS = 5000`.
- Preview renders `PREVIEW_ROW_LIMIT = 25` rows.
- Selects use the smallest projection that produces the report.
- We never `$queryRaw`; everything goes through Prisma typed queries.
