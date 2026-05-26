# Nutrition ↔ packing integration

- Kitchen flags: `blockPackingWithoutVerifiedAllergen`, `blockPackingWithoutVerifiedNutrition` on `KitchenSettings`.
- Helper: `lib/nutrition/packing-label-readiness.ts` → `evaluatePackingLabelReadiness(product, kitchen)`.

**Next step:** call the helper from packing task / command center UI to show inline warnings when flags are enabled.

Packing Verification already consumes product allergen metadata separately; no breaking changes.
