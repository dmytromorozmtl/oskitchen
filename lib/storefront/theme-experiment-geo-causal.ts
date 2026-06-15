/**
 * Geo / market causal adjustment (CausalImpact-style simplified).
 * When `geoMarkets` present in themeExperimentJson, reweights arms by market exposure.
 */

export type GeoMarketExposure = {
  market: string;
  armId: string;
  exposures: number;
  conversions: number;
};

export type GeoCausalAdjustment = {
  enabled: boolean;
  markets: string[];
  adjustedLiftPp: number;
  headline: string;
  detail: string;
};

export function readGeoMarkets(raw: unknown): GeoMarketExposure[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const list = (raw as Record<string, unknown>).geoMarkets;
  if (!Array.isArray(list)) return [];
  return list
    .map((item): GeoMarketExposure | null => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const o = item as Record<string, unknown>;
      if (typeof o.market !== "string" || typeof o.armId !== "string") return null;
      return {
        market: o.market,
        armId: o.armId,
        exposures: typeof o.exposures === "number" ? o.exposures : 0,
        conversions: typeof o.conversions === "number" ? o.conversions : 0,
      };
    })
    .filter((g): g is GeoMarketExposure => g !== null);
}

/** Simplified counterfactual: compare treatment markets vs synthetic control from published markets. */
export function evaluateGeoCausalLift(
  markets: GeoMarketExposure[],
  controlArmId = "published",
): GeoCausalAdjustment {
  if (markets.length === 0 || process.env.THEME_EXPERIMENT_GEO_CAUSAL !== "1") {
    return {
      enabled: false,
      markets: [],
      adjustedLiftPp: 0,
      headline: "Geo causal off",
      detail: "Set THEME_EXPERIMENT_GEO_CAUSAL=1 and populate geoMarkets in experiment JSON.",
    };
  }

  const byMarket = new Map<string, GeoMarketExposure[]>();
  for (const m of markets) {
    const arr = byMarket.get(m.market) ?? [];
    arr.push(m);
    byMarket.set(m.market, arr);
  }

  let controlRate = 0;
  let treatmentRate = 0;
  let controlN = 0;
  let treatmentN = 0;

  for (const rows of byMarket.values()) {
    const control = rows.find((r) => r.armId === controlArmId);
    const treatment = rows.find((r) => r.armId !== controlArmId);
    if (!control || !treatment) continue;
    controlN += control.exposures;
    treatmentN += treatment.exposures;
    if (control.exposures > 0) controlRate += control.conversions / control.exposures;
    if (treatment.exposures > 0) treatmentRate += treatment.conversions / treatment.exposures;
  }

  const marketsList = [...byMarket.keys()];
  const adjustedLiftPp =
    controlN > 0 && treatmentN > 0
      ? Math.round(((treatmentRate / Math.max(1, marketsList.length) - controlRate / Math.max(1, marketsList.length)) * 100) * 10) / 10
      : 0;

  return {
    enabled: true,
    markets: marketsList,
    adjustedLiftPp,
    headline: `Geo-adjusted lift ${adjustedLiftPp > 0 ? "+" : ""}${adjustedLiftPp} pp`,
    detail: `CausalImpact-style comparison across ${marketsList.length} market(s) without cookie split.`,
  };
}
