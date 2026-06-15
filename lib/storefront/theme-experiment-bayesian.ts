import {
  isBayesianBqPrimaryEnabled,
  isBayesianPriorFresh,
  readBayesianPriorSnapshot,
  type BayesianPriorSnapshot,
} from "@/lib/storefront/theme-experiment-bayesian-prior";
import { resolveHierarchicalOrFlatBayesian } from "@/lib/storefront/theme-experiment-bayesian-hierarchical";

/**
 * Conjugate Beta-Binomial posterior for conversion rate per arm.
 * Batch Bayes (PyMC/Stan → BQ) can replace priors via `bayesianPrior` in themeExperimentJson.
 */

export type BayesianArmPosterior = {
  armId: string;
  alpha: number;
  beta: number;
  meanRate: number;
  credibleIntervalLow: number;
  credibleIntervalHigh: number;
};

export type BayesianDecision = {
  enabled: boolean;
  posteriors: BayesianArmPosterior[];
  bestArmId: string;
  controlArmId: string;
  liftPp: number;
  probLiftAboveThreshold: number;
  thresholdPp: number;
  recommendPublish: boolean;
  headline: string;
  detail: string;
};

function betaQuantileApprox(mean: number, n: number, q: number): number {
  const se = Math.sqrt((mean * (1 - mean)) / Math.max(n, 1));
  const z = q < 0.5 ? -1.96 : 1.96;
  return Math.max(0, Math.min(1, mean + z * se * (q < 0.5 ? -1 : 1)));
}

function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let sum = 0;
  const steps = 200;
  const dx = x / steps;
  for (let i = 1; i <= steps; i++) {
    const t = (i - 0.5) * dx;
    sum += Math.pow(t, a - 1) * Math.pow(1 - t, b - 1) * dx;
  }
  const norm = (Math.exp(lgamma(a) + lgamma(b) - lgamma(a + b)) || 1);
  return Math.min(1, Math.max(0, sum / norm));
}

function lgamma(z: number): number {
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1;
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.984369578019571e-6,
    1.5056327351493116e-7,
  ];
  let x = c[0]!;
  for (let i = 1; i < g + 2; i++) x += c[i]! / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/** P(treatment rate - control rate > threshold), Monte Carlo from Beta posteriors. */
function probLiftAboveThreshold(input: {
  control: BayesianArmPosterior;
  treatment: BayesianArmPosterior;
  thresholdPp: number;
  samples?: number;
}): number {
  const threshold = input.thresholdPp / 100;
  const n = input.samples ?? 4000;
  let hits = 0;
  for (let i = 0; i < n; i++) {
    const tc = sampleBetaDeterministic(input.control.alpha, input.control.beta, `c${i}`);
    const tt = sampleBetaDeterministic(input.treatment.alpha, input.treatment.beta, `t${i}`);
    if (tt - tc > threshold) hits++;
  }
  return hits / n;
}

function sampleBetaDeterministic(alpha: number, beta: number, seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const u = ((h >>> 0) % 10000) / 10000;
  return regularizedIncompleteBeta(u, alpha, beta);
}

export function evaluateBayesianExperimentDecision(input: {
  arms: { armId: string; conversions: number; checkouts: number }[];
  controlArmId?: string;
  thresholdPp?: number;
  probThreshold?: number;
}): BayesianDecision {
  const enabled = process.env.THEME_EXPERIMENT_BAYESIAN === "1";
  const thresholdPp = input.thresholdPp ?? 2;
  const probThreshold = input.probThreshold ?? 0.95;
  const controlArmId = input.controlArmId ?? "published";

  const posteriors: BayesianArmPosterior[] = input.arms.map((a) => {
    const alpha = 1 + a.conversions;
    const beta = 1 + Math.max(0, a.checkouts - a.conversions);
    const meanRate = alpha / (alpha + beta);
    return {
      armId: a.armId,
      alpha,
      beta,
      meanRate,
      credibleIntervalLow: betaQuantileApprox(meanRate, a.checkouts, 0.025),
      credibleIntervalHigh: betaQuantileApprox(meanRate, a.checkouts, 0.975),
    };
  });

  const control = posteriors.find((p) => p.armId === controlArmId) ?? posteriors[0];
  const nonControl = posteriors.filter((p) => p.armId !== controlArmId);
  const best = nonControl.reduce(
    (b, p) => (p.meanRate > (b?.meanRate ?? 0) ? p : b),
    nonControl[0] ?? control,
  );

  if (!enabled || !control || !best) {
    return {
      enabled: false,
      posteriors,
      bestArmId: best?.armId ?? controlArmId,
      controlArmId,
      liftPp: 0,
      probLiftAboveThreshold: 0,
      thresholdPp,
      recommendPublish: false,
      headline: "Bayesian decision off",
      detail: "Set THEME_EXPERIMENT_BAYESIAN=1 for posterior lift.",
    };
  }

  const liftPp = Math.round((best.meanRate - control.meanRate) * 1000) / 10;
  const prob = probLiftAboveThreshold({ control, treatment: best, thresholdPp });
  const recommendPublish = prob >= probThreshold && best.armId !== controlArmId;

  return {
    enabled: true,
    posteriors,
    bestArmId: best.armId,
    controlArmId,
    liftPp,
    probLiftAboveThreshold: Math.round(prob * 1000) / 10,
    thresholdPp,
    recommendPublish,
    headline: recommendPublish
      ? `Bayesian: publish ${best.armId} (P(lift>${thresholdPp}pp)=${Math.round(prob * 100)}%)`
      : `Bayesian: not ready (P=${Math.round(prob * 100)}%, need ${Math.round(probThreshold * 100)}%)`,
    detail: `95% CI treatment [${(best.credibleIntervalLow * 100).toFixed(1)}%, ${(best.credibleIntervalHigh * 100).toFixed(1)}%] vs control mean ${(control.meanRate * 100).toFixed(1)}%.`,
  };
}

export function isBayesianDecisionEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_BAYESIAN === "1";
}

export function isBayesianBqOnlyMode(): boolean {
  return (
    process.env.THEME_EXPERIMENT_BAYESIAN_BQ_ONLY === "1" &&
    isBayesianBqPrimaryEnabled() &&
    isBayesianDecisionEnabled()
  );
}

/** Production decision from nightly BQ / PyMC posterior (no live conjugate recompute). */
export function evaluateBayesianFromBqPrior(
  prior: BayesianPriorSnapshot,
  options?: { probThreshold?: number },
): BayesianDecision {
  const probThreshold = options?.probThreshold ?? 0.95;
  const thresholdPp = prior.thresholdPp;
  const posteriors: BayesianArmPosterior[] = prior.arms.map((a) => ({
    armId: a.armId,
    alpha: a.alpha,
    beta: a.beta,
    meanRate: a.meanRate,
    credibleIntervalLow: a.ciLow,
    credibleIntervalHigh: a.ciHigh,
  }));
  const prob = prior.probLiftAboveThreshold / 100;
  const recommendPublish = prob >= probThreshold && prior.bestArmId !== prior.controlArmId;

  return {
    enabled: true,
    posteriors,
    bestArmId: prior.bestArmId,
    controlArmId: prior.controlArmId,
    liftPp: prior.liftPp,
    probLiftAboveThreshold: prior.probLiftAboveThreshold,
    thresholdPp,
    recommendPublish,
    headline: recommendPublish
      ? `BQ Bayesian: publish ${prior.bestArmId} (P(lift>${thresholdPp}pp)=${prior.probLiftAboveThreshold}%)`
      : `BQ Bayesian: not ready (P=${prior.probLiftAboveThreshold}%, source=${prior.source})`,
    detail: `Posterior from ${prior.source} batch at ${prior.at}. Decision uses BQ snapshot only.`,
  };
}

export function resolveBayesianExperimentDecision(input: {
  arms: { armId: string; conversions: number; checkouts: number }[];
  controlArmId?: string;
  thresholdPp?: number;
  probThreshold?: number;
  themeExperimentJson?: unknown;
}): BayesianDecision {
  const prior = readBayesianPriorSnapshot(input.themeExperimentJson);
  if (isBayesianBqOnlyMode() && isBayesianPriorFresh(prior)) {
    const hierarchical = resolveHierarchicalOrFlatBayesian(input.themeExperimentJson, {
      probThreshold: input.probThreshold,
    });
    if (hierarchical) return hierarchical;
    return evaluateBayesianFromBqPrior(prior!, { probThreshold: input.probThreshold });
  }
  const hierarchicalLive = resolveHierarchicalOrFlatBayesian(input.themeExperimentJson, {
    probThreshold: input.probThreshold,
  });
  if (hierarchicalLive && isBayesianPriorFresh(prior)) return hierarchicalLive;
  return evaluateBayesianExperimentDecision(input);
}
