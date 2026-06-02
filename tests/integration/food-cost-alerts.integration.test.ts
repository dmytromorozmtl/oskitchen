import { describe, expect, it, vi } from "vitest";

import { generateFoodCostAlerts } from "@/services/ai/food-cost-alerts";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/services/ai/food-cost-ai", () => ({
  analyzeFoodCost: vi.fn().mockResolvedValue({
    workspaceId: "ws-1",
    itemAnalyses: [
      {
        productId: "p1",
        itemTitle: "Burger",
        salePrice: 12,
        foodCostPercent: 40,
        grossMarginPercent: 22,
        ingredientCost: 4.8,
        laborCost: 1,
        totalCost: 9.4,
        targetFoodCostPercent: 32,
        targetMarginPercent: 60,
        marginGapPercent: 38,
        warningLevel: "WARN",
        recommendation: "Raise price",
        suggestedPrice: 14,
        ingredientBreakdown: [{ ingredientId: "i1" }],
      },
    ],
    topIngredientMovers: [
      {
        ingredientId: "i1",
        name: "Beef",
        unit: "lb",
        currentCostPerUnit: 10,
        previousCostPerUnit: 8,
        priceChangePercent: 25,
        priceTrend: "up",
        shareOfRecipeCostPercent: 50,
        usedInProductCount: 2,
      },
    ],
  }),
}));

vi.mock("@/services/executive/executive-dashboard-service", () => ({
  loadExecutiveOverview: vi.fn().mockResolvedValue({
    topProducts: [{ productId: "p1", title: "Burger", quantity: 35 }],
    netRevenue: 1000,
    orderTrend: 0,
  }),
}));

vi.mock("@/services/ingredient-demand/demand-service", () => ({
  loadDemandCommandCenterPayload: vi.fn().mockResolvedValue({
    rows: [{ ingredientId: "i1", required: 40 }],
  }),
}));

describe("food cost alerts service (integration)", () => {
  it("generates margin and ingredient spike alerts", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const alerts = await generateFoodCostAlerts("ws-1");
    expect(alerts.some((a) => a.type === "low_margin")).toBe(true);
    expect(alerts.some((a) => a.type === "ingredient_price_spike")).toBe(true);
    expect(alerts.every((a) => a.impact >= 0)).toBe(true);
  });
});
