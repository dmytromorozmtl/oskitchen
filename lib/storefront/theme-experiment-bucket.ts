import { createHash } from "crypto";

import type { ThemeExperimentArm } from "@/lib/storefront/theme-experiment";

/** Stable visitor id for deterministic experiment buckets (set by middleware or assigner). */
export const THEME_EXPERIMENT_VISITOR_COOKIE = "kos_ab_vid";

/** Request header: arm assigned this request (before Set-Cookie is visible to RSC). */
export const THEME_EXPERIMENT_ARM_HEADER = "x-kos-theme-arm";

/** Deterministic 0–99 bucket from visitor id (sticky across sessions). */
export function stableBucketPercent(visitorId: string): number {
  const hash = createHash("sha256").update(visitorId).digest();
  return hash.readUInt32BE(0) % 100;
}

export function armFromTrafficBucket(bucket: number, trafficPercent: number): ThemeExperimentArm {
  const pct = Math.min(100, Math.max(0, trafficPercent));
  return bucket < pct ? "draft" : "published";
}

/** Post-winner holdout: `holdoutPercent` of visitors stay on published control arm. */
export function armFromHoldoutBucket(bucket: number, holdoutPercent: number): ThemeExperimentArm {
  const pct = Math.min(20, Math.max(0, holdoutPercent));
  return bucket < pct ? "published" : "draft";
}

/** Multi-arm weighted split — `weights` are 0–100 per arm id (must sum ~100). */
export function armFromWeightedBucket(bucket: number, weights: Record<string, number>): string {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  if (entries.length === 0) return "published";
  const total = entries.reduce((s, [, w]) => s + w, 0) || 100;
  let cursor = 0;
  for (const [armId, w] of entries) {
    cursor += (w / total) * 100;
    if (bucket < cursor) return armId;
  }
  return entries[entries.length - 1]![0];
}
