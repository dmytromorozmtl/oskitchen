# Ingredient substitutions

Model: `IngredientSubstitution` (`ingredient_substitutions`).

Fields: `ingredientId`, `substituteIngredientId`, optional `conversionRatio`, `notes`, `active`.

The **Substitutions** tab lists active rows (IDs today; swap to names when ingredient picker ships).

Allergen / nutrition / cost warnings are surfaced as static copy next to the table.

Applying a substitution to a saved demand run is **not** automated yet — preserve manual review until allergen workflow exists.
