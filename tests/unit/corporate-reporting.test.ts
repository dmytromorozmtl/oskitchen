import { describe, expect, it } from "vitest";

import {
  buildCorporateForecastStrip,
  buildCorporatePeriodComparison,
  buildCorporatePlLines,
  buildCorporateReportingDashboard,
} from "@/lib/enterprise/corporate-reporting-builders";
import { CORPORATE_REPORTING_POLICY_ID } from "@/lib/enterprise/corporate-reporting-policy";
import type { Forecasting2Snapshot } from "@/lib/ai/forecasting-types";
import type { ExecutiveOverview } from "@/services/analytics/analytics-service";

function executive(partial: Partial<ExecutiveOverview> = {}): ExecutiveOverview {
  return {
    filtersRangeLabel: "2026-05-01 → 2026-05-30",
    grossRevenue: 100000,
    netRevenue: 95000,
    cancelledRevenue: 5000,
    orderCount: 1200,
    cancelledOrderCount: 40,
    lateOrderCount: 12,
    aov: 79.17,
    repeatRate: 0.32,
    repeatRateLabel: "32%",
    newCustomerCount: 180,
    activeCustomerCount: 900,
    cateringRevenue: 8000,
    mealPlanRevenue: 4000,
    productionCompletionRate: 0.92,
    packingCompletionRate: 0.95,
    deliveryCompletionRate: 0.88,
    topChannel: null,
    topBrand: null,
    topLocation: null,
    fulfillmentMix: { pickup: 600, delivery: 600 },
    channelMix: [],
    topProducts: [],
    dailyRevenue: [
      { date: "2026-05-28", value: 3000 },
      { date: "2026-05-29", value: 3500 },
      { date: "2026-05-30", value: 3200 },
    ],
    warnings: [],
    ...partial,
  };
}

function forecast(): Forecasting2Snapshot {
  return {
    policyId: "forecasting-2-v1",
    generatedAtIso: "2026-06-05T12:00:00.000Z",
    horizonDays: 90,
    historyDays: 30,
    dailyForecast: [
      {
        dateIso: "2026-06-06",
        baselineOrders: 40,
        adjustedOrders: 42,
        baselineRevenueUsd: 3200,
        adjustedRevenueUsd: 3360,
        weatherLabel: "clear",
        holidayLabel: null,
        combinedMultiplier: 1.05,
      },
      {
        dateIso: "2026-06-07",
        baselineOrders: 38,
        adjustedOrders: 40,
        baselineRevenueUsd: 3000,
        adjustedRevenueUsd: 3150,
        weatherLabel: "rain",
        holidayLabel: null,
        combinedMultiplier: 1.05,
      },
    ],
    upcomingHolidays: [],
    summary: {
      avgDailyOrders: 40,
      projectedTotalOrders: 3600,
      projectedTotalRevenueUsd: 285000,
      weatherUpliftDays: 12,
      holidayUpliftDays: 4,
      confidence: "medium",
      warning: null,
    },
    basePath: "/dashboard/forecast/forecasting-2",
  };
}

describe("corporate reporting (ENT-65)", () => {
  it("locks ENT-65 policy id", () => {
    expect(CORPORATE_REPORTING_POLICY_ID).toBe("corporate-reporting-ent65-v1");
  });

  it("builds P&L lines with gross profit and EBITDA proxy", () => {
    const lines = buildCorporatePlLines({
      grossRevenue: 100000,
      netRevenue: 95000,
      cancelledRevenue: 5000,
      foodCostAmount: 30400,
      laborCostAmount: 26600,
      opexAmount: 7600,
    });
    expect(lines.find((l) => l.id === "net_revenue")?.amount).toBe(95000);
    expect(lines.find((l) => l.id === "gross_profit")?.amount).toBe(64600);
    expect(lines.find((l) => l.id === "ebitda")?.amount).toBe(30400);
  });

  it("computes period-over-period revenue change", () => {
    const comparison = buildCorporatePeriodComparison(
      executive({ netRevenue: 110000, orderCount: 1300 }),
      executive({ netRevenue: 100000, orderCount: 1200 }),
    );
    expect(comparison.changeAmount).toBe(10000);
    expect(comparison.changePercent).toBe(10);
    expect(comparison.orderChangePercent).toBeCloseTo(8.33, 1);
  });

  it("summarizes forecast preview for next seven days", () => {
    const strip = buildCorporateForecastStrip(forecast());
    expect(strip.preview).toHaveLength(2);
    expect(strip.nextSevenDaysRevenueUsd).toBe(6510);
    expect(strip.projectedRevenueUsd).toBe(285000);
    expect(strip.confidence).toBe("medium");
  });

  it("assembles full corporate reporting dashboard", () => {
    const dashboard = buildCorporateReportingDashboard({
      workspaceId: "ws-1",
      current: executive(),
      previous: executive({ netRevenue: 90000, orderCount: 1100 }),
      forecast: forecast(),
      laborPercent: 28,
      foodCostPercent: 32,
    });
    expect(dashboard.policyId).toBe(CORPORATE_REPORTING_POLICY_ID);
    expect(dashboard.plLines.length).toBeGreaterThanOrEqual(7);
    expect(dashboard.trends).toHaveLength(3);
    expect(dashboard.summary.netRevenue).toBe(95000);
    expect(dashboard.warnings).toHaveLength(0);
    expect(dashboard.basePath).toBe("/dashboard/enterprise/reports");
  });

  it("adds estimation warnings when labor and food cost are unknown", () => {
    const dashboard = buildCorporateReportingDashboard({
      workspaceId: "ws-1",
      current: executive(),
      previous: executive({ netRevenue: 90000 }),
      forecast: forecast(),
    });
    expect(dashboard.warnings.some((w) => w.includes("Food cost estimated"))).toBe(true);
    expect(dashboard.warnings.some((w) => w.includes("Labor estimated"))).toBe(true);
  });
});
