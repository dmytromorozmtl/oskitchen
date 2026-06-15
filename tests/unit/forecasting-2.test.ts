import { describe, expect, it } from "vitest";

import {
  buildForecasting2DailyPoint,
  buildForecasting2Series,
  buildForecasting2Snapshot,
  holidayMultiplierForDate,
  listUpcomingHolidayWindows,
} from "@/lib/ai/forecasting-builders";
import {
  FORECASTING_2_HISTORY_DAYS,
  FORECASTING_2_HORIZON_DAYS,
  FORECASTING_2_PATH,
  FORECASTING_2_POLICY_ID,
  FORECASTING_2_SERVICE,
} from "@/lib/ai/forecasting-policy";

describe("Forecasting 2.0", () => {
  it("locks policy constants", () => {
    expect(FORECASTING_2_POLICY_ID).toBe("forecasting-2-v1");
    expect(FORECASTING_2_SERVICE).toBe("services/ai/forecasting.ts");
    expect(FORECASTING_2_PATH).toBe("/dashboard/forecast/forecasting-2");
    expect(FORECASTING_2_HORIZON_DAYS).toBe(90);
    expect(FORECASTING_2_HISTORY_DAYS).toBe(90);
  });

  it("detects Valentine's Day holiday multiplier", () => {
    const result = holidayMultiplierForDate(new Date("2026-02-14T12:00:00Z"));
    expect(result.label).toBe("Valentine's Day");
    expect(result.multiplier).toBeGreaterThan(1);
  });

  it("builds daily point with weather and holiday labels", () => {
    const point = buildForecasting2DailyPoint({
      date: new Date("2026-02-14T12:00:00Z"),
      baselineOrders: 40,
      baselineRevenueUsd: 1200,
    });
    expect(point.baselineOrders).toBe(40);
    expect(point.adjustedOrders).toBeGreaterThan(40);
    expect(point.holidayLabel).toBe("Valentine's Day");
    expect(point.weatherLabel.length).toBeGreaterThan(0);
  });

  it("builds 90-day series from history", () => {
    const history = Array.from({ length: 30 }, (_, index) => ({
      dateIso: `2026-01-${String(index + 1).padStart(2, "0")}`,
      orders: 20 + (index % 5),
      revenueUsd: 600 + index * 10,
    }));

    const built = buildForecasting2Series({ history, horizonDays: 90 });
    expect(built.dailyForecast).toHaveLength(90);
    expect(built.summary.projectedTotalOrders).toBeGreaterThan(0);
    expect(built.summary.confidence).toBe("medium");
  });

  it("assembles forecasting snapshot", () => {
    const history = Array.from({ length: 14 }, (_, index) => ({
      dateIso: `2026-05-${String(index + 1).padStart(2, "0")}`,
      orders: 25,
      revenueUsd: 750,
    }));

    const snapshot = buildForecasting2Snapshot({
      historyDays: 90,
      history,
      horizonDays: 30,
    });

    expect(snapshot.policyId).toBe(FORECASTING_2_POLICY_ID);
    expect(snapshot.basePath).toBe(FORECASTING_2_PATH);
    expect(snapshot.dailyForecast).toHaveLength(30);
    expect(listUpcomingHolidayWindows(new Date("2026-06-01"), 90).length).toBeGreaterThan(0);
  });
});
