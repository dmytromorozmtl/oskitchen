import { describe, expect, it, vi } from "vitest";

import { analyzeFoodCost } from "@/services/ai/food-cost-ai";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  ingredientListWhereForOwner: vi.fn().mockResolvedValue({ userId: "user-1" }),
  recipeListWhereForOwner: vi.fn().mockResolvedValue({ userId: "user-1" }),
  orderListWhereForOwnerAnd: vi.fn().mockResolvedValue({ userId: "user-1" }),
}));

vi.mock("@/services/costing/costing-service", () => ({
  loadCostingOverviewData: vi.fn().mockResolvedValue({
    targetMarginPercent: 60,
    warningMarginPercent: 50,
    recipeCount: 2,
    latestLines: [
      {
        productId: "p1",
        itemTitle: "Burger",
        salePrice: 14,
        ingredientCost: 4.5,
        laborCost: 1,
        totalCost: 6.5,
        grossMarginPercent: 53.6,
        foodCostPercent: 32.1,
        suggestedPrice: 15,
        warningLevel: "OK",
      },
    ],
    kpis: { missingRecipes: 0 },
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenSettings: {
      findUnique: vi.fn().mockResolvedValue({
        costingSettingsJson: { foodCostTargetPercent: 32, targetMarginPercent: 60 },
      }),
    },
    recipe: {
      findMany: vi.fn().mockResolvedValue([
        {
          productId: "p1",
          name: "Burger",
          yieldQuantity: 1,
          ingredients: [
            {
              ingredientId: "i1",
              quantity: 1,
              wastePercent: 0,
              ingredient: { id: "i1", name: "Beef", unit: "lb", costPerUnit: 4.5 },
            },
          ],
        },
      ]),
    },
    supplierPriceHistory: {
      findMany: vi.fn().mockResolvedValue([
        { ingredientId: "i1", newUnitCost: 5, effectiveAt: new Date() },
        { ingredientId: "i1", newUnitCost: 4.5, effectiveAt: new Date("2026-05-01") },
      ]),
    },
    ingredient: {
      findMany: vi.fn().mockResolvedValue([
        { id: "i1", name: "Beef", unit: "lb", costPerUnit: 4.5 },
      ]),
    },
    orderItem: {
      groupBy: vi.fn().mockResolvedValue([
        { productId: "p1", _sum: { quantity: 42 } },
      ]),
    },
  },
}));

describe("food cost ai service (integration)", () => {
  it("analyzes food cost for workspace", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const analysis = await analyzeFoodCost("ws-1");
    expect(analysis.workspaceId).toBe("ws-1");
    expect(analysis.itemAnalyses).toHaveLength(1);
    expect(analysis.itemAnalyses[0]!.itemTitle).toBe("Burger");
    expect(analysis.confidence).toBeGreaterThan(0.5);
    expect(analysis.topIngredientMovers.length).toBeGreaterThan(0);
    expect(analysis.dailyBrief.headline.length).toBeGreaterThan(0);
    expect(analysis.itemAnalyses[0]!.profitPerItem).toBeGreaterThan(0);
    expect(analysis.itemAnalyses[0]!.priceRecommendation).toBeDefined();
    expect(analysis.summary.avgProfitPerItem).toBeGreaterThan(0);
  });
});
