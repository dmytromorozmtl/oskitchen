import {
  QUALITY_SCORING_PATH,
  QUALITY_SCORING_POLICY_ID,
  QUALITY_TIER_THRESHOLDS,
} from "@/lib/marketplace/quality-scoring-policy";
import type {
  QualityScoreTier,
  QualityScoringAlert,
  QualityScoringSnapshot,
  SupplierQualityScore,
} from "@/lib/marketplace/quality-scoring-types";

export function resolveQualityTier(overall: number | null): QualityScoreTier {
  if (overall == null) return "unrated";
  if (overall >= QUALITY_TIER_THRESHOLDS.excellent) return "excellent";
  if (overall >= QUALITY_TIER_THRESHOLDS.good) return "good";
  if (overall >= QUALITY_TIER_THRESHOLDS.watch) return "watch";
  return "avoid";
}

export function buildSupplierQualityScore(input: {
  vendorId: string;
  vendorName: string;
  overall: number | null;
  quality: number | null;
  accuracy: number | null;
  delivery: number | null;
  packaging: number | null;
  reviewCount: number;
  orderCount: number;
}): SupplierQualityScore {
  return {
    vendorId: input.vendorId,
    vendorName: input.vendorName,
    overall: input.overall,
    quality: input.quality,
    accuracy: input.accuracy,
    delivery: input.delivery,
    packaging: input.packaging,
    reviewCount: input.reviewCount,
    tier: resolveQualityTier(input.overall),
    orderCount: input.orderCount,
    href: `/dashboard/marketplace/vendors/${input.vendorId}`,
  };
}

export function buildQualityAlerts(suppliers: SupplierQualityScore[]): QualityScoringAlert[] {
  return suppliers
    .filter((row) => row.overall != null && row.overall < QUALITY_TIER_THRESHOLDS.watch && row.orderCount > 0)
    .map((row) => ({
      id: `alert-${row.vendorId}`,
      vendorId: row.vendorId,
      vendorName: row.vendorName,
      overall: row.overall!,
      message: `${row.vendorName} scored ${row.overall}/5 — consider alternate suppliers before reordering.`,
      severity: row.overall! < 3 ? ("warning" as const) : ("info" as const),
      href: row.href,
    }))
    .slice(0, 6);
}

export function buildQualityScoringSnapshot(input: {
  workspaceId: string;
  workspaceSuppliers: SupplierQualityScore[];
  topMarketplaceSuppliers: SupplierQualityScore[];
  pendingReviews: QualityScoringSnapshot["pendingReviews"];
  analyzedAt?: Date;
}): QualityScoringSnapshot {
  const rated = input.workspaceSuppliers.filter((row) => row.overall != null);
  const workspaceAvgScore =
    rated.length > 0
      ? Math.round((rated.reduce((sum, row) => sum + (row.overall ?? 0), 0) / rated.length) * 10) / 10
      : null;

  const alerts = buildQualityAlerts(input.workspaceSuppliers);

  return {
    policyId: QUALITY_SCORING_POLICY_ID,
    workspaceId: input.workspaceId,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    workspaceSuppliers: input.workspaceSuppliers,
    topMarketplaceSuppliers: input.topMarketplaceSuppliers,
    pendingReviews: input.pendingReviews,
    alerts,
    summary: {
      ratedSuppliers: rated.length,
      excellentCount: input.workspaceSuppliers.filter((row) => row.tier === "excellent").length,
      watchOrBelowCount: input.workspaceSuppliers.filter(
        (row) => row.tier === "watch" || row.tier === "avoid",
      ).length,
      pendingReviewCount: input.pendingReviews.length,
      workspaceAvgScore,
    },
    basePath: QUALITY_SCORING_PATH,
  };
}
