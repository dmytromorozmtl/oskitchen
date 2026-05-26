# Packing allergen & nutrition checks

## Surfacing

- Task badges for **Allergen** / **Nutrition** requirements.
- `allergenWarningsJson` stores `{ source: "product.allergens", text }` snapshot at queue generation.
- KPIs: `labelsMissing`, `allergenChecksOpen` (`lib/packing/packing-kpis.ts`).

## Actions

- **Mark verified** — operator attestation; not a legal certification.
- **Nutrition labels** — deep link to `/dashboard/nutrition-labels`.

## Disclaimer (in-app)

Verification tab includes explicit copy: operators must verify data; KitchenOS surfaces hints only.
