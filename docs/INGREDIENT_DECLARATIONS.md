# Ingredient declarations

Structured ingredient text for guest-facing use lives in `ingredient_declarations`, separate from legacy `Product.ingredients` and `nutrition_profiles.ingredients_text`.

Workflow: compose text → save draft (`NEEDS_REVIEW`) → authorized user runs **Mark ingredients verified**.

Server: `actions/ingredient-declaration.ts`.
