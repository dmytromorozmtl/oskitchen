import type { FORECASTING_2_POLICY_ID } from "@/lib/ai/forecasting-policy";

export type Forecasting2AdjustmentKind = "baseline" | "weather" | "holiday" | "weekend";

export type Forecasting2DailyPoint = {
  dateIso: string;
  baselineOrders: number;
  adjustedOrders: number;
  baselineRevenueUsd: number;
  adjustedRevenueUsd: number;
  weatherLabel: string;
  holidayLabel: string | null;
  combinedMultiplier: number;
};

export type Forecasting2HolidayWindow = {
  label: string;
  startIso: string;
  endIso: string;
  boost: number;
};

export type Forecasting2Snapshot = {
  policyId: typeof FORECASTING_2_POLICY_ID;
  generatedAtIso: string;
  horizonDays: number;
  historyDays: number;
  dailyForecast: Forecasting2DailyPoint[];
  upcomingHolidays: Forecasting2HolidayWindow[];
  summary: {
    avgDailyOrders: number;
    projectedTotalOrders: number;
    projectedTotalRevenueUsd: number;
    weatherUpliftDays: number;
    holidayUpliftDays: number;
    confidence: "low" | "medium" | "high";
    warning: string | null;
  };
  basePath: string;
};
