# Reports Center — QA checklist

## Build
- [x] `npm run typecheck`
- [x] `npm run build`

## Page-load smoke
- [ ] `/dashboard/reports` renders KPIs, pinned reports, weekly review block.
- [ ] `/dashboard/reports/library` renders category chips + cards.
- [ ] `/dashboard/reports/saved` renders empty state when no saved reports.
- [ ] `/dashboard/reports/history` renders empty state when no exports.
- [ ] `/dashboard/reports/executive` renders the two executive reports.
- [ ] `/dashboard/reports/operations` renders production / packing / etc.
- [ ] `/dashboard/reports/financial` renders only when role allows it.
- [ ] `/dashboard/reports/settings` renders business-mode info.

## Generator
- [ ] Each `/dashboard/reports/<key>` renders KPIs, preview, save form.
- [ ] Date preset chips update `from` / `to` in the URL.
- [ ] Brand / location / channel / fulfillment chips work where supported.
- [ ] Print/Save PDF opens the browser print dialog.

## Exports
- [ ] `/api/export/report?key=revenue_report` returns CSV with current filters.
- [ ] CSV first row contains the registry column labels.
- [ ] Cells starting with `=`, `+`, `-`, `@` are prefixed with `'`.
- [ ] Legacy links still work:
  - [ ] `/api/export?type=orders`
  - [ ] `/api/export?type=customers`
  - [ ] `/api/export?type=products`
  - [ ] `/api/export?type=production`
  - [ ] `/api/export?type=inventory`

## Saved reports
- [ ] Save creates a row, updates existing with same `name`.
- [ ] Pin / Unpin toggles `pinned`.
- [ ] Duplicate appends `(copy)` and increments suffix.
- [ ] Delete removes row.

## Export history
- [ ] CSV download writes an `ExportJob` row with `type=report:<key>`.
- [ ] `/dashboard/reports/history` shows the row.

## Permissions
- [ ] Non-financial role visiting `/dashboard/reports/financial` sees forbidden card.
- [ ] Customer report PII fields are masked unless role allows.
- [ ] Audit log report only visible to admin / superadmin.
- [ ] Superadmin (`workspace.moroz@gmail.com`) sees every report.

## Empty states
- [ ] No data → "Reports need operational data" CTA card.
- [ ] No saved reports → "No saved reports yet".
- [ ] No exports → "No exports yet".
