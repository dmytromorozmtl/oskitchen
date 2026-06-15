import type { ProductMappingConfidence } from "@prisma/client";

export const CONFIDENCE_LABEL: Record<ProductMappingConfidence, string> = {
  EXACT_SKU: "Exact SKU",
  EXACT_TITLE: "Exact title",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  NONE: "No match",
  MANUAL: "Manual",
};

export const CONFIDENCE_TONE: Record<
  ProductMappingConfidence,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  EXACT_SKU: "success",
  EXACT_TITLE: "success",
  HIGH: "success",
  MEDIUM: "warning",
  LOW: "danger",
  NONE: "danger",
  MANUAL: "info",
};

export const CONFIDENCE_RANK: Record<ProductMappingConfidence, number> = {
  EXACT_SKU: 100,
  EXACT_TITLE: 95,
  HIGH: 80,
  MEDIUM: 60,
  LOW: 35,
  NONE: 0,
  MANUAL: 100,
};

/** Bulk approval is only safe for these confidence labels. */
export const BULK_APPROVABLE: ProductMappingConfidence[] = ["EXACT_SKU", "EXACT_TITLE", "HIGH"];

export function isBulkApprovable(label: ProductMappingConfidence | null | undefined): boolean {
  if (!label) return false;
  return BULK_APPROVABLE.includes(label);
}

/**
 * Converts a 0..1 raw score into a coarse confidence label using the
 * deterministic ladder used by the matching engine.
 */
export function classifyScore(score: number): ProductMappingConfidence {
  if (score >= 0.95) return "EXACT_TITLE";
  if (score >= 0.8) return "HIGH";
  if (score >= 0.55) return "MEDIUM";
  if (score > 0) return "LOW";
  return "NONE";
}
