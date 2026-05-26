# Saved reports

Saved reports are named filter sets that point to a `ReportKey`.

## Model

```prisma
model SavedReport {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String
  reportKey   String
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

## Operations

`actions/reports.ts` exposes:

- `saveReportAction({ reportKey, name, description, filters })` — upsert
  by `(userId, name)`.
- `saveReportFormAction(formData)` — form wrapper used by the
  `SaveReportForm` client component.
- `duplicateSavedReportAction(savedReportId)` — creates `"<name> (copy)"`.
- `toggleSavedReportPinAction(savedReportId)` — sets/clears `pinned`.
- `deleteSavedReportAction(savedReportId)` — irreversible.

All four are gated on `canDoReports(scope, "reports.saved.manage")`.

## UI surface

`/dashboard/reports/saved` lists every saved report grouped by pinned ✦
unpinned and offers four buttons per row: Open / Pin / Duplicate / Delete.

Pinned reports also surface on the Reports Center landing page so owners
can re-open the previous week's view in one click.
