import { beforeEach, describe, expect, it, vi } from "vitest";

import { autoPurchase } from "@/services/ai/purchasing-automation";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/ai/ai-purchasing-ui-storage", () => ({
  loadAiPurchasingUiState: vi.fn().mockResolvedValue({ skipped: {}, quantityOverrides: {} }),
}));

vi.mock("@/services/ai/ai-purchasing-dashboard", () => ({
  loadPurchasingAiDashboard: vi.fn().mockResolvedValue({
    recommendations: [
      {
        ingredientId: "i1",
        ingredientName: "Flour",
        unit: "lb",
        category: "Dry",
        currentStock: 2,
        reorderPoint: 8,
        dailyUsage: 3,
        predictedDemand14d: 28,
        daysRemaining: 1,
        urgency: "critical",
        bestSupplier: {
          supplierId: "s1",
          supplierName: "Sysco",
          supplierItemId: "si1",
          unitCost: 1.1,
          eoq: 20,
          orderQuantity: 25,
          orderTotal: 27.5,
          leadTimeDays: 2,
        },
        alternativeSupplier: null,
        confidence: 0.92,
        suggestedAction: "Order",
      },
      {
        ingredientId: "i2",
        ingredientName: "Oil",
        unit: "gal",
        category: "Dry",
        currentStock: 1,
        reorderPoint: 5,
        dailyUsage: 1,
        predictedDemand14d: 10,
        daysRemaining: 5,
        urgency: "normal",
        bestSupplier: {
          supplierId: "s1",
          supplierName: "Sysco",
          supplierItemId: "si2",
          unitCost: 12,
          eoq: 10,
          orderQuantity: 10,
          orderTotal: 120,
          leadTimeDays: 2,
        },
        alternativeSupplier: null,
        confidence: 0.95,
        suggestedAction: "Order",
      },
    ],
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenSettings: {
      findUnique: vi.fn().mockResolvedValue({
        settingsCenterJson: {
          aiPurchasingAutomation: { enabled: true, minConfidence: 0.85, maxDaysRemaining: 3, autoApproveMaxAmount: 500 },
        },
      }),
      upsert: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock("@/services/ai/ai-purchasing-orders", () => ({
  createPurchaseOrdersFromAiLines: vi.fn().mockResolvedValue({
    poIds: ["po-1"],
    errors: [],
    orders: [
      {
        poId: "po-1",
        orderNumber: "PO-TEST",
        supplierName: "Sysco",
        total: 27.5,
        status: "APPROVED",
        lineCount: 1,
        ingredientIds: ["i1"],
      },
    ],
  }),
}));

describe("purchasing automation service (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("auto-purchases eligible items when enabled", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const result = await autoPurchase("ws-1");

    expect(result.enabled).toBe(true);
    expect(result.eligibleCount).toBe(1);
    expect(result.orderedLineCount).toBe(1);
    expect(result.orders).toHaveLength(1);
    expect(result.orders[0]!.autoApproved).toBe(true);
  });

  it("supports dry run without creating POs", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const { createPurchaseOrdersFromAiLines } = await import("@/services/ai/ai-purchasing-orders");
    const result = await autoPurchase("ws-1", { dryRun: true, force: true });

    expect(result.eligibleCount).toBe(1);
    expect(result.orderedLineCount).toBe(0);
    expect(vi.mocked(createPurchaseOrdersFromAiLines)).not.toHaveBeenCalled();
  });
});
