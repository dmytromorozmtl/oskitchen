import type { ExperimentProdDecision } from "@/lib/storefront/theme-experiment-decision";
import type { ExperimentSrmCheck } from "@/lib/storefront/theme-experiment-srm";
import type { Ga4ParityScore } from "@/lib/storefront/ga4-parity-score";

export type ExperimentFeatureVector = {
  liftPp: number;
  sampleSizeOk: boolean;
  srmDeltaPp: number;
  parityScorePp: number | null;
  edgeSynced: boolean;
  daysRunning: number;
  armImbalance: number;
};

export type MlRiskScore = {
  score: number;
  threshold: number;
  blocked: boolean;
  headline: string;
  detail: string;
  features: ExperimentFeatureVector;
};

export function buildExperimentFeatureVector(input: {
  decision: ExperimentProdDecision;
  srm: ExperimentSrmCheck;
  parity: Ga4ParityScore;
  edgeSynced: boolean;
  experimentStartedAt?: string | null;
}): ExperimentFeatureVector {
  const started = input.experimentStartedAt
    ? new Date(input.experimentStartedAt).getTime()
    : Date.now() - 7 * 86400000;
  const daysRunning = Math.max(1, Math.floor((Date.now() - started) / 86400000));

  return {
    liftPp: input.decision.liftPp,
    sampleSizeOk: input.decision.sampleSizeOk,
    srmDeltaPp: Math.abs(input.srm.deltaPp ?? 0),
    parityScorePp: input.parity.parityScorePp,
    edgeSynced: input.edgeSynced,
    daysRunning,
    armImbalance: Math.abs(input.srm.deltaPp ?? 0),
  };
}

/**
 * Heuristic risk scorer (Phase L5 v1) — blocks auto-conclude when predicted regret risk is high.
 * Nightly BQ feature store can replace weights via env.
 */
export function computeExperimentConcludeRiskScore(
  features: ExperimentFeatureVector,
): MlRiskScore {
  const threshold = Number(process.env.THEME_EXPERIMENT_ML_RISK_THRESHOLD ?? "65");
  let score = 0;

  if (!features.sampleSizeOk) score += 35;
  if (features.liftPp < 2) score += 20;
  if (features.srmDeltaPp > 3) score += 25;
  if (features.parityScorePp !== null && features.parityScorePp > 3) score += 15;
  if (!features.edgeSynced) score += 20;
  if (features.daysRunning < 7) score += 10;

  score = Math.min(100, score);
  const blocked = process.env.THEME_EXPERIMENT_ML_RISK === "1" && score >= threshold;

  return {
    score,
    threshold,
    blocked,
    features,
    headline: blocked ? `High conclude risk (${score}/${threshold})` : `Risk OK (${score}/${threshold})`,
    detail: blocked
      ? "ML guard blocked auto-conclude — review Advanced before applying winner."
      : "Feature vector within acceptable bounds for automated conclude.",
  };
}
