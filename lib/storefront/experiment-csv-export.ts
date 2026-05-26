import type { ExperimentDailyChartRow } from "@/services/storefront/theme-experiment-analytics-service";

export function buildExperimentSeriesCsv(rows: ExperimentDailyChartRow[]): string {
  const header = [
    "date",
    "published_exposures",
    "published_checkouts",
    "published_conversions",
    "published_conversion_rate_percent",
    "draft_exposures",
    "draft_checkouts",
    "draft_conversions",
    "draft_conversion_rate_percent",
  ].join(",");

  const lines = rows.map((r) =>
    [
      r.date,
      r.published.exposures,
      r.published.checkouts,
      r.published.conversions,
      r.published.conversionRatePercent,
      r.draft.exposures,
      r.draft.checkouts,
      r.draft.conversions,
      r.draft.conversionRatePercent,
    ].join(","),
  );

  return [header, ...lines].join("\n");
}
