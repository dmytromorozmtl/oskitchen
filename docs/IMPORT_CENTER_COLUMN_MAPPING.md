# Import Center column mapping

CSV headers rarely match OS Kitchen field names exactly. The Import
Center resolves this with a deterministic auto-mapper and an
override hook.

## Sources of truth

1. **`lib/import-center/import-templates.ts`** declares every canonical
   field per `ImportType`:
   - `key` — canonical OS Kitchen field name (e.g. `title`,
     `cost_per_unit`, `customer_email`).
   - `label` — human label.
   - `required` — whether commit requires this column to be mapped.
   - `aliases[]` — alternative CSV header names that should auto-map
     to this field.

2. **`lib/import-center/column-mapping.ts`** provides:
   - `suggestImportMapping(type, headers)` — returns a
     `{ canonicalKey: csvHeader }` map by normalising both sides
     (`[^a-z0-9]` stripped, lowercase).
   - `missingRequiredColumns(type, mapping)` — returns any required
     canonical fields whose CSV header is missing.
   - `applyMapping(row, mapping)` — produces a normalised
     `{ canonicalKey: value }` object from a CSV row.

## Auto-map heuristic

```ts
function suggestImportMapping(type, headers) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  for each canonical field of the template:
    candidates = [field.key, ...field.aliases].map(norm)
    pick the first header whose normalised form
      equals any candidate
      OR equals `${candidate}name`
      OR ends with the candidate
}
```

This produces sensible mappings for headers like:

- `Product Name` → `title`
- `Customer Email` → `customer_email`
- `Cost Per Unit` → `cost_per_unit`
- `External SKU` → `external_sku`
- `Pickup Date` → `pickup_date`

## Override (future)

The service accepts an optional `mappingOverride` parameter. The UI
currently uses the auto-mapper only; a manual mapping step can be
added without changing the service contract.

## Required columns

`unresolvedRequiredColumns[]` is recorded on the `ImportJob`
`settings_json` and influences the job status:

- Required columns missing → status `MAPPING` (cannot commit).
- All required columns present → status `VALIDATED`.

## Extra columns

Extra CSV columns are ignored — they cause neither errors nor
warnings. The auto-mapper only attaches headers it can map to a
declared field.
