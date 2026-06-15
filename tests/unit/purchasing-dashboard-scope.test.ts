import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    supplier: { findMany: vi.fn() },
    reorderQueueItem: { count: vi.fn(), findMany: vi.fn() },
    purchaseOrder: { groupBy: vi.fn(), findMany: vi.fn() },
    receivingEvent: { findMany: vi.fn() },
    supplierPriceHistory: { findMany: vi.fn() },
    ingredient: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  supplierListWhereForOwner: vi.fn(),
  reorderQueueItemListWhereForOwner: vi.fn(),
  purchaseOrderListWhereForOwner: vi.fn(),
  ingredientListWhereForOwner: vi.fn(),
}));

vi.mock("@/services/ingredient-demand/demand-service", () => ({
  loadDemandCommandCenterPayload: vi.fn().mockResolvedValue({
    rows: [],
    ordersConsidered: 0,
    recipesLinked: 0,
    productionItemsConsidered: 0,
    warnings: [],
    missingRecipes: [],
    contributions: [],
    totals: {
      ingredientLineCount: 0,
      shortageLineCount: 0,
      estimatedCostTotal: 0,
      recipesMissingCount: 0,
      suppliersDistinct: 0,
      wasteBufferPercent: 0,
      purchaseNeededLines: 0,
    },
    settings: { enabledSources: {} },
    brands: [],
    locations: [],
    substitutions: [],
    latestRun: null,
    stubSourcesEnabled: [],
    window: { from: "", to: "" },
  }),
}));

import { prisma } from "@/lib/prisma";
import {
  ingredientListWhereForOwner,
  purchaseOrderListWhereForOwner,
  reorderQueueItemListWhereForOwner,
  supplierListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { loadPurchasingDashboard } from "@/services/purchasing/purchasing-service";

const scoped = { workspaceId: "ws-1" };

describe("loadPurchasingDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supplierListWhereForOwner).mockResolvedValue(scoped);
    vi.mocked(reorderQueueItemListWhereForOwner).mockResolvedValue(scoped);
    vi.mocked(purchaseOrderListWhereForOwner).mockResolvedValue(scoped);
    vi.mocked(ingredientListWhereForOwner).mockResolvedValue(scoped);
    vi.mocked(prisma.supplier.findMany).mockResolvedValue([]);
    vi.mocked(prisma.reorderQueueItem.count).mockResolvedValue(0);
    vi.mocked(prisma.reorderQueueItem.findMany).mockResolvedValue([]);
    vi.mocked(prisma.purchaseOrder.groupBy).mockResolvedValue([]);
    vi.mocked(prisma.purchaseOrder.findMany).mockResolvedValue([]);
    vi.mocked(prisma.receivingEvent.findMany).mockResolvedValue([]);
    vi.mocked(prisma.supplierPriceHistory.findMany).mockResolvedValue([]);
    vi.mocked(prisma.ingredient.findMany).mockResolvedValue([]);
  });

  it("scopes purchase orders and suppliers by owner workspace", async () => {
    await loadPurchasingDashboard("owner-1");
    expect(prisma.purchaseOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: scoped }),
    );
    expect(prisma.supplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { AND: [scoped, { active: true }] },
      }),
    );
  });
});
