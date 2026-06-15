import type { QUALITY_SCORING_POLICY_ID } from "@/lib/marketplace/quality-scoring-policy";

export type QualityScoreTier = "excellent" | "good" | "watch" | "avoid" | "unrated";

export type SupplierQualityScore = {
  vendorId: string;
  vendorName: string;
  overall: number | null;
  quality: number | null;
  accuracy: number | null;
  delivery: number | null;
  packaging: number | null;
  reviewCount: number;
  tier: QualityScoreTier;
  orderCount: number;
  href: string;
};

export type PendingSupplierReview = {
  purchaseOrderId: string;
  poNumber: string | null;
  vendorId: string;
  vendorName: string;
  deliveredAtIso: string;
  href: string;
};

export type QualityScoringAlert = {
  id: string;
  vendorId: string;
  vendorName: string;
  overall: number;
  message: string;
  severity: "warning" | "info";
  href: string;
};

export type QualityScoringSnapshot = {
  policyId: typeof QUALITY_SCORING_POLICY_ID;
  workspaceId: string;
  generatedAtIso: string;
  workspaceSuppliers: SupplierQualityScore[];
  topMarketplaceSuppliers: SupplierQualityScore[];
  pendingReviews: PendingSupplierReview[];
  alerts: QualityScoringAlert[];
  summary: {
    ratedSuppliers: number;
    excellentCount: number;
    watchOrBelowCount: number;
    pendingReviewCount: number;
    workspaceAvgScore: number | null;
  };
  basePath: string;
};
