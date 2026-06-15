/**
 * P5 — Bayesian partial rollback: revert layout tokens only; keep copy/pricing winner.
 */

import type { ThemeSnapshotV1 } from "@/lib/storefront/theme-snapshot";
export type PartialRollbackSnapshot = {
  at: string;
  layoutTokens: ThemeSnapshotV1["tokens"];
  /** Full published snapshot before winner — for full revert */
  publishedSnapshot: ThemeSnapshotV1;
  /** Winner snapshot (draft) — copy/pricing source of truth */
  winnerSnapshot: ThemeSnapshotV1;
  counterfactualLiftPp: number;
  pymcSource: boolean;
};

export function isPartialRollbackEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PARTIAL_ROLLBACK === "1";
}

export function readPartialRollbackSnapshot(raw: unknown): PartialRollbackSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).partialRollbackSnapshot;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const snap = o as Record<string, unknown>;
  if (typeof snap.at !== "string" || !snap.publishedSnapshot || !snap.winnerSnapshot) return null;
  return {
    at: snap.at,
    layoutTokens:
      snap.layoutTokens && typeof snap.layoutTokens === "object"
        ? (snap.layoutTokens as ThemeSnapshotV1["tokens"])
        : undefined,
    publishedSnapshot: snap.publishedSnapshot as ThemeSnapshotV1,
    winnerSnapshot: snap.winnerSnapshot as ThemeSnapshotV1,
    counterfactualLiftPp: typeof snap.counterfactualLiftPp === "number" ? snap.counterfactualLiftPp : 0,
    pymcSource: snap.pymcSource === true,
  };
}

/** Merge: layout from pre-winner baseline, structural content from winner. */
export function buildPartialRevertSnapshot(snap: PartialRollbackSnapshot): ThemeSnapshotV1 {
  const winner = snap.winnerSnapshot;
  const baseline = snap.publishedSnapshot;
  return {
    version: 1,
    navigationItems: winner.navigationItems ?? baseline.navigationItems,
    footerBlocks: winner.footerBlocks ?? baseline.footerBlocks,
    tokens: {
      brandColor: snap.layoutTokens?.brandColor ?? baseline.tokens?.brandColor ?? winner.tokens?.brandColor,
      secondaryColor:
        snap.layoutTokens?.secondaryColor ?? baseline.tokens?.secondaryColor ?? winner.tokens?.secondaryColor,
      backgroundColor:
        snap.layoutTokens?.backgroundColor ?? baseline.tokens?.backgroundColor ?? winner.tokens?.backgroundColor,
      textColor: snap.layoutTokens?.textColor ?? baseline.tokens?.textColor ?? winner.tokens?.textColor,
    },
  };
}

export function buildFullRevertSnapshot(snap: PartialRollbackSnapshot): ThemeSnapshotV1 {
  return { ...snap.publishedSnapshot, version: 1 };
}

export function seedPartialRollbackSnapshot(input: {
  previousRaw: unknown;
  publishedSnapshot: ThemeSnapshotV1;
  winnerSnapshot: ThemeSnapshotV1;
  counterfactualLiftPp?: number;
}): Record<string, unknown> {
  const base =
    input.previousRaw && typeof input.previousRaw === "object" && !Array.isArray(input.previousRaw)
      ? { ...(input.previousRaw as Record<string, unknown>) }
      : {};
  base.partialRollbackSnapshot = {
    at: new Date().toISOString(),
    layoutTokens: input.publishedSnapshot.tokens,
    publishedSnapshot: input.publishedSnapshot,
    winnerSnapshot: input.winnerSnapshot,
    counterfactualLiftPp: input.counterfactualLiftPp ?? 0,
    pymcSource: true,
  } satisfies PartialRollbackSnapshot;
  return base;
}
