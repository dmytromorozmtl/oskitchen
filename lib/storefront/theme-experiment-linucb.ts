import { armFromWeightedBucket, stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";
import { toJsonValue } from "@/lib/prisma/json";
import type { VisitorSegment } from "@/lib/storefront/theme-experiment-contextual-bandit";

export type LinUcbFeatureVector = {
  segment: VisitorSegment;
  geo: string;
  device: "mobile" | "desktop" | "tablet" | "unknown";
  hourUtc: number;
  cartValueBucket: "low" | "mid" | "high" | "none";
};

export type LinUcbArmWeights = Record<string, number>;

export type LinUcbSnapshot = {
  at: string;
  explorationPercent: number;
  regretPp: number;
  featureDim: number;
  arms: { armId: string; theta: number[]; weight: number }[];
  segmentWeights?: Record<string, LinUcbArmWeights>;
};

export const LINUCB_FEATURE_STREAM_COOKIE = "kos_ab_features";

export function isLinUcbEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_LINUCB === "1";
}

export function linUcbMaxExplorationPercent(): number {
  return Math.min(15, Math.max(1, Number(process.env.THEME_EXPERIMENT_LINUCB_MAX_EXPLORATION ?? "15")));
}

export function readLinUcbSnapshot(raw: unknown): LinUcbSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).linucbWeights;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const snap = o as Record<string, unknown>;
  if (typeof snap.at !== "string" || !Array.isArray(snap.arms)) return null;
  return {
    at: snap.at,
    explorationPercent:
      typeof snap.explorationPercent === "number" ? snap.explorationPercent : linUcbMaxExplorationPercent(),
    regretPp: typeof snap.regretPp === "number" ? snap.regretPp : 0,
    featureDim: typeof snap.featureDim === "number" ? snap.featureDim : 5,
    arms: snap.arms as LinUcbSnapshot["arms"],
    segmentWeights:
      snap.segmentWeights && typeof snap.segmentWeights === "object" && !Array.isArray(snap.segmentWeights)
        ? (snap.segmentWeights as Record<string, LinUcbArmWeights>)
        : undefined,
  };
}

export function buildLinUcbFeatureVector(input: {
  segment: VisitorSegment;
  geo?: string | null;
  userAgent?: string | null;
  hourUtc?: number;
  cartValueCents?: number | null;
}): LinUcbFeatureVector {
  const ua = input.userAgent?.toLowerCase() ?? "";
  let device: LinUcbFeatureVector["device"] = "unknown";
  if (/ipad|tablet/i.test(ua)) device = "tablet";
  else if (/mobile|android|iphone/i.test(ua)) device = "mobile";
  else if (ua) device = "desktop";

  let cartValueBucket: LinUcbFeatureVector["cartValueBucket"] = "none";
  const cents = input.cartValueCents ?? 0;
  if (cents > 0 && cents < 3000) cartValueBucket = "low";
  else if (cents < 10000) cartValueBucket = "mid";
  else if (cents >= 10000) cartValueBucket = "high";

  return {
    segment: input.segment,
    geo: input.geo?.slice(0, 2).toUpperCase() || "XX",
    device,
    hourUtc: input.hourUtc ?? new Date().getUTCHours(),
    cartValueBucket,
  };
}

function featureKey(f: LinUcbFeatureVector): string {
  return `${f.segment}:${f.geo}:${f.device}:${f.hourUtc}:${f.cartValueBucket}`;
}

/** UCB-style arm pick from BQ-updated weights (exploration capped). */
export function assignArmLinUcb(input: {
  visitorId: string;
  features: LinUcbFeatureVector;
  snapshot: LinUcbSnapshot;
  defaultWeights: Record<string, number>;
}): string {
  const segWeights = input.snapshot.segmentWeights?.[input.features.segment];
  if (segWeights && Object.keys(segWeights).length > 0) {
    const bucket = stableBucketPercent(`${input.visitorId}:${featureKey(input.features)}`);
    return armFromWeightedBucket(bucket, segWeights);
  }

  const exploration = Math.min(linUcbMaxExplorationPercent(), input.snapshot.explorationPercent) / 100;
  const bucket = stableBucketPercent(`${input.visitorId}:linucb:${featureKey(input.features)}`);
  if (bucket / 100 < exploration && input.snapshot.arms.length > 1) {
    const idx = Math.floor((bucket * input.snapshot.arms.length) / 100) % input.snapshot.arms.length;
    return input.snapshot.arms[idx]!.armId;
  }

  const weights: Record<string, number> = {};
  for (const a of input.snapshot.arms) {
    weights[a.armId] = Math.max(1, Math.round(a.weight * 100));
  }
  if (Object.keys(weights).length === 0) return armFromWeightedBucket(bucket, input.defaultWeights);
  return armFromWeightedBucket(bucket, weights);
}

export function mergeLinUcbIntoJson(
  previousRaw: unknown,
  snap: LinUcbSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.linucbWeights = snap;
  return base;
}
