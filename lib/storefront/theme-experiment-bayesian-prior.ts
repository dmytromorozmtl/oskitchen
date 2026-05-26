import { toJsonValue } from "@/lib/prisma/json";
/**
 * BQ / PyMC batch posterior — stored in themeExperimentJson.bayesianPrior.
 * Nightly: POST /api/webhooks/bigquery-bayesian-prior
 */

export type BayesianPriorArm = {
  armId: string;
  alpha: number;
  beta: number;
  meanRate: number;
  ciLow: number;
  ciHigh: number;
};

export type BayesianPriorMetric = {
  metricId: "conversion" | "revenue" | "aov";
  controlArmId: string;
  bestArmId: string;
  liftPp: number;
  probWinning: number;
  probLiftAboveThreshold: number;
  meanControl: number;
  meanTreatment: number;
  ciLow: number;
  ciHigh: number;
};

export type BayesianPriorSnapshot = {
  at: string;
  source: "bq" | "pymc" | "stan" | "pymc_gpu";
  controlArmId: string;
  bestArmId: string;
  liftPp: number;
  probLiftAboveThreshold: number;
  thresholdPp: number;
  arms: BayesianPriorArm[];
  /** N1: joint multi-metric posterior from experiment_posterior_daily */
  metrics?: BayesianPriorMetric[];
  hierarchical?: boolean;
};

export function readBayesianPriorSnapshot(raw: unknown): BayesianPriorSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const snap = (raw as Record<string, unknown>).bayesianPrior;
  if (!snap || typeof snap !== "object" || Array.isArray(snap)) return null;
  const o = snap as Record<string, unknown>;
  if (typeof o.at !== "string" || !Array.isArray(o.arms)) return null;
  return {
    at: o.at,
    source:
      o.source === "stan" || o.source === "pymc" || o.source === "pymc_gpu"
        ? (o.source as BayesianPriorSnapshot["source"])
        : "bq",
    controlArmId: typeof o.controlArmId === "string" ? o.controlArmId : "published",
    bestArmId: typeof o.bestArmId === "string" ? o.bestArmId : "draft",
    liftPp: typeof o.liftPp === "number" ? o.liftPp : 0,
    probLiftAboveThreshold:
      typeof o.probLiftAboveThreshold === "number" ? o.probLiftAboveThreshold : 0,
    thresholdPp: typeof o.thresholdPp === "number" ? o.thresholdPp : 2,
    arms: o.arms as BayesianPriorArm[],
    metrics: Array.isArray(o.metrics) ? (o.metrics as BayesianPriorMetric[]) : undefined,
    hierarchical: o.hierarchical === true,
  };
}

export function isBayesianBqPrimaryEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_BAYESIAN_BQ_PRIMARY !== "0";
}

export function bayesianPriorMaxAgeMs(): number {
  const hours = Number(process.env.BAYESIAN_PRIOR_MAX_AGE_HOURS ?? "48");
  return Math.max(1, hours) * 60 * 60 * 1000;
}

export function isBayesianPriorFresh(snap: BayesianPriorSnapshot | null): boolean {
  if (!snap) return false;
  return Date.now() - new Date(snap.at).getTime() < bayesianPriorMaxAgeMs();
}

export function mergeBayesianPriorIntoJson(
  previousRaw: unknown,
  snap: BayesianPriorSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.bayesianPrior = snap;
  return base;
}
