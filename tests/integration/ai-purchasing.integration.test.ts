import { describe, expect, it, vi } from "vitest";

import { generatePurchaseRecommendations } from "@/services/ai/ai-purchasing";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  ingredientListWhereForOwner: vi.fn().mockResolvedValue({ userId: "user-1" }),
  supplierListWhereForOwner: vi.fn().mockResolvedValue({ userId: "user-1" }),
}));

vi.mock("@/services/ingredient-demand/demand-service", () => ({
  loadDemandCommandCenterPayload: vi.fn().mockResolvedValue({
    window: { from: "2026-06-01", to: "2026-06-14" },
    rows: [
      {
        ingredientId: "i1",
        name: "Flour",
        required: 28,
        stock: 5,
        shortage: 10,
        unit: "lb",
      },
    ],
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ingredient: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "i1",
          name: "Flour",
          unit: "lb",
          category: "Dry",
          currentStock: 5,
          parLevel: 20,
          reorderPoint: 8,
          supplier: "Local Mill",
          costPerUnit: 1.2,
        },
      ]),
    },
    supplierItem: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "si1",
          ingredientId: "i1",
          unitCost: 1.1,
          purchaseUnit: "lb",
          packSize: 25,
          minimumQuantity: 25,
          leadTimeDays: 2,
          supplier: { id: "s1", name: "Local Mill", leadTimeDays: 2 },
        },
        {
          id: "si2",
          ingredientId: "i1",
          unitCost: 1.25,
          purchaseUnit: "lb",
          packSize: null,
          minimumQuantity: null,
          leadTimeDays: 4,
          supplier: { id: "s2", name: "Wholesale Foods", leadTimeDays: 4 },
        },
      ]),
    },
    forecastLine: {
      findMany: vi.fn().mockResolvedValue([{ ingredientId: "i1", recommendedQuantity: 30 }]),
    },
  },
}));

describe("ai purchasing service (integration)", () => {
  it("generates purchase recommendations for workspace", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const result = await generatePurchaseRecommendations("ws-1");

    expect(result.workspaceId).toBe("ws-1");
    expect(result.recommendations.length).toBeGreaterThan(0);
    const flour = result.recommendations.find((r) => r.ingredientId === "i1");
    expect(flour?.dailyUsage).toBe(2);
    expect(flour?.predictedDemand14d).toBe(30);
    expect(flour?.bestSupplier.supplierName).toBe("Local Mill");
    expect(flour?.bestSupplier.eoq).toBeGreaterThan(0);
    expect(flour?.alternativeSupplier?.supplierName).toBe("Wholesale Foods");
    expect(result.summary.totalEstimatedSpend).toBeGreaterThan(0);
  });
});
