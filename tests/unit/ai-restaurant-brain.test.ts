import { describe, expect, it } from "vitest";

import {
  buildInventoryAlerts,
  buildLaborInsights,
  buildMenuInsights,
  buildProfitInsights,
  buildStaffInsights,
  buildWeeklyForecast,
  computeOverallConfidence,
} from "@/lib/ai/restaurant-brain-builders";
import type { IngredientDemandRow } from "@/lib/ingredient-demand/types";
import type { AiSchedulePlan } from "@/services/labor/ai-scheduling-service";

describe("restaurant brain builders", () => {
  it("flags critical inventory when days remaining are low", () => {
    const rows: IngredientDemandRow[] = [
      {
        ingredientId: "i1",
        name: "Chicken breast",
        category: "Protein",
        unit: "lb",
        dateKey: "2026-06-01",
        required: 70,
        stock: 10,
        shortage: 20,
        supplier: "Sysco",
        relatedProducts: ["Bowl"],
      },
    ];
    const alerts = buildInventoryAlerts(rows, 7);
    expect(alerts).toHaveLength(1);
    expect(alerts[0]?.urgency).toBe("critical");
    expect(alerts[0]?.daysRemaining).toBeLessThanOrEqual(2);
    expect(alerts[0]?.message).toContain("AI-assisted");
  });

  it("detects understaffed days from schedule plan", () => {
    const plan: AiSchedulePlan = {
      weekStartIso: "2026-06-02",
      targetLaborPct: 28,
      avgHourlyRate: 20,
      days: [
        {
          dateIso: "2026-06-05",
          dayLabel: "Thu",
          predictedRevenue: 2000,
          predictedOrders: 80,
          recommendedHeadcount: 4,
          projectedLaborCost: 400,
          projectedLaborPct: 20,
          shifts: [{ staffMemberId: "s1", staffName: "Alex", shiftDateIso: "2026-06-05", startTime: "10:00", endTime: "18:00", roleLabel: "Cook", estimatedHours: 8, estimatedLaborCost: 160 }],
        },
      ],
      summary: {
        totalProjectedRevenue: 2000,
        totalProjectedLabor: 400,
        blendedLaborPct: 20,
        totalShifts: 1,
        confidence: "high",
        notes: [],
      },
    };
    const insights = buildLaborInsights(plan, [], 20);
    expect(insights.some((i) => i.type === "understaffed")).toBe(true);
    expect(insights[0]?.impact).toBeGreaterThan(0);
  });

  it("surfaces low-margin menu items with week-over-week trend", () => {
    const previous = new Map([["p1", 42]]);
    const insights = buildMenuInsights(
      [
        {
          productId: "p1",
          itemTitle: "Chicken Bowl",
          grossMarginPercent: 34,
          foodCostPercent: 38,
          warningLevel: "CRITICAL",
          salePrice: 14,
          suggestedPrice: 15.5,
        },
      ],
      previous,
      40,
    );
    expect(insights).toHaveLength(1);
    expect(insights[0]?.trend).toBe("declining");
    expect(insights[0]?.recommendation).toContain("AI-assisted");
  });

  it("builds profit insights from executive aggregates", () => {
    const insights = buildProfitInsights({
      netRevenue: 10000,
      previousNetRevenue: 9000,
      revenueTrend: 0.11,
      marginMedian: 38,
      marginAtRiskItems: 2,
      packingAccuracy: 0.94,
      avgFoodCostPct: 33,
      laborPercent: 31,
      targetLaborPercent: 28,
    });
    expect(insights.length).toBeGreaterThanOrEqual(3);
    expect(insights.some((i) => i.factor === "Net revenue")).toBe(true);
    expect(insights.some((i) => i.factor === "Labor cost %")).toBe(true);
  });

  it("derives staff POS metrics insights", () => {
    const insights = buildStaffInsights(
      [
        { staffId: "s1", staffName: "Alex", orderCount: 40, avgTicket: 18, tipRate: 0.12 },
        { staffId: "s2", staffName: "Jordan", orderCount: 20, avgTicket: 16, tipRate: 0.08 },
      ],
      null,
      60,
    );
    expect(insights.some((i) => i.employee === "Alex" && i.metric === "speed")).toBe(true);
    expect(insights.some((i) => i.metric === "upsell_rate")).toBe(true);
  });

  it("forecasts weekly revenue from schedule plan", () => {
    const forecast = buildWeeklyForecast({
      schedulePlan: {
        weekStartIso: "2026-06-02",
        targetLaborPct: 28,
        avgHourlyRate: 18,
        days: [
          {
            dateIso: "2026-06-02",
            dayLabel: "Mon",
            predictedRevenue: 600,
            predictedOrders: 30,
            recommendedHeadcount: 2,
            projectedLaborCost: 200,
            projectedLaborPct: 33,
            shifts: [],
          },
          {
            dateIso: "2026-06-03",
            dayLabel: "Tue",
            predictedRevenue: 600,
            predictedOrders: 30,
            recommendedHeadcount: 2,
            projectedLaborCost: 200,
            projectedLaborPct: 33,
            shifts: [],
          },
        ],
        summary: {
          totalProjectedRevenue: 1200,
          totalProjectedLabor: 400,
          blendedLaborPct: 33,
          totalShifts: 0,
          confidence: "medium",
          notes: [],
        },
      },
      recentDailyRevenue: [],
      recentOrderCount: 0,
      recentDayCount: 7,
    });
    expect(forecast.predictedRevenue).toBe(1200);
    expect(forecast.predictedOrders).toBe(60);
    expect(forecast.confidence).toBeGreaterThan(0.5);
    expect(forecast.recommendations.length).toBeGreaterThan(0);
  });

  it("computes blended overall confidence", () => {
    const overall = computeOverallConfidence({
      inventory: [{ confidence: 0.8 } as never],
      labor: [{ confidence: 0.7 } as never],
      menu: [],
      staff: [],
      profit: [{ confidence: 0.9 } as never],
      forecastConfidence: 0.85,
    });
    expect(overall).toBeGreaterThan(0.7);
    expect(overall).toBeLessThanOrEqual(1);
  });
});
