import type { ExperimentFeatureVector } from "@/lib/storefront/theme-experiment-ml-risk";
import { toJsonValue } from "@/lib/prisma/json";
import { computeExperimentConcludeRiskScore, type MlRiskScore } from "@/lib/storefront/theme-experiment-ml-risk";
import {
  computeMlRiskWithShadow,
  readMlModelWeights,
  scoreRegretWithModel,
  type MlModelWeights,
} from "@/lib/storefront/theme-experiment-ml-model";

export type VertexMlModel = {
  version: number;
  sha256: string;
  at: string;
  provider: "vertex" | "bq";
  auc: number;
  f1: number;
  featureImportance: Record<string, number>;
  weights: MlModelWeights["weights"];
  intercept: number;
};

export type MlChampionChallenger = {
  champion: "heuristic" | "logistic" | "vertex";
  challenger: "vertex" | "logistic";
  shadowDays: number;
  consecutiveWins: number;
  promoteAt: string | null;
};

const PROMOTE_DAYS = 14;

export function isVertexMlEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_VERTEX_ML === "1";
}

export function readVertexMlModel(raw: unknown): VertexMlModel | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).mlRegretModelV2;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const m = o as Record<string, unknown>;
  if (typeof m.version !== "number" || typeof m.sha256 !== "string") return null;
  const weights = m.weights as VertexMlModel["weights"] | undefined;
  if (!weights) return null;
  return {
    version: m.version,
    sha256: m.sha256,
    at: typeof m.at === "string" ? m.at : new Date().toISOString(),
    provider: m.provider === "bq" ? "bq" : "vertex",
    auc: typeof m.auc === "number" ? m.auc : 0,
    f1: typeof m.f1 === "number" ? m.f1 : 0,
    featureImportance:
      m.featureImportance && typeof m.featureImportance === "object"
        ? (m.featureImportance as Record<string, number>)
        : {},
    weights,
    intercept: typeof m.intercept === "number" ? m.intercept : 0,
  };
}

export function readMlChampionChallenger(raw: unknown): MlChampionChallenger {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      champion: "heuristic",
      challenger: "vertex",
      shadowDays: 0,
      consecutiveWins: 0,
      promoteAt: null,
    };
  }
  const o = (raw as Record<string, unknown>).mlChampionChallenger;
  if (!o || typeof o !== "object" || Array.isArray(o)) {
    return {
      champion: "heuristic",
      challenger: "vertex",
      shadowDays: 0,
      consecutiveWins: 0,
      promoteAt: null,
    };
  }
  const c = o as Record<string, unknown>;
  return {
    champion:
      c.champion === "vertex" || c.champion === "logistic" ? c.champion : "heuristic",
    challenger: c.challenger === "logistic" ? "logistic" : "vertex",
    shadowDays: typeof c.shadowDays === "number" ? c.shadowDays : 0,
    consecutiveWins: typeof c.consecutiveWins === "number" ? c.consecutiveWins : 0,
    promoteAt: typeof c.promoteAt === "string" ? c.promoteAt : null,
  };
}

function heuristicF1Proxy(features: ExperimentFeatureVector, blocked: boolean): number {
  const label = blocked ? 1 : 0;
  const pred = features.liftPp < 2 || !features.sampleSizeOk ? 1 : 0;
  return pred === label ? 1 : 0;
}

function scoreWithVertex(features: ExperimentFeatureVector, model: VertexMlModel): number {
  const w = model.weights;
  const z =
    model.intercept +
    w.liftPp * features.liftPp +
    w.sampleSizeOk * (features.sampleSizeOk ? 0 : 1) +
    w.srmDeltaPp * features.srmDeltaPp +
    w.parityScorePp * (features.parityScorePp ?? 0) +
    w.edgeSynced * (features.edgeSynced ? 0 : 1) +
    w.daysRunning * features.daysRunning;
  return Math.round((1 / (1 + Math.exp(-z / 20))) * 100);
}

/** Record daily shadow comparison; returns updated champion/challenger state. */
export function recordMlShadowComparison(input: {
  themeExperimentJson: unknown;
  features: ExperimentFeatureVector;
  heuristicBlocked: boolean;
}): MlChampionChallenger {
  const vertex = readVertexMlModel(input.themeExperimentJson);
  const logistic = readMlModelWeights(input.themeExperimentJson);
  const state = readMlChampionChallenger(input.themeExperimentJson);

  const heuristicF1 = heuristicF1Proxy(input.features, input.heuristicBlocked);
  const vertexScore = vertex ? scoreWithVertex(input.features, vertex) : 0;
  const logisticScore = scoreRegretWithModel(input.features, logistic);
  const vertexBlocked = vertexScore >= 65;
  const vertexF1 = vertex ? (vertexBlocked === input.heuristicBlocked ? 1 : 0) : 0;
  const logisticF1 = logisticScore >= 65 === input.heuristicBlocked ? 1 : 0;

  const challengerF1 = Math.max(vertexF1, logisticF1);
  const wins = challengerF1 > heuristicF1 ? state.consecutiveWins + 1 : 0;
  const shadowDays = state.shadowDays + 1;

  let promoteAt: string | null = state.promoteAt;
  if (wins >= PROMOTE_DAYS && process.env.THEME_EXPERIMENT_ML_AUTO_PROMOTE === "1") {
    promoteAt = new Date().toISOString();
  }

  return {
    champion: promoteAt ? "vertex" : state.champion,
    challenger: "vertex",
    shadowDays,
    consecutiveWins: wins,
    promoteAt,
  };
}

export function computeMlRiskWithVertex(input: {
  features: ExperimentFeatureVector;
  themeExperimentJson?: unknown;
}): MlRiskScore & {
  shadow?: { heuristic: number; model: number; vertex?: number; modelBlocked: boolean };
  champion?: MlChampionChallenger;
} {
  const base = computeMlRiskWithShadow(input);
  const vertex = readVertexMlModel(input.themeExperimentJson);
  const cc = readMlChampionChallenger(input.themeExperimentJson);

  if (!vertex || cc.champion !== "vertex" || !isVertexMlEnabled()) {
    return { ...base, champion: cc };
  }

  const threshold = base.threshold;
  const vertexScore = scoreWithVertex(input.features, vertex);
  const blocked = vertexScore >= threshold;

  return {
    score: vertexScore,
    threshold,
    blocked,
    features: input.features,
    headline: blocked
      ? `Vertex v${vertex.version} regret ${vertexScore}/${threshold}`
      : `Vertex v${vertex.version} OK (${vertexScore}/${threshold})`,
    detail: `Model SHA ${vertex.sha256.slice(0, 12)}… AUC ${vertex.auc} F1 ${vertex.f1}`,
    shadow: base.shadow
      ? { ...base.shadow, vertex: vertexScore }
      : undefined,
    champion: cc,
  };
}

export function mergeVertexModelIntoJson(
  previousRaw: unknown,
  model: VertexMlModel,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.mlRegretModelV2 = model;
  return base;
}

export function mergeChampionChallengerIntoJson(
  previousRaw: unknown,
  cc: MlChampionChallenger,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.mlChampionChallenger = cc;
  return base;
}

/** Auto-promote vertex to production guard when shadow wins 14d. */
export function shouldAutoPromoteVertex(cc: MlChampionChallenger): boolean {
  return (
    process.env.THEME_EXPERIMENT_ML_AUTO_PROMOTE === "1" &&
    cc.consecutiveWins >= PROMOTE_DAYS &&
    cc.champion === "vertex"
  );
}

export { computeExperimentConcludeRiskScore };
