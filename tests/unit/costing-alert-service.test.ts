import { describe, expect, it, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  costSnapshot: { findMany: vi.fn() },
  costingRun: { findFirst: vi.fn() },
  profitabilityLine: { findMany: vi.fn() },
  kitchenSettings: { findUnique: vi.fn() },
  workspace: { findFirst: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  costSnapshotListWhereForOwner: vi.fn().mockResolvedValue({ userId: "user-1" }),
  costingRunListWhereForOwner: vi.fn().mockResolvedValue({ userId: "user-1" }),
}));
vi.mock("@/services/costing/avt-report-service", () => ({
  loadAvtReport: vi.fn().mockResolvedValue({ rows: [], workspaceSummary: { confidence: "LOW" } }),
}));

import { checkCostingVariances, checkCostingVariancesForWorkspace } from "@/services/costing/costing-alert-service";

describe("costing-alert-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.costingRun.findFirst.mockResolvedValue(null);
    prismaMock.profitabilityLine.findMany.mockResolvedValue([]);
    prismaMock.kitchenSettings.findUnique.mockResolvedValue(null);
    prismaMock.workspace.findFirst.mockResolvedValue({ ownerUserId: "user-1" });
  });

  it("returns empty array when no snapshots", async () => {
    prismaMock.costSnapshot.findMany.mockResolvedValue([]);
    const alerts = await checkCostingVariances("user-1");
    expect(alerts).toEqual([]);
  });

  it("returns empty array when only one snapshot per product", async () => {
    prismaMock.costSnapshot.findMany.mockResolvedValue([
      {
        productId: "p1",
        totalCost: 12,
        createdAt: new Date(),
        product: { id: "p1", title: "Bowl" },
      },
    ]);
    const alerts = await checkCostingVariances("user-1");
    expect(alerts).toEqual([]);
  });

  it("does not alert when variance below threshold", async () => {
    prismaMock.costSnapshot.findMany.mockResolvedValue([
      {
        productId: "p1",
        totalCost: 10.5,
        createdAt: new Date("2026-05-10"),
        product: { id: "p1", title: "Bowl" },
      },
      {
        productId: "p1",
        totalCost: 10,
        createdAt: new Date("2026-05-01"),
        product: { id: "p1", title: "Bowl" },
      },
    ]);
    const alerts = await checkCostingVariances("user-1", 10);
    expect(alerts.filter((a) => a.source === "cost_snapshot")).toHaveLength(0);
  });

  it("flags snapshot cost jump above threshold", async () => {
    prismaMock.costSnapshot.findMany.mockResolvedValue([
      {
        productId: "p1",
        totalCost: 15,
        createdAt: new Date("2026-05-10"),
        product: { id: "p1", title: "Bowl" },
      },
      {
        productId: "p1",
        totalCost: 10,
        createdAt: new Date("2026-05-01"),
        product: { id: "p1", title: "Bowl" },
      },
    ]);

    const alerts = await checkCostingVariances("user-1", 10);
    expect(alerts.some((a) => a.productName === "Bowl" && a.source === "cost_snapshot")).toBe(true);
  });

  it("resolves workspace to owner userId", async () => {
    prismaMock.costSnapshot.findMany.mockResolvedValue([]);
    await checkCostingVariancesForWorkspace("ws-1");
    expect(prismaMock.workspace.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "ws-1" } }),
    );
    expect(prismaMock.costSnapshot.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([{ userId: "user-1" }]),
        }),
      }),
    );
  });
});
