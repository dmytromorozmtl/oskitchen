/**
 * Q1 — Cross-workspace interference matrix (workspace × store spillover heatmap).
 * Synthetic control panel + auto holdout bump.
 */

import { readSpilloverDaily } from "@/lib/storefront/theme-experiment-causal-dag";
export type InterferenceMatrixCell = {
  workspaceId: string;
  storeSlug: string;
  spilloverPp: number;
  crossLiftPp: number;
  exposures: number;
  syntheticWeight: number;
};

export type InterferenceMatrixSnapshot = {
  at: string;
  cells: InterferenceMatrixCell[];
  syntheticControlLiftPp: number;
  maxInterferencePp: number;
  heatmapIntensity: number;
  recommendedHoldoutBumpPercent: number;
  autoHoldoutApplied: boolean;
};

export function isInterferenceMatrixEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_INTERFERENCE_MATRIX === "1";
}

export function interferenceHoldoutBumpThresholdPp(): number {
  return Number(process.env.THEME_EXPERIMENT_INTERFERENCE_BUMP_PP ?? "1.2");
}

export function readInterferenceMatrix(raw: unknown): InterferenceMatrixSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).interferenceMatrix;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const snap = o as Record<string, unknown>;
  if (typeof snap.at !== "string" || !Array.isArray(snap.cells)) return null;
  return {
    at: snap.at,
    cells: snap.cells as InterferenceMatrixCell[],
    syntheticControlLiftPp:
      typeof snap.syntheticControlLiftPp === "number" ? snap.syntheticControlLiftPp : 0,
    maxInterferencePp: typeof snap.maxInterferencePp === "number" ? snap.maxInterferencePp : 0,
    heatmapIntensity: typeof snap.heatmapIntensity === "number" ? snap.heatmapIntensity : 0,
    recommendedHoldoutBumpPercent:
      typeof snap.recommendedHoldoutBumpPercent === "number" ? snap.recommendedHoldoutBumpPercent : 0,
    autoHoldoutApplied: snap.autoHoldoutApplied === true,
  };
}

export function computeSyntheticControlFromMatrix(cells: InterferenceMatrixCell[]): number {
  let num = 0;
  let den = 0;
  for (const c of cells) {
    const w = c.syntheticWeight > 0 ? c.syntheticWeight : c.exposures;
    num += c.crossLiftPp * w;
    den += w;
  }
  return den > 0 ? Math.round((num / den) * 10) / 10 : 0;
}

export function computeHeatmapIntensity(cells: InterferenceMatrixCell[]): number {
  if (cells.length === 0) return 0;
  const max = cells.reduce((m, c) => Math.max(m, c.spilloverPp), 0);
  return Math.min(1, Math.round((max / 5) * 100) / 100);
}

export function recommendHoldoutBumpFromInterference(cells: InterferenceMatrixCell[]): number {
  const maxSpill = cells.reduce((m, c) => Math.max(m, c.spilloverPp), 0);
  if (maxSpill >= 2) return 4;
  if (maxSpill >= interferenceHoldoutBumpThresholdPp()) return 2;
  return 0;
}

export function buildInterferenceMatrixSnapshot(cells: InterferenceMatrixCell[]): InterferenceMatrixSnapshot {
  const syntheticControlLiftPp = computeSyntheticControlFromMatrix(cells);
  const maxInterferencePp = cells.reduce((m, c) => Math.max(m, c.spilloverPp, c.crossLiftPp), 0);
  const recommendedHoldoutBumpPercent = recommendHoldoutBumpFromInterference(cells);
  return {
    at: new Date().toISOString(),
    cells,
    syntheticControlLiftPp,
    maxInterferencePp,
    heatmapIntensity: computeHeatmapIntensity(cells),
    recommendedHoldoutBumpPercent,
    autoHoldoutApplied: false,
  };
}

/** Merge spillover daily cells into workspace×store matrix rows. */
export function cellsFromSpilloverAndMatrix(input: {
  spilloverCells?: { workspaceId: string; storeSlug: string; spilloverPp: number }[];
  matrixCells: InterferenceMatrixCell[];
}): InterferenceMatrixCell[] {
  const byKey = new Map<string, InterferenceMatrixCell>();
  for (const c of input.matrixCells) {
    byKey.set(`${c.workspaceId}:${c.storeSlug}`, c);
  }
  for (const s of input.spilloverCells ?? []) {
    const key = `${s.workspaceId}:${s.storeSlug}`;
    const prev = byKey.get(key);
    byKey.set(key, {
      workspaceId: s.workspaceId,
      storeSlug: s.storeSlug,
      spilloverPp: s.spilloverPp,
      crossLiftPp: prev?.crossLiftPp ?? s.spilloverPp * 0.8,
      exposures: prev?.exposures ?? 100,
      syntheticWeight: prev?.syntheticWeight ?? 100,
    });
  }
  return [...byKey.values()];
}

export function applyAutoHoldoutBump(
  raw: unknown,
  currentHoldoutPercent: number,
): { holdoutPercent: number; applied: boolean; json: Record<string, unknown> } {
  const snap = readInterferenceMatrix(raw);
  if (!snap || snap.recommendedHoldoutBumpPercent <= 0) {
    return {
      holdoutPercent: currentHoldoutPercent,
      applied: false,
      json:
        raw && typeof raw === "object" && !Array.isArray(raw)
          ? { ...(raw as Record<string, unknown>) }
          : {},
    };
  }
  const bumped = Math.min(20, currentHoldoutPercent + snap.recommendedHoldoutBumpPercent);
  const next = { ...snap, autoHoldoutApplied: true, at: new Date().toISOString() };
  const json = mergeInterferenceIntoJson(raw, next);
  json.postWinnerHoldoutPercent = bumped;
  return { holdoutPercent: bumped, applied: true, json };
}

export function mergeInterferenceIntoJson(
  previousRaw: unknown,
  snap: InterferenceMatrixSnapshot | null,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (snap) base.interferenceMatrix = snap;
  return base;
}

export function evaluateInterferencePublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isInterferenceMatrixEnabled()) {
    return { passed: true, headline: "Interference matrix off", detail: "THEME_EXPERIMENT_INTERFERENCE_MATRIX=1" };
  }
  const snap = readInterferenceMatrix(raw);
  const spill = readSpilloverDaily(raw);
  if (!snap && !spill) {
    return { passed: true, headline: "No interference batch", detail: "Awaiting BQ interference matrix." };
  }
  const max = snap?.maxInterferencePp ?? spill?.maxSpilloverPp ?? 0;
  const threshold = Number(process.env.THEME_EXPERIMENT_INTERFERENCE_BAN_PP ?? "2");
  if (max > threshold) {
    return {
      passed: false,
      headline: `Interference ${max}pp > ${threshold}pp — holdout bump recommended`,
      detail: snap
        ? `Synthetic control ${snap.syntheticControlLiftPp}pp · heatmap ${snap.heatmapIntensity}`
        : "Cross-workspace spillover elevated.",
    };
  }
  return {
    passed: true,
    headline: `Interference OK (max ${max}pp)`,
    detail: snap ? `${snap.cells.length} workspace×store cells` : "Aligned with spillover daily.",
  };
}
