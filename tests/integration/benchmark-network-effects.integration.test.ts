import { beforeEach, describe, expect, it, vi } from "vitest";

import { contributeData, getNetworkStatus } from "@/services/ai/benchmark-network";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenSettings: {
      findUnique: vi.fn(),
      update: vi.fn(),
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

vi.mock("@/lib/ai/benchmark-network-pool-storage", () => ({
  readBenchmarkPool: vi.fn(),
  addToBenchmarkPool: vi.fn(),
}));

import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { prisma } from "@/lib/prisma";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";
import { analyzeFoodCost } from "@/services/ai/food-cost-ai";
import { getLaborRealtimeData } from "@/services/labor/labor-realtime-load";
import { getKDSPredictions } from "@/services/ai/real-time-twin";
import { readBenchmarkPool, addToBenchmarkPool } from "@/lib/ai/benchmark-network-pool-storage";
import { emptyBenchmarkPool } from "@/lib/ai/benchmark-network-effects-builders";

describe("benchmark network effects integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");
    vi.mocked(prisma.kitchenSettings.findUnique).mockResolvedValue({
      businessType: "RESTAURANT",
      settingsCenterJson: {},
    } as never);
    vi.mocked(prisma.kitchenSettings.update).mockResolvedValue({} as never);
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
    vi.mocked(getKDSPredictions).mockResolvedValue(null);
    vi.mocked(readBenchmarkPool).mockResolvedValue(emptyBenchmarkPool());
    vi.mocked(addToBenchmarkPool).mockImplementation(async (c) => ({
      updatedAt: new Date().toISOString(),
      contributions: [c],
      cohortStats: { "restaurant-na": { restaurantCount: 1, metricAverages: {} } },
    }));
  });

  it("getNetworkStatus returns seed totals and live contributors", async () => {
    vi.mocked(readBenchmarkPool).mockResolvedValue({
      updatedAt: new Date().toISOString(),
      contributions: [
        {
          anonId: "abc123",
          cohortId: "restaurant-na",
          businessType: "RESTAURANT",
          region: "NA",
          contributedAt: new Date().toISOString(),
          metrics: [{ key: "food_cost_percent", value: 30 }],
        },
      ],
      cohortStats: {},
    });

    const status = await getNetworkStatus("ws-1");
    expect(status.liveContributors).toBe(1);
    expect(status.cohortsAvailable).toBeGreaterThan(0);
    expect(status.totalRestaurants).toBeGreaterThan(status.liveContributors);
  });

  it("contributeData anonymizes and adds to pool", async () => {
    const result = await contributeData("ws-1");

    expect(result.success).toBe(true);
    expect(result.metricsShared).toBeGreaterThan(5);
    expect(result.anonId).toHaveLength(12);
    expect(addToBenchmarkPool).toHaveBeenCalledOnce();
    expect(prisma.kitchenSettings.update).toHaveBeenCalled();
    expect(result.networkStatus.liveContributors).toBe(1);
  });
});
