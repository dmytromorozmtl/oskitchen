# Nutrition import / export

`/dashboard/nutrition-labels/import` currently exposes a **CSV header template** only.

Planned: upload → validate → diff preview → commit with per-row errors (SKU / title match), nutrition + allergen + ingredient columns.

Export: reuse Prisma queries from reports or add `/api/export` scope for label tables.
