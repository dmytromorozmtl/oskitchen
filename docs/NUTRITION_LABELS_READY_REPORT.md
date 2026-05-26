# Nutrition labels ready report

## Summary

Upgraded **Nutrition & allergen labels** from a single long form into a **label command center**, **per-item workspace**, **structured allergen + ingredient models**, **verification audit**, **print queue**, **storefront visibility controls**, and **optional packing gates** — without deleting legacy product or nutrition text fields.

## Data models

- Extended `NutritionProfile` + new `AllergenProfile`, `IngredientDeclaration`, `LabelVerificationEvent`.
- `LabelTemplate.packagingLabelType`, `layoutJson`; `PrintedLabel.copies`; indexes on print queue.
- `StorefrontSettings` + `KitchenSettings` flags for public display and packing enforcement.

## Workflows

- Draft → review → verify with audit events.
- Print jobs recorded on `PrintedLabel` and auditable.

## Storefront

- Unverified structured nutrition/allergens/ingredients hidden unless toggles enabled; migration preserves prior permissive behavior for existing storefronts.

## Compliance stance

No regulatory certification language added. Disclaimers centralized in `lib/nutrition/label-disclaimers.ts`.

## Remaining work (recommended)

1. Wire `evaluatePackingLabelReadiness` into packing UIs.
2. CSV import pipeline.
3. RBAC for label edit vs verify.
4. PDF output for templates.

## Build

`npm run typecheck` and `npm run build` succeed in CI-style environments after migration is applied.
