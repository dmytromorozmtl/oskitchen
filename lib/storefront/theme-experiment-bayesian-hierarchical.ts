import type { BayesianPriorSnapshot } from "@/lib/storefront/theme-experiment-bayesian-prior";
import { toJsonValue } from "@/lib/prisma/json";
import { readBayesianPriorSnapshot } from "@/lib/storefront/theme-experiment-bayesian-prior";
import type { BayesianDecision } from "@/lib/storefront/theme-experiment-bayesian";
import { evaluateBayesianFromBqPrior } from "@/lib/storefront/theme-experiment-bayesian";

export type BayesianMetricId = "conversion" | "revenue" | "aov";

export type BayesianPriorMetricPosterior = {
  metricId: BayesianMetricId;
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

export type HierarchicalBayesianPrior = BayesianPriorSnapshot & {
  hierarchical: true;
  metrics: BayesianPriorMetricPosterior[];
  allMetricsPass: boolean;
};

export function isHierarchicalBayesianEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_BAYESIAN_HIERARCHICAL === "1";
}

export function readHierarchicalBayesianPrior(raw: unknown): HierarchicalBayesianPrior | null {
  const base = readBayesianPriorSnapshot(raw);
  if (!base) return null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const snap = (raw as Record<string, unknown>).bayesianPrior;
  if (!snap || typeof snap !== "object" || Array.isArray(snap)) return null;
  const o = snap as Record<string, unknown>;
  if (!Array.isArray(o.metrics) || o.metrics.length === 0) return null;

  const metrics = o.metrics as BayesianPriorMetricPosterior[];
  const probThreshold = Number(process.env.THEME_EXPERIMENT_BAYESIAN_PROB_THRESHOLD ?? "0.95") * 100;
  const allMetricsPass = metrics.every(
    (m) => m.probLiftAboveThreshold >= probThreshold && m.bestArmId !== m.controlArmId,
  );

  return {
    ...base,
    hierarchical: true,
    metrics,
    allMetricsPass,
  };
}

/** Multi-metric recommendPublish: all gates must pass when hierarchical mode is on. */
export function evaluateHierarchicalBayesianDecision(
  prior: HierarchicalBayesianPrior,
  options?: { probThreshold?: number },
): BayesianDecision {
  const base = evaluateBayesianFromBqPrior(prior, options);
  const probThreshold = (options?.probThreshold ?? 0.95) * 100;

  const metricLines = prior.metrics.map(
    (m) =>
      `${m.metricId}: P(win)=${m.probWinning}% P(lift>${prior.thresholdPp}pp)=${m.probLiftAboveThreshold}%`,
  );

  const recommendPublish = base.recommendPublish && prior.allMetricsPass;

  return {
    ...base,
    recommendPublish,
    headline: recommendPublish
      ? `Hierarchical Bayes: publish ${prior.bestArmId} (all ${prior.metrics.length} metrics pass)`
      : `Hierarchical Bayes: waiting (${prior.metrics.filter((m) => m.probLiftAboveThreshold < probThreshold).length} metrics below threshold)`,
    detail: `${base.detail} Metrics: ${metricLines.join("; ")}.`,
  };
}

export function resolveHierarchicalOrFlatBayesian(
  themeExperimentJson: unknown,
  options?: { probThreshold?: number },
): BayesianDecision | null {
  if (!isHierarchicalBayesianEnabled()) return null;
  const hier = readHierarchicalBayesianPrior(themeExperimentJson);
  if (!hier) return null;
  return evaluateHierarchicalBayesianDecision(hier, options);
}
