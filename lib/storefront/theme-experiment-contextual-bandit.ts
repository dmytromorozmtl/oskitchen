import { armFromWeightedBucket, stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";
export const VISITOR_SEGMENT_COOKIE = "kos_ab_segment";

export type VisitorSegment = "default" | "mobile" | "desktop" | "returning" | "new";

export function parseVisitorSegment(value: string | null | undefined): VisitorSegment {
  const v = value?.trim().toLowerCase();
  if (v === "mobile" || v === "desktop" || v === "returning" || v === "new") return v;
  return "default";
}

export function inferVisitorSegment(input: {
  userAgent?: string | null;
  isReturning?: boolean;
}): VisitorSegment {
  if (input.isReturning) return "returning";
  const ua = input.userAgent?.toLowerCase() ?? "";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  if (ua) return "desktop";
  return "new";
}

export type SegmentArmWeights = Record<string, Record<string, number>>;

export function readSegmentArmWeights(raw: unknown): SegmentArmWeights {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const w = (raw as Record<string, unknown>).segmentArmWeights;
  if (!w || typeof w !== "object" || Array.isArray(w)) return {};
  return w as SegmentArmWeights;
}

export function resolveArmWeightsForSegment(input: {
  segment: VisitorSegment;
  segmentArmWeights: SegmentArmWeights;
  defaultWeights: Record<string, number>;
}): Record<string, number> {
  const seg = input.segmentArmWeights[input.segment];
  if (seg && Object.keys(seg).length > 0) return seg;
  return input.defaultWeights;
}

export function assignArmForSegment(input: {
  visitorId: string;
  segment: VisitorSegment;
  segmentArmWeights: SegmentArmWeights;
  defaultWeights: Record<string, number>;
}): string {
  const weights = resolveArmWeightsForSegment(input);
  const bucket = stableBucketPercent(`${input.visitorId}:${input.segment}`);
  return armFromWeightedBucket(bucket, weights);
}

export function isContextualBanditEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CONTEXTUAL_BANDIT === "1";
}
