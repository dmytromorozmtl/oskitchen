/**
 * O1 — Causal forest lifts (region × segment) from BQ experiment_causal_lift_daily.
 * Auto-tunes geoHoldoutPercent; synthetic control for long-run measurement.
 */

import { readHierarchicalBayesianPrior } from "@/lib/storefront/theme-experiment-bayesian-hierarchical";
import { toJsonValue } from "@/lib/prisma/json";
import { isHierarchicalBayesianEnabled } from "@/lib/storefront/theme-experiment-bayesian-hierarchical";

export type CausalForestCell = {
  region: string;
  segment: string;
  armId: string;
  liftPp: number;
  exposures: number;
  syntheticWeight: number;
};

export type CausalLiftDailySnapshot = {
  at: string;
  cells: CausalForestCell[];
  globalLiftPp: number;
  recommendedHoldoutPercent: number;
  syntheticControlLiftPp: number;
  alignedWithHierarchical: boolean;
};

export function isCausalForestEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CAUSAL_FOREST === "1";
}

export function readCausalLiftDaily(raw: unknown): CausalLiftDailySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).causalLiftDaily;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const snap = o as Record<string, unknown>;
  if (typeof snap.at !== "string" || !Array.isArray(snap.cells)) return null;
  return {
    at: snap.at,
    cells: snap.cells as CausalForestCell[],
    globalLiftPp: typeof snap.globalLiftPp === "number" ? snap.globalLiftPp : 0,
    recommendedHoldoutPercent:
      typeof snap.recommendedHoldoutPercent === "number" ? snap.recommendedHoldoutPercent : 5,
    syntheticControlLiftPp:
      typeof snap.syntheticControlLiftPp === "number" ? snap.syntheticControlLiftPp : 0,
    alignedWithHierarchical: snap.alignedWithHierarchical === true,
  };
}

/** Weighted synthetic control lift across region×segment cells. */
export function computeSyntheticControlLift(cells: CausalForestCell[]): number {
  let num = 0;
  let den = 0;
  for (const c of cells) {
    const w = c.syntheticWeight > 0 ? c.syntheticWeight : c.exposures;
    num += c.liftPp * w;
    den += w;
  }
  return den > 0 ? Math.round((num / den) * 10) / 10 : 0;
}

export function recommendGeoHoldoutPercent(cells: CausalForestCell[]): number {
  if (cells.length === 0) return 5;
  const avgLift = computeSyntheticControlLift(cells);
  if (avgLift >= 5) return Math.min(15, 8);
  if (avgLift >= 2) return 5;
  return 3;
}

export function evaluateCausalForestPublishGate(input: {
  themeExperimentJson: unknown;
  globalLiftPp: number;
}): {
  passed: boolean;
  headline: string;
  detail: string;
  geoHoldoutPercent: number;
} {
  if (!isCausalForestEnabled()) {
    return {
      passed: true,
      headline: "Causal forest off",
      detail: "Set THEME_EXPERIMENT_CAUSAL_FOREST=1 for geo holdout automation.",
      geoHoldoutPercent: 0,
    };
  }

  const snap = readCausalLiftDaily(input.themeExperimentJson);
  if (!snap) {
    return {
      passed: true,
      headline: "Awaiting causal lift batch",
      detail: "No causalLiftDaily in JSON yet.",
      geoHoldoutPercent: 0,
    };
  }

  const hier = isHierarchicalBayesianEnabled()
    ? readHierarchicalBayesianPrior(input.themeExperimentJson)
    : null;
  const hierLift = hier?.liftPp ?? input.globalLiftPp;
  const delta = Math.abs(snap.syntheticControlLiftPp - hierLift);
  const aligned = delta <= Number(process.env.THEME_EXPERIMENT_CAUSAL_ALIGN_PP ?? "3");
  const passed = aligned && snap.globalLiftPp >= 0;

  return {
    passed,
    headline: passed
      ? `Causal forest aligned (Δ${delta}pp vs hierarchical)`
      : `Causal/geo mismatch (Δ${delta}pp)`,
    detail: `Synthetic control ${snap.syntheticControlLiftPp}pp · global ${snap.globalLiftPp}pp · holdout ${snap.recommendedHoldoutPercent}%.`,
    geoHoldoutPercent: snap.recommendedHoldoutPercent,
  };
}

export function mergeCausalLiftDailyIntoJson(
  previousRaw: unknown,
  snap: CausalLiftDailySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.causalLiftDaily = snap;
  base.postWinnerHoldoutPercent = snap.recommendedHoldoutPercent;
  return base;
}
