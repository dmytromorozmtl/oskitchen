/**
 * Q5 — Live causal dashboard: PyMC streaming posteriors + partial rollback preview diff.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  buildPartialRevertSnapshot,
  readPartialRollbackSnapshot,
} from "@/lib/storefront/theme-experiment-partial-rollback";
import type { ThemeSnapshotV1 } from "@/lib/storefront/theme-snapshot";

export type CausalPosteriorPoint = {
  at: string;
  mu: number;
  sigma: number;
  hdiLow: number;
  hdiHigh: number;
  probPositive: number;
};

export type CausalPosteriorStream = {
  at: string;
  metricId: string;
  points: CausalPosteriorPoint[];
  pymcVersion: string;
  streaming: boolean;
};

export type PartialRollbackDiff = {
  layoutChanged: string[];
  copyKept: string[];
  pricingKept: boolean;
};

export function isCausalPosteriorStreamEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CAUSAL_POSTERIORS === "1";
}

export function readCausalPosteriorStream(raw: unknown): CausalPosteriorStream | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).causalPosteriorStream;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  if (typeof s.at !== "string" || !Array.isArray(s.points)) return null;
  return {
    at: s.at,
    metricId: typeof s.metricId === "string" ? s.metricId : "conversion_rate",
    points: s.points as CausalPosteriorPoint[],
    pymcVersion: typeof s.pymcVersion === "string" ? s.pymcVersion : "5.x",
    streaming: s.streaming === true,
  };
}

export function appendPosteriorPoint(
  stream: CausalPosteriorStream,
  point: CausalPosteriorPoint,
): CausalPosteriorStream {
  const points = [...stream.points, point].slice(-120);
  return { ...stream, at: new Date().toISOString(), points, streaming: true };
}

export function mergeCausalPosteriorsIntoJson(
  previousRaw: unknown,
  stream: CausalPosteriorStream,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.causalPosteriorStream = stream;
  return base;
}

export function buildPartialRollbackPreviewDiff(raw: unknown): PartialRollbackDiff | null {
  const snap = readPartialRollbackSnapshot(raw);
  if (!snap) return null;

  const partial = buildPartialRevertSnapshot(snap);
  const layoutChanged: string[] = [];
  const copyKept: string[] = [];

  const tokenKeys = ["brandColor", "secondaryColor", "backgroundColor", "textColor"] as const;
  for (const k of tokenKeys) {
    const before = snap.publishedSnapshot.tokens?.[k];
    const after = partial.tokens?.[k];
    if (before !== after) layoutChanged.push(k);
  }

  const pubNav = JSON.stringify(snap.publishedSnapshot.navigationItems ?? []);
  const winNav = JSON.stringify(snap.winnerSnapshot.navigationItems ?? []);
  const partNav = JSON.stringify(partial.navigationItems ?? []);
  if (partNav === winNav && partNav !== pubNav) copyKept.push("navigationItems");

  const pubFooter = JSON.stringify(snap.publishedSnapshot.footerBlocks ?? []);
  const winFooter = JSON.stringify(snap.winnerSnapshot.footerBlocks ?? []);
  const partFooter = JSON.stringify(partial.footerBlocks ?? []);
  if (partFooter === winFooter && partFooter !== pubFooter) copyKept.push("footerBlocks");

  return {
    layoutChanged,
    copyKept,
    pricingKept: copyKept.length > 0,
  };
}

export function summarizeLatestPosterior(stream: CausalPosteriorStream): {
  mu: number;
  probPositive: number;
  hdi: [number, number];
} | null {
  const last = stream.points[stream.points.length - 1];
  if (!last) return null;
  return { mu: last.mu, probPositive: last.probPositive, hdi: [last.hdiLow, last.hdiHigh] };
}

export function tokenDiffLines(before: ThemeSnapshotV1, after: ThemeSnapshotV1): string[] {
  const lines: string[] = [];
  const keys = ["brandColor", "secondaryColor", "backgroundColor", "textColor"] as const;
  for (const k of keys) {
    const a = before.tokens?.[k] ?? "—";
    const b = after.tokens?.[k] ?? "—";
    if (a !== b) lines.push(`${k}: ${a} → ${b}`);
  }
  return lines;
}
