# Column mapping

## Library

`lib/import-export/column-mapping.ts`

## Goals

- Auto-match CSV headers to canonical fields (fuzzy / alias dictionary per import type).
- Manual overrides in the wizard UI (pending).
- Ignored columns allowed.
- Warn when required canonical fields have no source column.
- Saved presets (`ImportMappingTemplate` in Prisma) — UI pending.

## Examples

| CSV header | Canonical field |
|------------|-----------------|
| Product Name | `title` |
| SKU | `sku` |
| Allergens | `allergensJson` |

## Behavior

- Extra columns: never fail the parse; they appear as unmapped until explicitly mapped.
- Missing required columns: validation errors on preview rows, not silent defaults.
