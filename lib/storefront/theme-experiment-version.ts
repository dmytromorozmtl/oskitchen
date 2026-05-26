import type { ThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { toJsonValue } from "@/lib/prisma/json";
import { bumpVersionVector, readVersionVector } from "@/lib/storefront/theme-experiment-crdt";
import { readPostWinnerHoldoutPercent } from "@/lib/storefront/theme-experiment-holdout";

export type ThemeExperimentStored = ThemeExperimentConfig & {
  /** Monotonic counter — source of truth for Edge Config `version`. */
  version: number;
  /** CRDT logical clock vector (db + edge). */
  versionVector?: { logical: number; db: number; edge: number };
  updatedAt: string;
  /** Per-storefront pipeline kill switch (no redeploy). Default true when omitted. */
  pipelineEnabled?: boolean;
  /** Opt-in scheduled auto-conclude when all gates pass (requires THEME_EXPERIMENT_AUTO_CONCLUDE=1). */
  autoConcludeEnabled?: boolean;
  /** ISO timestamp — execute auto-conclude after grace period once gates first pass. */
  autoConcludeScheduledAt?: string;
  /** Post-winner holdout % (0–20) for edge + analytics. */
  postWinnerHoldoutPercent?: number;
};

export function getThemeExperimentVersion(raw: unknown): number {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return 0;
  const v = (raw as Record<string, unknown>).version;
  return typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0;
}

export function parseThemeExperimentStored(raw: unknown): ThemeExperimentStored | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const version = getThemeExperimentVersion(raw);
  const updatedAt =
    typeof o.updatedAt === "string" ? o.updatedAt : new Date(0).toISOString();
  const pipelineEnabled = o.pipelineEnabled !== false;
  const autoConcludeEnabled = o.autoConcludeEnabled === true;
  const autoConcludeScheduledAt =
    typeof o.autoConcludeScheduledAt === "string" ? o.autoConcludeScheduledAt : undefined;
  const postWinnerHoldoutPercent = readPostWinnerHoldoutPercent(raw);
  if (o.enabled !== true) {
    return {
      enabled: false,
      version,
      updatedAt,
      pipelineEnabled,
      autoConcludeEnabled,
      autoConcludeScheduledAt,
      postWinnerHoldoutPercent,
    };
  }
  const trafficPercent =
    typeof o.trafficPercent === "number" && o.trafficPercent >= 0 && o.trafficPercent <= 100
      ? o.trafficPercent
      : 50;
  return {
    enabled: true,
    draftPresetId: typeof o.draftPresetId === "string" ? o.draftPresetId : undefined,
    trafficPercent,
    version,
    updatedAt,
    pipelineEnabled,
    autoConcludeEnabled,
    autoConcludeScheduledAt,
    postWinnerHoldoutPercent,
  };
}

export type ThemeExperimentConcludeOutcome = "publish_draft" | "keep_published";

/** End experiment: disable, bump version, record outcome (lifecycle). */
export function buildThemeExperimentJsonConclude(input: {
  previousRaw: unknown;
  outcome: ThemeExperimentConcludeOutcome;
}): ThemeExperimentStored & { concludedAt: string; concludeOutcome: ThemeExperimentConcludeOutcome } {
  const prev = parseThemeExperimentStored(input.previousRaw);
  const version = getThemeExperimentVersion(input.previousRaw) + 1;
  const updatedAt = new Date().toISOString();
  return {
    enabled: false,
    version,
    updatedAt,
    concludedAt: updatedAt,
    concludeOutcome: input.outcome,
    ...(prev?.draftPresetId ? { draftPresetId: prev.draftPresetId } : {}),
    trafficPercent: prev?.trafficPercent ?? 50,
  };
}

/** Build JSON persisted to `theme_experiment_json` (bumps version on each save). */
export function buildThemeExperimentJsonForSave(input: {
  enabled: boolean;
  trafficPercent: number;
  draftPresetId?: string;
  pipelineEnabled?: boolean;
  autoConcludeEnabled?: boolean;
  postWinnerHoldoutPercent?: number;
  previousRaw: unknown;
}): ThemeExperimentStored {
  const prev = parseThemeExperimentStored(input.previousRaw);
  const prevVector = readVersionVector(input.previousRaw);
  const versionVector = bumpVersionVector(prevVector, "db");
  const version = versionVector.logical;
  const updatedAt = new Date().toISOString();
  const pipelineEnabled = input.pipelineEnabled !== false;
  const autoConcludeEnabled =
    input.autoConcludeEnabled !== undefined
      ? input.autoConcludeEnabled
      : prev?.autoConcludeEnabled === true;
  const postWinnerHoldoutPercent =
    input.postWinnerHoldoutPercent !== undefined
      ? Math.min(20, Math.max(0, Math.floor(input.postWinnerHoldoutPercent)))
      : readPostWinnerHoldoutPercent(input.previousRaw);

  if (!input.enabled) {
    return {
      enabled: false,
      version,
      versionVector,
      updatedAt,
      pipelineEnabled,
      autoConcludeEnabled,
      ...(postWinnerHoldoutPercent > 0 ? { postWinnerHoldoutPercent } : {}),
    };
  }
  return {
    enabled: true,
    trafficPercent: Math.min(100, Math.max(0, input.trafficPercent)),
    ...(input.draftPresetId ? { draftPresetId: input.draftPresetId } : {}),
    version,
    versionVector,
    updatedAt,
    pipelineEnabled,
    autoConcludeEnabled,
    ...(postWinnerHoldoutPercent > 0 ? { postWinnerHoldoutPercent } : {}),
    ...(prev?.autoConcludeScheduledAt ? { autoConcludeScheduledAt: prev.autoConcludeScheduledAt } : {}),
  };
}
