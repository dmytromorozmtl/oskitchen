import { readGa4ParityBqSnapshot } from "@/lib/storefront/ga4-parity-json";
import type { ExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";

export type CupedContext = {
  prePeriodPublishedRate: number | null;
  prePeriodDraftRate: number | null;
  source: "bq" | "simplified" | "none";
};

/** Read pre-period covariate from BQ parity snapshot when available. */
export function readCupedPrePeriodFromBq(themeExperimentJson: unknown): CupedContext {
  const snap = readGa4ParityBqSnapshot(themeExperimentJson);
  if (!snap) {
    return { prePeriodPublishedRate: null, prePeriodDraftRate: null, source: "none" };
  }
  const prePeriodPublishedRate = Math.max(0, snap.firstPartyLiftPp);
  const prePeriodDraftRate = Math.max(0, snap.ga4LiftPp);
  return {
    prePeriodPublishedRate,
    prePeriodDraftRate,
    source: "bq",
  };
}

/**
 * CUPED adjustment: BQ pre-period covariate when THEME_EXPERIMENT_CUPED_V2=1,
 * otherwise simplified checkout-rate shrinkage.
 */
export function applyCupedToArmMetrics(
  rows: ExperimentArmMetrics[],
  themeExperimentJson?: unknown,
): ExperimentArmMetrics[] {
  if (rows.length < 2) return rows;

  if (process.env.THEME_EXPERIMENT_CUPED_V2 === "1" && themeExperimentJson) {
    const ctx = readCupedPrePeriodFromBq(themeExperimentJson);
    if (ctx.source === "bq" && ctx.prePeriodPublishedRate !== null) {
      const theta = 0.35;
      return rows.map((r) => {
        const pre =
          r.arm === "published" ? ctx.prePeriodPublishedRate! : ctx.prePeriodDraftRate ?? ctx.prePeriodPublishedRate!;
        const adjusted = r.conversionRatePercent + theta * (pre - r.conversionRatePercent);
        return {
          ...r,
          conversionRatePercent: Math.round(Math.max(0, Math.min(100, adjusted)) * 10) / 10,
        };
      });
    }
  }

  const rates = rows.map((r) => (r.checkouts > 0 ? r.conversionRatePercent : 0));
  const meanCov = rates.reduce((s, v) => s + v, 0) / rates.length;

  return rows.map((r) => {
    const adjustedRate = Math.max(
      0,
      Math.min(100, r.conversionRatePercent + 0.15 * (meanCov - r.conversionRatePercent)),
    );
    return {
      ...r,
      conversionRatePercent: Math.round(adjustedRate * 10) / 10,
    };
  });
}

export function isCupedDecisionEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CUPED === "1" || process.env.THEME_EXPERIMENT_CUPED_V2 === "1";
}
