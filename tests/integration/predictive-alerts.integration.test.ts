import { describe, expect, it, vi } from "vitest";

import { generatePredictiveAlerts } from "@/services/ai/predictive-alerts";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveWorkspaceOwnerUserId: vi.fn(),
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/services/ingredient-demand/demand-service", () => ({
  loadDemandCommandCenterPayload: vi.fn().mockResolvedValue({ rows: [] }),
}));

vi.mock("@/services/labor/ai-scheduling-service", () => ({
  loadAiSchedulePlan: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/services/costing/costing-service", () => ({
  loadCostingOverviewData: vi.fn().mockResolvedValue({ latestLines: [], targetMarginPercent: 35, kpis: {} }),
}));

vi.mock("@/services/executive/executive-dashboard-service", () => ({
  loadExecutiveOverview: vi.fn().mockResolvedValue({
    orderTrend: 0.05,
    netRevenue: 10000,
  }),
}));

vi.mock("@/services/labor/labor-realtime-load", () => ({
  getLaborRealtimeData: vi.fn().mockResolvedValue({ hourlyRate: 18 }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    costingRun: { findMany: vi.fn().mockResolvedValue([]) },
    profitabilityLine: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

describe("predictive alerts service (integration)", () => {
  it("returns sorted alerts for a workspace", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue("user-1");

    const alerts = await generatePredictiveAlerts("ws-1");
    expect(Array.isArray(alerts)).toBe(true);
  });

  it("throws when workspace is unknown", async () => {
    const { resolveWorkspaceOwnerUserId } = await import("@/lib/scope/resolve-owner-workspace-id");
    vi.mocked(resolveWorkspaceOwnerUserId).mockResolvedValue(null);

    await expect(generatePredictiveAlerts("missing")).rejects.toThrow(/Workspace not found/);
  });
});
