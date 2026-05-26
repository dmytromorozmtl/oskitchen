# Allergen registry

Canonical keys and display labels live in `lib/nutrition/allergen-registry.ts`:

- milk, eggs, fish, shellfish, tree_nuts, peanuts, wheat, soy, sesame, sulfites, mustard, celery, gluten, alcohol_notes

CSV import / UI uses comma-separated keys; `displayAllergenKey` maps to human-readable labels.

**Not** jurisdiction-specific — operators must align declarations with local law.
