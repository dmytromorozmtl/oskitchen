import {
  buildDeepLaborForecast,
  buildDeepLaborForecastFromAvgShiftHours,
  type DeepLaborForecast,
} from "@/lib/labor/labor-forecasting-ai-p2-66-builder";

export type LaborForecastResult = DeepLaborForecast;

export { buildDeepLaborForecast, buildDeepLaborForecastFromAvgShiftHours };
export type { DeepLaborForecast };

/** Backward-compatible entry — delegates to deep scheduling AI builder. */
export function buildLaborForecastStub(params: {
  recentShiftHoursAvg: number;
  horizonDays?: number;
}): LaborForecastResult {
  return buildDeepLaborForecastFromAvgShiftHours(params);
}
