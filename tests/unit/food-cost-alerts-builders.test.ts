import { describe, expect, it } from "vitest";

import {
  alertIngredientPriceSpikes,
  alertLowMarginItems,
  buildIngredientUsageMap,
  applyVolumeFromTopProductsByTitle,
  mergeFoodCostAlerts,
} from "@/lib/ai/food-cost-alerts-builders";
import type { FoodCostItemAnalysis } from "@/lib/ai/food-cost-types";

function sampleItem(overrides: Partial<FoodCostItemAnalysis> = {}): FoodCostItemAnalysis {
  return {
    productId: "p1",
    itemTitle: "Burger",
    salePrice: 14,
    foodCostPercent: 38,
    grossMarginPercent: 25,
    ingredientCost: 5,
    laborCost: 1,
    totalCost: 10.5,
    targetFoodCostPercent: 32,
    targetMarginPercent: 60,
    marginGapPercent: 35,
    warningLevel: "WARN",
    recommendation: "Raise price",
    suggestedPrice: 16,
    ingredientBreakdown: [],
    ...overrides,
  };
}

describe("food cost alerts builders", () => {
  it("alerts when margin is below 30%", () => {
    const alerts = alertLowMarginItems({
      items: [sampleItem()],
      volumeByProduct: new Map([["p1", 20]]),
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.type).toBe("low_margin");
    expect(alerts[0]!.impact).toBeGreaterThan(0);
    expect(alerts[0]!.title).toContain("25%");
  });

  it("skips items above margin threshold", () => {
    const alerts = alertLowMarginItems({
      items: [sampleItem({ grossMarginPercent: 45 })],
      volumeByProduct: new Map(),
    });
    expect(alerts).toHaveLength(0);
  });

  it("alerts ingredient spikes above 10% with impact", () => {
    const alerts = alertIngredientPriceSpikes({
      movers: [
        {
          ingredientId: "i1",
          name: "Beef",
          unit: "lb",
          currentCostPerUnit: 11,
          previousCostPerUnit: 9,
          priceChangePercent: 22.2,
          priceTrend: "up",
          shareOfRecipeCostPercent: 40,
          usedInProductCount: 3,
        },
      ],
      usageByIngredient: new Map([
        ["i1", { ingredientId: "i1", weeklyUsage: 50, unitCost: 11 }],
      ]),
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]!.type).toBe("ingredient_price_spike");
    expect(alerts[0]!.impact).toBe(100);
    expect(alerts[0]!.severity).toBe("warning");
  });

  it("ignores stable or small ingredient moves", () => {
    const alerts = alertIngredientPriceSpikes({
      movers: [
        {
          ingredientId: "i2",
          name: "Salt",
          unit: "lb",
          currentCostPerUnit: 1.05,
          previousCostPerUnit: 1,
          priceChangePercent: 5,
          priceTrend: "up",
          shareOfRecipeCostPercent: 1,
          usedInProductCount: 10,
        },
      ],
      usageByIngredient: new Map(),
    });
    expect(alerts).toHaveLength(0);
  });

  it("merges duplicate alert ids keeping higher impact", () => {
    const merged = mergeFoodCostAlerts([
      {
        id: "low_margin-p1",
        type: "low_margin",
        severity: "warning",
        title: "A",
        description: "d",
        impact: 50,
        confidence: 0.8,
        suggestedAction: "act",
        expiresAt: new Date(),
      },
      {
        id: "low_margin-p1",
        type: "low_margin",
        severity: "warning",
        title: "B",
        description: "d",
        impact: 120,
        confidence: 0.8,
        suggestedAction: "act",
        expiresAt: new Date(),
      },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.impact).toBe(120);
  });

  it("builds volume and usage maps", () => {
    const vol = applyVolumeFromTopProductsByTitle(
      [sampleItem()],
      [{ title: "Burger", quantity: 10 }],
      7,
      new Map(),
    );
    expect(vol.get("p1")).toBe(10);

    const usage = buildIngredientUsageMap([{ ingredientId: "i1", required: 28 }], 7);
    expect(usage.get("i1")?.weeklyUsage).toBe(28);
  });
});
