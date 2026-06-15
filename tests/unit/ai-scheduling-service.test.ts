import { describe, expect, it } from "vitest";

import {
  aggregateDemandByDayOfWeek,
  buildAiSchedulePlan,
  recommendHeadcount,
} from "@/services/labor/ai-scheduling-service";

describe("ai scheduling service", () => {
  it("aggregates revenue and orders by day of week", () => {
    const demand = aggregateDemandByDayOfWeek(
      [
        { status: "COMPLETED", total: 100, createdAt: new Date("2026-05-05T12:00:00.000Z") },
        { status: "COMPLETED", total: 50, createdAt: new Date("2026-05-12T12:00:00.000Z") },
        { status: "CANCELLED", total: 999, createdAt: new Date("2026-05-12T13:00:00.000Z") },
      ],
      60,
    );
    const tuesday = demand.find((d) => d.dayOfWeek === 2);
    expect(tuesday?.avgOrders).toBeGreaterThan(0);
    expect(tuesday?.avgRevenue).toBe(75);
  });

  it("recommends more staff when order volume rises", () => {
    const low = recommendHeadcount(10, 400, 28, 18);
    const high = recommendHeadcount(80, 3200, 28, 18);
    expect(high).toBeGreaterThan(low);
  });

  it("builds a weekly plan with labor percent summary", () => {
    const weekStart = new Date("2026-06-02T00:00:00.000Z");
    const plan = buildAiSchedulePlan({
      weekStart,
      targetLaborPct: 28,
      avgHourlyRate: 20,
      dowDemand: [
        { dayOfWeek: 1, avgRevenue: 1000, avgOrders: 40, sampleWeeks: 4 },
        { dayOfWeek: 2, avgRevenue: 900, avgOrders: 36, sampleWeeks: 4 },
        { dayOfWeek: 3, avgRevenue: 850, avgOrders: 34, sampleWeeks: 4 },
        { dayOfWeek: 4, avgRevenue: 950, avgOrders: 38, sampleWeeks: 4 },
        { dayOfWeek: 5, avgRevenue: 1200, avgOrders: 50, sampleWeeks: 4 },
        { dayOfWeek: 6, avgRevenue: 1400, avgOrders: 60, sampleWeeks: 4 },
        { dayOfWeek: 0, avgRevenue: 800, avgOrders: 30, sampleWeeks: 4 },
      ],
      staff: [
        { id: "s1", name: "Alex", roleType: "LINE_COOK" },
        { id: "s2", name: "Jordan", roleType: "MANAGER" },
        { id: "s3", name: "Sam", roleType: "PACKER" },
      ],
    });

    expect(plan.days).toHaveLength(7);
    expect(plan.summary.totalShifts).toBeGreaterThan(0);
    expect(plan.summary.blendedLaborPct).toBeGreaterThan(0);
    expect(plan.summary.confidence).toBe("high");
    expect(plan.days[0]?.shifts[0]?.staffName).toBeTruthy();
  });

  it("returns guidance when no staff are available", () => {
    const plan = buildAiSchedulePlan({
      weekStart: new Date("2026-06-02T00:00:00.000Z"),
      targetLaborPct: 28,
      avgHourlyRate: 18,
      dowDemand: [{ dayOfWeek: 1, avgRevenue: 500, avgOrders: 20, sampleWeeks: 1 }],
      staff: [],
    });
    expect(plan.summary.totalShifts).toBe(0);
    expect(plan.summary.notes.some((n) => n.includes("Add active staff"))).toBe(true);
  });
});
