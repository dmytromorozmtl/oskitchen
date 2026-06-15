import { addDays, isWithinInterval } from "date-fns";

import {
  inferWeatherFromDate,
  localEventMultiplier,
  weatherMultiplier,
} from "@/lib/ai/dynamic-pricing-builders";
import {
  FORECASTING_2_HORIZON_DAYS,
  FORECASTING_2_MIN_HISTORY_DAYS,
  FORECASTING_2_PATH,
  FORECASTING_2_POLICY_ID,
} from "@/lib/ai/forecasting-policy";
import type {
  Forecasting2DailyPoint,
  Forecasting2HolidayWindow,
  Forecasting2Snapshot,
} from "@/lib/ai/forecasting-types";
import { movingAverage } from "@/lib/analytics/forecasting";

type HolidayRule = {
  mmdd: string;
  label: string;
  boost: number;
  windowDays: number;
};

const HOLIDAY_RULES: HolidayRule[] = [
  { mmdd: "01-01", label: "New Year", boost: 1.12, windowDays: 2 },
  { mmdd: "02-14", label: "Valentine's Day", boost: 1.15, windowDays: 3 },
  { mmdd: "05-12", label: "Mother's Day", boost: 1.1, windowDays: 2 },
  { mmdd: "07-04", label: "Independence Day", boost: 1.14, windowDays: 3 },
  { mmdd: "11-28", label: "Thanksgiving week", boost: 1.22, windowDays: 5 },
  { mmdd: "12-25", label: "Christmas", boost: 1.2, windowDays: 5 },
  { mmdd: "12-31", label: "New Year's Eve", boost: 1.16, windowDays: 2 },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function holidayMultiplierForDate(date: Date): { multiplier: number; label: string | null } {
  for (const rule of HOLIDAY_RULES) {
    const [mm, dd] = rule.mmdd.split("-").map(Number);
    const holiday = new Date(date.getFullYear(), mm - 1, dd);
    const windowStart = addDays(holiday, -rule.windowDays);
    const windowEnd = addDays(holiday, rule.windowDays);
    if (isWithinInterval(date, { start: windowStart, end: windowEnd })) {
      return { multiplier: rule.boost, label: rule.label };
    }
  }
  const local = localEventMultiplier(date);
  if (local) return { multiplier: local.multiplier, label: local.label };
  return { multiplier: 1, label: null };
}

export function listUpcomingHolidayWindows(
  start: Date,
  horizonDays: number,
): Forecasting2HolidayWindow[] {
  const end = addDays(start, horizonDays);
  const windows: Forecasting2HolidayWindow[] = [];

  for (const rule of HOLIDAY_RULES) {
    const [mm, dd] = rule.mmdd.split("-").map(Number);
    const holiday = new Date(start.getFullYear(), mm - 1, dd);
    const windowStart = addDays(holiday, -rule.windowDays);
    const windowEnd = addDays(holiday, rule.windowDays);
    if (windowEnd < start || windowStart > end) continue;
    windows.push({
      label: rule.label,
      startIso: windowStart.toISOString().slice(0, 10),
      endIso: windowEnd.toISOString().slice(0, 10),
      boost: rule.boost,
    });
  }

  return windows.sort((a, b) => a.startIso.localeCompare(b.startIso));
}

export function buildForecasting2DailyPoint(input: {
  date: Date;
  baselineOrders: number;
  baselineRevenueUsd: number;
}): Forecasting2DailyPoint {
  const weather = inferWeatherFromDate(input.date);
  const wx = weatherMultiplier(weather);
  const holiday = holidayMultiplierForDate(input.date);
  const combinedMultiplier = round2(wx.multiplier * holiday.multiplier);

  return {
    dateIso: input.date.toISOString().slice(0, 10),
    baselineOrders: round2(input.baselineOrders),
    adjustedOrders: round2(input.baselineOrders * combinedMultiplier),
    baselineRevenueUsd: round2(input.baselineRevenueUsd),
    adjustedRevenueUsd: round2(input.baselineRevenueUsd * combinedMultiplier),
    weatherLabel: wx.label,
    holidayLabel: holiday.label,
    combinedMultiplier,
  };
}

export function buildForecasting2Series(input: {
  history: Array<{ dateIso: string; orders: number; revenueUsd: number }>;
  horizonDays?: number;
  analyzedAt?: Date;
}): {
  dailyForecast: Forecasting2DailyPoint[];
  upcomingHolidays: Forecasting2HolidayWindow[];
  summary: Forecasting2Snapshot["summary"];
} {
  const horizon = input.horizonDays ?? FORECASTING_2_HORIZON_DAYS;
  const analyzedAt = input.analyzedAt ?? new Date();

  const orderSeries = input.history.map((row) => ({
    date: row.dateIso,
    value: row.orders,
  }));
  const revenueSeries = input.history.map((row) => ({
    date: row.dateIso,
    value: row.revenueUsd,
  }));

  const orderMa = movingAverage(orderSeries, horizon, 14);
  const revenueMa = movingAverage(revenueSeries, horizon, 14);

  if (!orderMa || !revenueMa) {
    return {
      dailyForecast: [],
      upcomingHolidays: listUpcomingHolidayWindows(analyzedAt, horizon),
      summary: {
        avgDailyOrders: 0,
        projectedTotalOrders: 0,
        projectedTotalRevenueUsd: 0,
        weatherUpliftDays: 0,
        holidayUpliftDays: 0,
        confidence: "low",
        warning: `Need at least ${FORECASTING_2_MIN_HISTORY_DAYS} days of order history.`,
      },
    };
  }

  const dailyForecast = orderMa.forecast.map((orderPoint, index) => {
    const revenuePoint = revenueMa.forecast[index];
    return buildForecasting2DailyPoint({
      date: new Date(orderPoint.date),
      baselineOrders: orderPoint.value,
      baselineRevenueUsd: revenuePoint?.value ?? 0,
    });
  });

  const weatherUpliftDays = dailyForecast.filter((row) => row.combinedMultiplier > 1.01 && !row.holidayLabel).length;
  const holidayUpliftDays = dailyForecast.filter((row) => row.holidayLabel != null).length;

  const projectedTotalOrders = round2(
    dailyForecast.reduce((sum, row) => sum + row.adjustedOrders, 0),
  );
  const projectedTotalRevenueUsd = round2(
    dailyForecast.reduce((sum, row) => sum + row.adjustedRevenueUsd, 0),
  );
  const avgDailyOrders = round2(projectedTotalOrders / Math.max(1, dailyForecast.length));

  const confidence =
    input.history.length >= 60 ? "high" : input.history.length >= 21 ? "medium" : "low";

  return {
    dailyForecast,
    upcomingHolidays: listUpcomingHolidayWindows(analyzedAt, horizon),
    summary: {
      avgDailyOrders,
      projectedTotalOrders,
      projectedTotalRevenueUsd,
      weatherUpliftDays,
      holidayUpliftDays,
      confidence,
      warning: orderMa.warning ?? null,
    },
  };
}

export function buildForecasting2Snapshot(input: {
  historyDays: number;
  history: Array<{ dateIso: string; orders: number; revenueUsd: number }>;
  horizonDays?: number;
  analyzedAt?: Date;
}): Forecasting2Snapshot {
  const built = buildForecasting2Series({
    history: input.history,
    horizonDays: input.horizonDays,
    analyzedAt: input.analyzedAt,
  });

  return {
    policyId: FORECASTING_2_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    horizonDays: input.horizonDays ?? FORECASTING_2_HORIZON_DAYS,
    historyDays: input.historyDays,
    dailyForecast: built.dailyForecast,
    upcomingHolidays: built.upcomingHolidays,
    summary: built.summary,
    basePath: FORECASTING_2_PATH,
  };
}
