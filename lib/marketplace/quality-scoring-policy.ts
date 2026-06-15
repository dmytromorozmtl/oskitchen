export const QUALITY_SCORING_POLICY_ID = "marketplace-quality-scoring-v1" as const;

export const QUALITY_SCORING_PATH = "/dashboard/marketplace/quality" as const;

export const QUALITY_SCORING_SERVICE = "services/marketplace/quality-scoring.ts" as const;

export const QUALITY_SCORE_DIMENSIONS = [
  "quality",
  "accuracy",
  "delivery",
  "packaging",
] as const;

export type QualityScoreDimension = (typeof QUALITY_SCORE_DIMENSIONS)[number];

export const QUALITY_TIER_THRESHOLDS = {
  excellent: 4.5,
  good: 4,
  watch: 3.5,
} as const;
