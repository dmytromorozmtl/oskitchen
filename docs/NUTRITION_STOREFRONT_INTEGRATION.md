# Nutrition ↔ storefront integration

- `StorefrontSettings`: `publicShowNutritionWhenUnverified`, `publicShowAllergensWhenUnverified`, `publicShowIngredientsWhenUnverified` (default **false** for new columns; migration sets **true** for existing storefront rows so behavior stays permissive until you tighten).
- Public menu payload includes `nutritionProfile`, `allergenProfile`, `ingredientDeclaration`.
- `lib/nutrition/build-storefront-product-surface.ts` decides what text/nutrition badges appear; `StoreProductDetailClient` shows a short disclaimer when content is withheld.

Never implies certification.
