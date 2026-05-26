# Label system

## Types (logical)

See `lib/packing/label-types.ts`: item, bag, order, route, allergen, nutrition, catering tray, bakery item, pickup, delivery.

## Sizes

`4x6`, `2x3`, `2x1`, `LETTER`, `CUSTOM` (constants only).

## Database

- `LabelTemplate` — `contentJson` layout definition.
- `PrintedLabel` — requires `templateId`; tracks `status`, `printedAt`, `printedById`.

## UI (current)

- **Labels** tab shows active template count.
- **Log label printed** sets `PackingTask.labelPrintedAt` (placeholder until template-backed print flow exists).

## Compliance

KitchenOS **does not** certify regulatory compliance. Nutrition/allergen outputs must be reviewed by the operator.
