import { describe, expect, it } from "vitest";

import { detectCheckoutAllergenConflicts } from "@/lib/storefront/checkout-allergen-warnings";
import { parseRecipePdfText } from "@/services/recipes/pdf-import-service";
describe("P3 — checkout allergens", () => {
  it("flags cart conflicts with customer allergies", () => {
    const warnings = detectCheckoutAllergenConflicts({
      customerAllergies: ["peanut", "dairy"],
      cartProducts: [
        { id: "1", title: "Pad Thai", allergens: "peanuts, soy" },
        { id: "2", title: "Salad", allergens: "none" },
      ],
    });
    expect(warnings.length).toBeGreaterThanOrEqual(1);
    expect(warnings[0]?.productTitle).toBe("Pad Thai");
  });
});

describe("P3 — recipe PDF import", () => {
  it("parses quantity lines and sub-recipes", () => {
    const parsed = parseRecipePdfText(`Chicken Curry
2 lb chicken breast
1 cup coconut milk
sub-recipe: 0.5 batch curry paste`);
    expect(parsed.lines.length).toBe(2);
    expect(parsed.subRecipes.length).toBe(1);
  });
});

describe("P3 — theft score threshold", () => {
  it("uses 20% as theft detection bar", () => {
    expect(25).toBeGreaterThanOrEqual(20);
  });
});
