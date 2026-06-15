import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    analyticsSnapshot: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: "snap-1" }),
    },
    analyticsEvent: { create: vi.fn().mockResolvedValue({}) },
  },
}));

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn().mockResolvedValue("ws-1"),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  analyticsSnapshotListWhereForOwner: vi.fn().mockResolvedValue({
    workspaceId: "ws-1",
  }),
}));

vi.mock("@/services/analytics/analytics-service", () => ({
  loadExecutiveOverview: vi.fn().mockResolvedValue({
    grossRevenue: 100,
    netRevenue: 90,
    orderCount: 5,
    aov: 20,
    repeatRate: 0.2,
    newCustomerCount: 1,
    activeCustomerCount: 4,
    cancelledOrderCount: 0,
    lateOrderCount: 0,
    productionCompletionRate: 1,
    packingCompletionRate: 1,
    deliveryCompletionRate: 1,
    cateringRevenue: 0,
    mealPlanRevenue: 0,
    topChannel: null,
    topBrand: null,
    topLocation: null,
  }),
}));

import { prisma } from "@/lib/prisma";
import { createAnalyticsSnapshot, listSnapshots } from "@/services/analytics/snapshot-service";

describe("analytics snapshot service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createAnalyticsSnapshot sets workspaceId", async () => {
    await createAnalyticsSnapshot({ userId: "user-1" });
    expect(prisma.analyticsSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ workspaceId: "ws-1", userId: "user-1" }),
      }),
    );
  });

  it("listSnapshots uses scoped where", async () => {
    await listSnapshots("user-1");
    expect(prisma.analyticsSnapshot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { workspaceId: "ws-1" },
      }),
    );
  });
});
