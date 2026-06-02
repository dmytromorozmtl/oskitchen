import { describe, expect, it } from "vitest";

import {
  assembleFoodCostAnalysis,
  buildIngredientBreakdownForProduct,
  buildTopIngredientMovers,
  computePriceTrend,
  recommendForItem,
  recomputeMargin,
} from "@/lib/ai/food-cost-builders";
import type { IngredientPricePoint, RecipeIngredientInput } from "@/lib/ai/food-cost-types";

describe("food cost builders", () => {
  it("detects price trend direction", () => {
    expect(computePriceTrend(12, 10).trend).toBe("up");
    expect(computePriceTrend(9, 10).trend).toBe("down");
    expect(computePriceTrend(10.1, 10).trend).toBe("stable");
  });

  it("builds ingredient breakdown with share percentages", () => {
    const recipeLines: RecipeIngredientInput[] = [
      {
        productId: "p1",
        ingredientId: "i1",
        ingredientName: "Beef",
        unit: "lb",
        quantity: 2,
        wastePercent: 0,
        costPerUnit: 8,
        yieldQuantity: 4,
      },
      {
        productId: "p1",
        ingredientId: "i2",
        ingredientName: "Bun",
        unit: "ea",
        quantity: 4,
        wastePercent: 0,
        costPerUnit: 0.5,
        yieldQuantity: 4,
      },
    ];
    const priceMap = new Map<string, IngredientPricePoint>([
      [
        "i1",
        {
          ingredientId: "i1",
          name: "Beef",
          unit: "lb",
          currentCostPerUnit: 9,
          previousCostPerUnit: 8,
          usedInProductCount: 3,
        },
      ],
      [
        "i2",
        {
          ingredientId: "i2",
          name: "Bun",
          unit: "ea",
          currentCostPerUnit: 0.5,
          previousCostPerUnit: 0.5,
          usedInProductCount: 5,
        },
      ],
    ]);

    const breakdown = buildIngredientBreakdownForProduct("p1", recipeLines, priceMap);
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0]!.priceTrend).toBe("up");
    expect(breakdown.reduce((s, b) => s + b.shareOfRecipeCostPercent, 0)).toBeCloseTo(100, 0);
  });

  it("assembles workspace analysis with recommendations", () => {
    const analysis = assembleFoodCostAnalysis({
      workspaceId: "ws-1",
      targetMarginPercent: 60,
      targetFoodCostPercent: 32,
      costingLines: [
        {
          productId: "p1",
          itemTitle: "Burger",
          salePrice: 14,
          ingredientCost: 5,
          laborCost: 1,
          totalCost: 7,
          grossMarginPercent: 50,
          foodCostPercent: 35.7,
          suggestedPrice: 16,
          warningLevel: "WARN",
        },
      ],
      recipeLines: [],
      pricePoints: [
        {
          ingredientId: "i1",
          name: "Beef",
          unit: "lb",
          currentCostPerUnit: 9,
          previousCostPerUnit: 7,
          usedInProductCount: 2,
        },
      ],
      missingRecipes: 2,
      recipeCount: 1,
    });

    expect(analysis.overallFoodCostPercent).toBe(35.7);
    expect(analysis.itemsBelowTargetMargin).toBe(1);
    expect(analysis.recommendations.length).toBeGreaterThan(1);
    expect(analysis.aiAssisted).toBe(true);
    expect(analysis.topIngredientMovers[0]?.name).toBe("Beef");
  });

  it("recommends price action when margin gap is large", () => {
    const msg = recommendForItem({
      itemTitle: "Burger",
      grossMarginPercent: 42,
      foodCostPercent: 34,
      targetMarginPercent: 60,
      targetFoodCostPercent: 32,
      suggestedPrice: 15.5,
    });
    expect(msg).toContain("15.50");
  });

  it("recomputes margin for what-if", () => {
    const m = recomputeMargin({ salePrice: 12, ingredientCost: 4, totalCost: 6 });
    expect(m.foodCostPercent).toBeCloseTo(33.3, 0);
    expect(m.grossMarginPercent).toBe(50);
  });

  it("ranks top ingredient movers by abs change", () => {
    const movers = buildTopIngredientMovers([
      {
        ingredientId: "a",
        name: "Tomato",
        unit: "lb",
        currentCostPerUnit: 3,
        previousCostPerUnit: 2,
        usedInProductCount: 4,
      },
      {
        ingredientId: "b",
        name: "Oil",
        unit: "gal",
        currentCostPerUnit: 10,
        previousCostPerUnit: 9.5,
        usedInProductCount: 2,
      },
    ]);
    expect(movers[0]?.name).toBe("Tomato");
  });
});
