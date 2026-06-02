import { describe, expect, it, vi } from "vitest";

import { generateDailyBriefing } from "@/services/ai/ai-restaurant-brain";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
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
    window: { from: "2026-06-01", to: "2026-06-07" },
  }),
}));

vi.mock("@/services/labor/ai-scheduling-service", () => ({
  loadAiSchedulePlan: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/services/costing/costing-service", () => ({
  loadCostingOverviewData: vi.fn().mockResolvedValue({
    targetMarginPercent: 35,
    latestLines: [],
    kpis: { avgGrossMarginPct: 62 },
  }),
}));

vi.mock("@/services/executive/executive-dashboard-service", () => ({
  loadExecutiveOverview: vi.fn().mockResolvedValue({
    netRevenue: 4200,
    previousNetRevenue: 3900,
    revenueTrend: 0.077,
    orderCount: 68,
    marginMedian: 36,
    marginAtRiskItems: 1,
    packingAccuracy: 0.91,
    dailyRevenue: [{ date: "2026-06-01", value: 600 }],
  }),
}));

vi.mock("@/services/labor/labor-realtime-load", () => ({
  getLaborRealtimeData: vi.fn().mockResolvedValue({
    laborPercent: 29,
    hourlyRate: 18,
    activeStaff: 2,
    activeStaffNames: [],
    totalLaborHours: 16,
    laborCost: 288,
    totalRevenue: 1000,
    scheduledLaborCost: 300,
    scheduledLaborPercent: 30,
    targetLaborPercent: 28,
    status: "ON_TRACK",
    overtimePredictions: [],
    updatedAtIso: new Date().toISOString(),
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    costingRun: { findMany: vi.fn().mockResolvedValue([]) },
    profitabilityLine: { findMany: vi.fn().mockResolvedValue([]) },
    pOSTransaction: { groupBy: vi.fn().mockResolvedValue([]) },
    staffMember: { findMany: vi.fn().mockResolvedValue([]) },
    staffShift: { findMany: vi.fn().mockResolvedValue([]) },
    timeEntry: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

describe("ai restaurant brain service (integration)", () => {
  it("composes a daily briefing payload for a workspace", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const briefing = await generateDailyBriefing("ws-1");

    expect(briefing.workspaceId).toBe("ws-1");
    expect(briefing.aiAssisted).toBe(true);
    expect(briefing.overallConfidence).toBeGreaterThan(0);
    expect(briefing.weeklyForecast.predictedRevenue).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(briefing.inventoryAlerts)).toBe(true);
    expect(Array.isArray(briefing.profitInsights)).toBe(true);
  });

  it("throws when workspace is unknown", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue(null);

    await expect(generateDailyBriefing("missing-ws")).rejects.toThrow(/Workspace not found/);
  });
});
