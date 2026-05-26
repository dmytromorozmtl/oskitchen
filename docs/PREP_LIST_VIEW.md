# Prep list view

**Route:** `/dashboard/production?view=prep`

## Current behavior

- Work items grouped by `station` (fallback **Unassigned**).
- Shows title, status label, quantity, optional due time, source type badge.

## Planned

- Group toggles: category, due time window, brand.
- Quantity rollups per SKU.
- Checkbox + bulk complete (server action batch).
- Print stylesheet + PDF/CSV export.
- “Send to Kitchen Screen” filter (same data as `/dashboard/kitchen`).

## Opening / closing prep

For restaurant/café/bar: optional template sections (station setup, opening, service, closing) via `ProductionTemplate` + stage metadata.
