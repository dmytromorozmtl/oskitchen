# CSV templates

## Download API

`GET /api/import-export/template?kind=<TemplateKind>` (authenticated).

## Kinds

Defined in `lib/import-export/template-definitions.ts` (`TEMPLATE_KINDS`):

`customers`, `menu_items`, `ingredients`, `recipes`, `suppliers`, `orders`, `brands`, `locations`, `nutrition_allergens`, `product_mapping`, `menu_assignments`.

## Contents

Each template includes:

- Header row (canonical column names).
- At least one sample row illustrating accepted shapes.

## UI

`/dashboard/import-export/templates` lists kinds with download links.

## Validation

- Required vs optional columns are enforced per import type in the validator layer (ingredients: see `csv-validator` / `import-preview`).
- Extra columns are ignored after mapping (future UI).
