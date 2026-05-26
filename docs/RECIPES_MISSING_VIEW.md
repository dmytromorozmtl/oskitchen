# Recipes missing view

Derived from `rollupDemandFromContributions` when a product contribution cannot resolve to an active recipe:

- `NO_RECIPE`
- `RECIPE_INACTIVE` (`active === false` in DB)
- `NO_INGREDIENTS`

Shown in the **Recipes missing** tab with CTA path to product/recipe tooling (manual navigation for now).
