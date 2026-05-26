import { buildProductionForecast } from "@/services/forecasting/production-forecast";

export { buildProductionForecast };

/** Deterministic demand view — confidence stays explicit in `ProductionForecastResult`. */
export async function buildDemandForecastFromHistory(params: Parameters<typeof buildProductionForecast>[0]) {
  return buildProductionForecast(params);
}
