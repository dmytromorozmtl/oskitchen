# Product mapping ↔ Import Center integration

## Existing template

`lib/import-center/import-templates.ts` already exposes
`PRODUCT_MAPPINGS`, with required columns:

- `provider`
- `external_product_id`
- `external_title`
- `internal_product_id` (optional, otherwise matching engine runs)

Operators can download the template from the Import Center templates
page and re-upload it after editing.

## Workbench → Import Center

The workbench has two CTAs:

- **Overview → "Import external products"** routes to
  `/dashboard/import-center/upload?type=PRODUCT_MAPPINGS`.
- **Empty state → "Import external products"** routes to the same
  upload page.

## Import Center → workbench

The Import Center commit flow already produces preview rows; once a
preview is committed for type `PRODUCT_MAPPINGS`, the rows are
processed by `services/product-mapping/product-mapping-service.ts::createOrUpdateMapping`
(via a future Import Center writer hookup). Until that writer is
wired, operators can use the workbench `SuggestionForm` or the
Sales Channels catalog sync to populate mappings.

## Error report

The Import Center provides an Error CSV download per job, listing
rows that failed validation (`ImportJob.errorsCsvUrl`-equivalent
endpoint at `/api/import-center/[jobId]/errors.csv`). The workbench
does not duplicate that surface; operators triage in the Import
Center and return to the workbench for approvals.

## Safety contract

- Imports always go through the Import Center preview-then-commit
  flow (no silent imports).
- A bulk-imported mapping enters the workbench in `SUGGESTED` or
  `NEEDS_REVIEW` state — never auto-approved unless the row
  already specified an explicit internal product id.
- The Import Center is the single source of truth for upload
  history; the workbench links to it for full audit.
