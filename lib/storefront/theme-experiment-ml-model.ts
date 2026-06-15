import type { ExperimentFeatureVector } from "@/lib/storefront/theme-experiment-ml-risk";
import { toJsonValue } from "@/lib/prisma/json";
import { computeExperimentConcludeRiskScore, type MlRiskScore } from "@/lib/storefront/theme-experiment-ml-risk";

export type FeatureStoreHistoryPoint = {
  at: string;
  features: ExperimentFeatureVector;
  outcome?: "concluded" | "blocked" | "running";
};

export type MlModelWeights = {
  at: string;
  intercept: number;
  weights: {
    liftPp: number;
    sampleSizeOk: number;
    srmDeltaPp: number;
    parityScorePp: number;
    edgeSynced: number;
    daysRunning: number;
  };
};

const DEFAULT_WEIGHTS: MlModelWeights = {
  at: new Date(0).toISOString(),
  intercept: 10,
  weights: {
    liftPp: -2.5,
    sampleSizeOk: -25,
    srmDeltaPp: 3,
    parityScorePp: 2,
    edgeSynced: -15,
    daysRunning: -0.5,
  },
};

export function readMlModelWeights(raw: unknown): MlModelWeights {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_WEIGHTS;
  const w = (raw as Record<string, unknown>).mlRegretModel;
  if (!w || typeof w !== "object" || Array.isArray(w)) return DEFAULT_WEIGHTS;
  const o = w as Record<string, unknown>;
  const weights = o.weights as MlModelWeights["weights"] | undefined;
  if (!weights) return DEFAULT_WEIGHTS;
  return {
    at: typeof o.at === "string" ? o.at : new Date().toISOString(),
    intercept: typeof o.intercept === "number" ? o.intercept : DEFAULT_WEIGHTS.intercept,
    weights: { ...DEFAULT_WEIGHTS.weights, ...weights },
  };
}

export function readFeatureStoreHistory(raw: unknown): FeatureStoreHistoryPoint[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const hist = (raw as Record<string, unknown>).featureStoreHistory;
  if (!Array.isArray(hist)) return [];
  return hist.slice(-90) as FeatureStoreHistoryPoint[];
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** Logistic-style regret probability 0–100 from trained weights. */
export function scoreRegretWithModel(
  features: ExperimentFeatureVector,
  model: MlModelWeights,
): number {
  const w = model.weights;
  const z =
    model.intercept +
    w.liftPp * features.liftPp +
    w.sampleSizeOk * (features.sampleSizeOk ? 0 : 1) +
    w.srmDeltaPp * features.srmDeltaPp +
    w.parityScorePp * (features.parityScorePp ?? 0) +
    w.edgeSynced * (features.edgeSynced ? 0 : 1) +
    w.daysRunning * features.daysRunning;
  return Math.round(sigmoid(z / 20) * 100);
}

/** Train weights from history (online logistic regression approximation). */
export function trainMlRegretWeightsFromHistory(
  history: FeatureStoreHistoryPoint[],
): MlModelWeights {
  if (history.length < 5) return DEFAULT_WEIGHTS;

  let intercept = DEFAULT_WEIGHTS.intercept;
  const weights = { ...DEFAULT_WEIGHTS.weights };

  for (const point of history) {
    const y = point.outcome === "blocked" ? 1 : 0;
    const f = point.features;
    const pred = sigmoid(
      (intercept +
        weights.liftPp * f.liftPp +
        weights.sampleSizeOk * (f.sampleSizeOk ? 0 : 1) +
        weights.srmDeltaPp * f.srmDeltaPp) /
        20,
    );
    const err = y - pred;
    const lr = 0.05;
    intercept += lr * err * 20;
    weights.liftPp += lr * err * f.liftPp;
    weights.srmDeltaPp += lr * err * f.srmDeltaPp;
  }

  return {
    at: new Date().toISOString(),
    intercept,
    weights,
  };
}

export function computeMlRiskWithShadow(input: {
  features: ExperimentFeatureVector;
  themeExperimentJson?: unknown;
}): MlRiskScore & { shadow?: { heuristic: number; model: number; modelBlocked: boolean } } {
  const heuristic = computeExperimentConcludeRiskScore(input.features);
  const modelWeights = readMlModelWeights(input.themeExperimentJson);
  const modelScore = scoreRegretWithModel(input.features, modelWeights);
  const threshold = heuristic.threshold;
  const modelBlocked =
    process.env.THEME_EXPERIMENT_ML_MODEL === "1" && modelScore >= threshold;

  const useModel = process.env.THEME_EXPERIMENT_ML_MODEL === "1";
  const shadow = process.env.THEME_EXPERIMENT_ML_SHADOW === "1";

  const primary = useModel
    ? {
        score: modelScore,
        threshold,
        blocked: modelBlocked,
        features: input.features,
        headline: modelBlocked
          ? `Model regret risk ${modelScore}/${threshold}`
          : `Model risk OK (${modelScore}/${threshold})`,
        detail: modelBlocked
          ? "Trained logistic guard blocked auto-conclude."
          : "Model score within bounds.",
      }
    : heuristic;

  if (!shadow) return primary;

  return {
    ...primary,
    shadow: {
      heuristic: heuristic.score,
      model: modelScore,
      modelBlocked,
    },
  };
}
