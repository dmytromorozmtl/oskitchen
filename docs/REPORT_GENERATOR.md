# Report generator

Each report is rendered at:

```
/dashboard/reports/[reportKey]?from=YYYY-MM-DD&to=YYYY-MM-DD&...
```

The page renders four sections.

## 1. Header

- Title + description from the registry entry.
- Range label, e.g. `2026-05-01 → 2026-05-08`.
- Action row: **Export CSV**, **Print / Save PDF**, optional **Legacy export**.

## 2. Filter bar

`components/dashboard/reports/report-filter-bar.tsx` renders chips:

- Range presets (7d / 30d / 90d / WTD / MTD / YTD).
- Brand filter (only if the report supports `brandId`).
- Location filter (only if the report supports `locationId`).
- Channel chips (Storefront / Manual / Woo / Shopify / Uber Eats / Uber Direct / Other).
- Fulfillment chips (Pickup / Delivery).

Filter URL contract is documented in `lib/reports/report-filters.ts`. The
parser is total — invalid values are simply ignored.

## 3. KPI cards + preview

Runners return:

```ts
type ReportResult = {
  summary: { label: string; value: string; sub?: string | null }[];
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  totalRows: number;
  truncated: boolean;
  rangeLabel: string;
  warnings: string[];
};
```

The page shows the first **25** preview rows. CSV export downloads up to
`MAX_EXPORT_ROWS = 5000`.

## 4. Save view

`components/dashboard/reports/save-report-form.tsx` is a small client
component that calls `saveReportFormAction`. Names are unique per user.

## CSV export

Two surfaces:

- `GET /api/export/report?key=<reportKey>&...` (new).
- `exportReportCsvAction({ reportKey, filtersQuery })` server action returning
  `{ filename, body }` (used when we need to embed an export action inside
  a server component / form).

Both call `buildReportCsv(result)` which:

- Reuses `csvEscapeCell` from `lib/import-export/csv-format.ts`
  (formula-injection mitigation).
- Writes a row to `ExportJob` (`type = report:<reportKey>`) with the active
  filters in `filters_json` for audit.
