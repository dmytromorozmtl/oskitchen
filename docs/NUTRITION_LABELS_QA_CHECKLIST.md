# Nutrition labels QA checklist

- [ ] `npx prisma migrate deploy` on target DB (applies `20260518103000_nutrition_labels_module`).
- [ ] Command center loads; stats non-null; empty state when no products.
- [ ] Item page: save nutrition draft → status `NEEDS_REVIEW`.
- [ ] Verify nutrition with serving size present → `VERIFIED`.
- [ ] Structured allergen save + verify.
- [ ] Ingredient declaration save + verify.
- [ ] Starter templates → queue print → mark printed.
- [ ] Storefront product: toggles hide/show unverified fields; disclaimer when withheld.
- [ ] `npm run typecheck` && `npm run build`.
