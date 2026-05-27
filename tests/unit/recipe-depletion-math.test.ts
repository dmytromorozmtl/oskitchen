import { describe, expect, it } from "vitest";

import { computeRecipeIngredientDepletion } from "@/lib/inventory/recipe-depletion-math";

describe("computeRecipeIngredientDepletion", () => {
  it("scales ingredient usage by sold quantity and yield", () => {
    const qty = computeRecipeIngredientDepletion({
      soldQuantity: 2,
      recipeYieldQuantity: 4,
      ingredientQuantity: 1,
      wastePercent: 0,
    });
    expect(qty).toBeCloseTo(0.5);
  });

  it("applies waste percent on top of base usage", () => {
    const qty = computeRecipeIngredientDepletion({
      soldQuantity: 1,
      recipeYieldQuantity: 1,
      ingredientQuantity: 10,
      wastePercent: 10,
    });
    expect(qty).toBeCloseTo(11);
  });

  it("returns zero for invalid yield or quantities", () => {
    expect(
      computeRecipeIngredientDepletion({
        soldQuantity: 0,
        recipeYieldQuantity: 1,
        ingredientQuantity: 5,
        wastePercent: 0,
      }),
    ).toBe(0);
    expect(
      computeRecipeIngredientDepletion({
        soldQuantity: 1,
        recipeYieldQuantity: 0,
        ingredientQuantity: 5,
        wastePercent: 0,
      }),
    ).toBe(0);
  });
});
