import type { ThemeExperimentArm, ThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { toJsonValue } from "@/lib/prisma/json";
import {
  armWeightsRecord,
  readAllocationMode,
  readExperimentArms,
} from "@/lib/storefront/theme-experiment-multi-arm";
import { readSegmentArmWeights } from "@/lib/storefront/theme-experiment-contextual-bandit";
import { readLinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";
import { readVersionVector } from "@/lib/storefront/theme-experiment-crdt";

/** Edge Config namespace — separate from theme draft/publish snapshots. */
export const THEME_EXPERIMENT_EDGE_KEY_PREFIX = "theme-exp:";

export const THEME_EXPERIMENT_ARMS = ["published", "draft"] as const satisfies readonly ThemeExperimentArm[];

export type ThemeExperimentEdgePayload = {
  experimentId: string;
  enabled: boolean;
  /** When false, middleware skips assignment (per-store kill switch). */
  pipelineEnabled?: boolean;
  /** Post-winner: small % stays on published control arm for measurement. */
  holdoutOnly?: boolean;
  holdoutPercent?: number;
  arms: typeof THEME_EXPERIMENT_ARMS;
  /** Multi-arm ids (L2) — includes published/draft + variants. */
  armIds?: string[];
  armWeights?: Record<string, number>;
  segmentArmWeights?: Record<string, Record<string, number>>;
  linucbWeights?: unknown;
  allocationMode?: "split" | "mab";
  trafficPercent: number;
  /** ISO timestamp when experiment settings were last synced to edge. */
  publishedAt: string;
  /** Monotonic version for optimistic concurrency / stale detection. */
  version: number;
  versionVector?: { logical: number; db: number; edge: number };
};

/** Future agency mode: pass workspaceId to namespace keys per tenant. */
export function edgeConfigKeyForStore(storeSlug: string, workspaceId?: string | null): string {
  if (workspaceId?.trim()) {
    return `${THEME_EXPERIMENT_EDGE_KEY_PREFIX}${workspaceId.trim()}:${storeSlug}`;
  }
  return `${THEME_EXPERIMENT_EDGE_KEY_PREFIX}${storeSlug}`;
}

export function isThemeExperimentEdgeEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EDGE === "1" && Boolean(process.env.EDGE_CONFIG?.trim());
}

export function parseThemeExperimentEdgePayload(raw: unknown): ThemeExperimentEdgePayload | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const holdoutOnly = o.holdoutOnly === true;
  if (o.enabled !== true && !holdoutOnly) return null;
  if (o.pipelineEnabled === false) return null;
  const experimentId = typeof o.experimentId === "string" ? o.experimentId : "";
  if (!experimentId) return null;
  const trafficPercent =
    typeof o.trafficPercent === "number" && o.trafficPercent >= 0 && o.trafficPercent <= 100
      ? o.trafficPercent
      : holdoutOnly
        ? 0
        : 50;
  const holdoutPercent =
    typeof o.holdoutPercent === "number" && o.holdoutPercent >= 0 && o.holdoutPercent <= 20
      ? Math.floor(o.holdoutPercent)
      : trafficPercent;
  const publishedAt = typeof o.publishedAt === "string" ? o.publishedAt : new Date(0).toISOString();
  const version = typeof o.version === "number" && Number.isFinite(o.version) ? Math.floor(o.version) : 0;
  const armIds = Array.isArray(o.armIds)
    ? o.armIds.filter((id): id is string => typeof id === "string")
    : undefined;
  const armWeights =
    o.armWeights && typeof o.armWeights === "object" && !Array.isArray(o.armWeights)
      ? (o.armWeights as Record<string, number>)
      : undefined;
  const segmentArmWeights =
    o.segmentArmWeights && typeof o.segmentArmWeights === "object" && !Array.isArray(o.segmentArmWeights)
      ? (o.segmentArmWeights as Record<string, Record<string, number>>)
      : undefined;
  const allocationMode = o.allocationMode === "mab" ? "mab" : o.allocationMode === "split" ? "split" : undefined;
  const versionVector =
    o.versionVector && typeof o.versionVector === "object" && !Array.isArray(o.versionVector)
      ? (o.versionVector as ThemeExperimentEdgePayload["versionVector"])
      : undefined;

  return {
    experimentId,
    enabled: true,
    holdoutOnly,
    holdoutPercent: holdoutOnly ? holdoutPercent : undefined,
    arms: THEME_EXPERIMENT_ARMS,
    armIds,
    armWeights,
    segmentArmWeights,
    allocationMode,
    trafficPercent,
    publishedAt,
    version,
    versionVector,
  };
}

export function buildThemeExperimentEdgePayload(input: {
  storefrontId: string;
  config: ThemeExperimentConfig;
  version: number;
  themeExperimentJson?: unknown;
  pipelineEnabled?: boolean;
  holdoutOnly?: boolean;
  holdoutPercent?: number;
}): ThemeExperimentEdgePayload {
  const holdoutOnly = input.holdoutOnly === true;
  const holdoutPercent = holdoutOnly
    ? Math.min(20, Math.max(0, Math.floor(input.holdoutPercent ?? 0)))
    : undefined;
  const experimentArms = input.themeExperimentJson
    ? readExperimentArms(input.themeExperimentJson)
    : readExperimentArms(null);
  const vv = input.themeExperimentJson
    ? readVersionVector(input.themeExperimentJson, input.version)
    : readVersionVector(null, input.version);

  return {
    experimentId: input.storefrontId,
    enabled: true,
    pipelineEnabled: input.pipelineEnabled !== false,
    holdoutOnly,
    holdoutPercent,
    arms: THEME_EXPERIMENT_ARMS,
    armIds: experimentArms.map((a) => a.id),
    armWeights: armWeightsRecord(experimentArms),
    segmentArmWeights: input.themeExperimentJson
      ? readSegmentArmWeights(input.themeExperimentJson)
      : undefined,
    linucbWeights: input.themeExperimentJson
      ? readLinUcbSnapshot(input.themeExperimentJson)
      : undefined,
    allocationMode: input.themeExperimentJson ? readAllocationMode(input.themeExperimentJson) : "split",
    trafficPercent: holdoutOnly ? (holdoutPercent ?? 0) : (input.config.trafficPercent ?? 50),
    publishedAt: new Date().toISOString(),
    version: vv.logical,
    versionVector: { logical: vv.logical, db: vv.db, edge: vv.edge },
  };
}
