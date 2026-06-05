import { describe, expect, it } from "vitest";

import {
  buildInventoryManagerSnapshot,
  buildShrinkageSignals,
  buildTheftSignals,
  buildWasteSignals,
} from "@/lib/ai/inventory-manager-builders";
import {
  AI_INVENTORY_MANAGER_POLICY_ID,
  AI_INVENTORY_MANAGER_ROUTE,
  AI_INVENTORY_MANAGER_SERVICE,
} from "@/lib/ai/inventory-manager-policy";

describe("AI inventory manager", () => {
  it("locks policy constants", () => {
    expect(AI_INVENTORY_MANAGER_POLICY_ID).toBe("ai-inventory-manager-v1");
    expect(AI_INVENTORY_MANAGER_SERVICE).toBe("services/ai/inventory-manager.ts");
    expect(AI_INVENTORY_MANAGER_ROUTE).toBe("/dashboard/inventory/manager");
  });

  it("builds waste signals with theft as critical", () => {
    const signals = buildWasteSignals({
      SPOILAGE: { count: 4, totalCost: 120 },
      THEFT: { count: 1, totalCost: 80 },
    });
    expect(signals[0]?.reason).toBe("SPOILAGE");
    expect(signals.find((row) => row.reason === "THEFT")?.severity).toBe("critical");
  });

  it("builds theft signals sorted by score", () => {
    const signals = buildTheftSignals([
      {
        productId: "p1",
        productName: "Burger",
        theftScore: 45,
        variancePercent: 22,
        theoreticalCost: 4,
        actualCost: 5.2,
        period: "Jun 1 → Jun 5",
      },
      {
        productId: "p2",
        productName: "Fries",
        theftScore: 70,
        variancePercent: 35,
        theoreticalCost: 1,
        actualCost: 1.8,
        period: "Jun 1 → Jun 5",
      },
    ]);
    expect(signals[0]?.productName).toBe("Fries");
    expect(signals[0]?.severity).toBe("critical");
    expect(signals[0]?.estimatedExposure).toBeCloseTo(0.8, 1);
  });

  it("builds shrinkage signals from negative count variance", () => {
    const signals = buildShrinkageSignals([
      {
        id: "c1",
        createdAt: new Date("2026-06-01"),
        varianceSummary: { shrinkCost: -320, linesWithVariance: 5 },
      },
      {
        id: "c2",
        createdAt: new Date("2026-06-03"),
        varianceSummary: { shrinkCost: 40, linesWithVariance: 1 },
      },
    ]);
    expect(signals).toHaveLength(1);
    expect(signals[0]?.shrinkCost).toBe(-320);
    expect(signals[0]?.severity).toBe("high");
  });

  it("assembles snapshot with daily brief", () => {
    const snapshot = buildInventoryManagerSnapshot({
      workspaceId: "ws-1",
      wasteSignals: buildWasteSignals({ PREP_WASTE: { count: 3, totalCost: 240 } }),
      theftSignals: buildTheftSignals([
        {
          productId: "p1",
          productName: "Salad",
          theftScore: 42,
          variancePercent: 21,
          theoreticalCost: 3,
          actualCost: 3.9,
          period: "May → Jun",
        },
      ]),
      shrinkageSignals: buildShrinkageSignals([
        {
          id: "c1",
          createdAt: new Date("2026-06-04"),
          varianceSummary: { shrinkCost: -150, linesWithVariance: 3 },
        },
      ]),
      analyzedAt: new Date("2026-06-05T12:00:00.000Z"),
    });

    expect(snapshot.policyId).toBe(AI_INVENTORY_MANAGER_POLICY_ID);
    expect(snapshot.summary.totalWasteCost).toBe(240);
    expect(snapshot.summary.alertCount).toBeGreaterThan(0);
    expect(snapshot.dailyBrief.headline.length).toBeGreaterThan(0);
    expect(snapshot.dailyBrief.bullets.length).toBeGreaterThan(0);
    expect(snapshot.aiAssisted).toBe(true);
  });
});
