import { beforeEach, describe, expect, it, vi } from "vitest";

import { getBenchmarkData } from "@/services/ai/benchmark-network";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenSettings: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/services/executive/executive-dashboard-service", () => ({
  loadExecutiveOverview: vi.fn(),
}));

vi.mock("@/services/ai/food-cost-ai", () => ({
  analyzeFoodCost: vi.fn(),
}));

vi.mock("@/services/labor/labor-realtime-load", () => ({
  getLaborRealtimeData: vi.fn(),
}));

vi.mock("@/services/ai/real-time-twin", () => ({
  getKDSPredictions: vi.fn(),
}));

import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { prisma } from "@/lib/prisma";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";
import { analyzeFoodCost } from "@/services/ai/food-cost-ai";
import { getLaborRealtimeData } from "@/services/labor/labor-realtime-load";
import { getKDSPredictions } from "@/services/ai/real-time-twin";

describe("benchmark network integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");
    vi.mocked(prisma.kitchenSettings.findUnique).mockResolvedValue({
      businessType: "RESTAURANT",
    } as never);
    vi.mocked(loadExecutiveOverview).mockResolvedValue({
      netRevenue: 45000,
      orderCount: 1800,
      aov: 25,
      repeatRate: 0.35,
      productionCompletion: 91,
      packingAccuracy: 97,
      deliveryCompletion: 93,
      inventoryShortages: 4,
      imminentShortages: 2,
      purchasingNeeds: 10,
      stalePurchaseOrders: 3,
      openTasks: 8,
      overdueTasks: 2,
      cateringOpenPipeline: 2,
      mealPlanActive: 0,
      failedIntegrations: 0,
      revenueTrend: 0.02,
      orderTrend: -0.01,
      marginMedian: 60,
      productionTotal: 80,
      overdueProductionItems: 3,
      channelMix: [{ channel: "pos", revenue: 30000, orders: 1200 }],
      topProducts: [{ title: "Pasta", quantity: 900 }],
      costingVarianceAlerts: [],
      health: { score: 76, status: "Healthy", explanation: "", contributions: [] },
    } as never);
    vi.mocked(analyzeFoodCost).mockResolvedValue({
      overallFoodCostPercent: 31,
      overallGrossMarginPercent: 61,
      itemAnalyses: [],
    } as never);
    vi.mocked(getLaborRealtimeData).mockResolvedValue({ laborPercent: 27 } as never);
    vi.mocked(getKDSPredictions).mockResolvedValue({
      stationPredictions: [
        { station: "Grill", predictedWaitMinutes: 12, utilization: 0.8, currentLoad: 4 },
        { station: "Salad", predictedWaitMinutes: 8, utilization: 0.5, currentLoad: 2 },
      ],
    } as never);
  });

  it("returns benchmark data for workspace with cohort comparison", async () => {
    const result = await getBenchmarkData("ws-1");

    expect(result.workspaceId).toBe("ws-1");
    expect(result.metrics.length).toBeGreaterThan(10);
    expect(result.cohort.businessType).toBe("RESTAURANT");
    expect(result.cohort.anonymized).toBe(true);
    expect(result.summary.averagePercentile).toBeGreaterThan(0);
    expect(result.metrics.every((m) => m.percentileRank >= 1 && m.percentileRank <= 99)).toBe(true);
  });

  it("throws when workspace not found", async () => {
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue(null);
    await expect(getBenchmarkData("missing")).rejects.toThrow("Workspace not found");
  });
});
