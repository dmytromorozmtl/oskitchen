import { describe, expect, it } from "vitest";

import { allocateOverheadOnPrimeCost } from "@/lib/costing/cost-allocation";
import {
  computeRecipeCostPerOutputUnit,
  foodCostPercent,
  grossMarginPercent,
  type RecipeIngredientLineInput,
} from "@/lib/costing/costing-calculations";
import {
  buildPilotMarginReportRow,
  PILOT_MENU_SPOTCHECK_FIXTURE,
} from "@/lib/costing/costing-pilot-menu-spotcheck-math";

/**
 * Profit margin accuracy — seeded COGS → margin within ±1%.
 *
 * Validates the same formula chain as `services/costing/costing-service.ts`
 * without DB — deterministic ingredient/labor/packaging seeds.
 *
 * @see docs/RECIPE_COSTING.md
 * @see lib/costing/costing-pilot-menu-spotcheck-math.ts
 */

export const MARGIN_ACCURACY_TOLERANCE_PERCENT = 1.0;

type CogsSeedFixture = {
  label: string;
  salePrice: number;
  yieldQuantity: number;
  laborMinutes: number;
  laborRatePerMinute: number;
  recipePackagingCost: number;
  packagingRulesCost: number;
  ingredients: RecipeIngredientLineInput[];
  overheadPercentOfPrimeCost?: number;
  enableOverhead?: boolean;
  deliveryCost?: number;
  platformFee?: number;
  paymentFee?: number;
  expectedFoodCostPercent: number;
  expectedGrossMarginPercent: number;
};

/** Hand-calculated expectations — burger: $3 ingredient on $10 sale → 30% food cost, 70% margin (no fees). */
const SIMPLE_BURGER_COGS: CogsSeedFixture = {
  label: "Simple burger",
  salePrice: 10,
  yieldQuantity: 1,
  laborMinutes: 0,
  laborRatePerMinute: 0.35,
  recipePackagingCost: 0,
  packagingRulesCost: 0,
  ingredients: [
    {
      quantity: 1,
      wastePercent: 0,
      costPerUnit: 3,
      ingredientId: "beef",
      ingredientName: "Beef patty",
    },
  ],
  expectedFoodCostPercent: 30,
  expectedGrossMarginPercent: 70,
};

/** Multi-ingredient with waste + labor — independent spreadsheet baseline. */
const CHICKEN_BOWL_COGS: CogsSeedFixture = {
  label: "Chicken bowl with waste",
  salePrice: 14,
  yieldQuantity: 2,
  laborMinutes: 8,
  laborRatePerMinute: 0.35,
  recipePackagingCost: 0.4,
  packagingRulesCost: 0,
  ingredients: [
    {
      quantity: 1,
      wastePercent: 5,
      costPerUnit: 6,
      ingredientId: "chicken",
      ingredientName: "Chicken",
    },
    {
      quantity: 0.5,
      wastePercent: 0,
      costPerUnit: 2,
      ingredientId: "rice",
      ingredientName: "Rice",
    },
  ],
  paymentFee: 0.41,
  expectedFoodCostPercent: 26.07,
  expectedGrossMarginPercent: 59.57,
};

const COGS_SEED_FIXTURES: CogsSeedFixture[] = [SIMPLE_BURGER_COGS, CHICKEN_BOWL_COGS];

function assertWithinPercent(
  actual: number,
  expected: number,
  label: string,
  tolerance = MARGIN_ACCURACY_TOLERANCE_PERCENT,
) {
  expect(
    Math.abs(actual - expected),
    `${label}: actual ${actual}% vs expected ${expected}% (±${tolerance}%)`,
  ).toBeLessThanOrEqual(tolerance);
}

function marginsFromCogsSeed(seed: CogsSeedFixture): {
  foodCostPercent: number;
  grossMarginPercent: number;
} {
  const breakdown = computeRecipeCostPerOutputUnit(
    {
      yieldQuantity: seed.yieldQuantity,
      laborMinutes: seed.laborMinutes,
      recipePackagingCost: seed.recipePackagingCost,
      packagingRulesCost: seed.packagingRulesCost,
      ingredients: seed.ingredients,
    },
    seed.laborRatePerMinute,
  );

  const prime = breakdown.primeCostPerUnit;
  const overhead = allocateOverheadOnPrimeCost(
    prime,
    seed.overheadPercentOfPrimeCost ?? 0,
    seed.enableOverhead ?? false,
  );
  const totalCost =
    prime +
    overhead +
    (seed.deliveryCost ?? 0) +
    (seed.platformFee ?? 0) +
    (seed.paymentFee ?? 0);
  const grossProfit = seed.salePrice - totalCost;

  return {
    foodCostPercent: foodCostPercent(breakdown.ingredientCostPerUnit, seed.salePrice),
    grossMarginPercent: grossMarginPercent(grossProfit, seed.salePrice),
  };
}

describe("profit margin accuracy — COGS validation", () => {
  it("defines ±1% margin accuracy tolerance", () => {
    expect(MARGIN_ACCURACY_TOLERANCE_PERCENT).toBe(1);
  });

  it.each(COGS_SEED_FIXTURES)(
    "$label — gross margin within ±1% of seeded COGS baseline",
    (seed) => {
      const margins = marginsFromCogsSeed(seed);
      assertWithinPercent(
        margins.grossMarginPercent,
        seed.expectedGrossMarginPercent,
        `${seed.label} gross margin`,
      );
      assertWithinPercent(
        margins.foodCostPercent,
        seed.expectedFoodCostPercent,
        `${seed.label} food cost`,
      );
    },
  );

  it("pilot menu spotcheck COGS seeds stay within ±1% of margin report", () => {
    const expectedByRecipe: Record<string, { marginPct: number; foodCostPct: number }> = {
      "Pilot Chicken Bowl": { marginPct: 55.4, foodCostPct: 17.5 },
      "Pilot Veg Wrap": { marginPct: 67.4, foodCostPct: 13.9 },
    };

    for (const recipe of PILOT_MENU_SPOTCHECK_FIXTURE) {
      const row = buildPilotMarginReportRow(recipe);
      const expected = expectedByRecipe[row.recipeName];
      expect(expected, row.recipeName).toBeDefined();
      assertWithinPercent(row.marginPct, expected!.marginPct, `${row.recipeName} margin`);
      assertWithinPercent(row.foodCostPct, expected!.foodCostPct, `${row.recipeName} food cost`);
    }
  });

  it("food cost % + gross margin % reconcile to sale price within ±1%", () => {
    for (const seed of COGS_SEED_FIXTURES) {
      const breakdown = computeRecipeCostPerOutputUnit(
        {
          yieldQuantity: seed.yieldQuantity,
          laborMinutes: seed.laborMinutes,
          recipePackagingCost: seed.recipePackagingCost,
          packagingRulesCost: seed.packagingRulesCost,
          ingredients: seed.ingredients,
        },
        seed.laborRatePerMinute,
      );
      const prime = breakdown.primeCostPerUnit;
      const overhead = allocateOverheadOnPrimeCost(
        prime,
        seed.overheadPercentOfPrimeCost ?? 0,
        seed.enableOverhead ?? false,
      );
      const totalCost =
        prime +
        overhead +
        (seed.deliveryCost ?? 0) +
        (seed.platformFee ?? 0) +
        (seed.paymentFee ?? 0);
      const impliedMargin = grossMarginPercent(seed.salePrice - totalCost, seed.salePrice);
      const margins = marginsFromCogsSeed(seed);
      assertWithinPercent(impliedMargin, margins.grossMarginPercent, `${seed.label} reconcile`, 0.01);
    }
  });
});
