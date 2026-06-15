/**
 * Pure helpers for marketplace trust system (Blueprint P2-120).
 */

import { MARKETPLACE_TRUST_P2_120_POLICY_ID } from "@/lib/marketplace/marketplace-trust-p2-120-policy";

export type TrustCapabilityBlock = {
  id: string;
  label: string;
  status: "ready" | "partial" | "missing";
  summary: string;
  count: number;
};

export type MarketplaceTrustReport = {
  policyId: typeof MARKETPLACE_TRUST_P2_120_POLICY_ID;
  verifiedVendorCount: number;
  totalVendorCount: number;
  slaDeliveryScore: number | null;
  onTimeFulfillmentPct: number;
  reviewCount: number;
  avgReviewScore: number | null;
  openDisputeCount: number;
  resolvedDisputeCount30d: number;
  blocks: TrustCapabilityBlock[];
  readinessScore: number;
};

function blockStatus(count: number, threshold = 3): "ready" | "partial" | "missing" {
  if (count >= threshold) return "ready";
  if (count >= 1) return "partial";
  return "missing";
}

export function buildVerifiedBadgeBlock(
  verifiedVendorCount: number,
  totalVendorCount: number,
): TrustCapabilityBlock {
  return {
    id: "verified-badge",
    label: "Verified vendor badge",
    status:
      verifiedVendorCount >= 3
        ? "ready"
        : verifiedVendorCount >= 1
          ? "partial"
          : totalVendorCount > 0
            ? "partial"
            : "missing",
    count: verifiedVendorCount,
    summary:
      verifiedVendorCount > 0
        ? `${verifiedVendorCount}/${totalVendorCount} vendor(s) platform-verified — verify Stripe Connect before large POs`
        : "No verified vendors yet — badge appears after platform approval and Connect onboarding",
  };
}

export function buildSlaBlock(
  slaDeliveryScore: number | null,
  onTimeFulfillmentPct: number,
): TrustCapabilityBlock {
  return {
    id: "sla",
    label: "SLA",
    status:
      slaDeliveryScore != null && slaDeliveryScore >= 4
        ? "ready"
        : slaDeliveryScore != null || onTimeFulfillmentPct > 0
          ? "partial"
          : "missing",
    count: slaDeliveryScore != null ? Math.round(slaDeliveryScore * 10) / 10 : 0,
    summary:
      slaDeliveryScore != null
        ? `Avg delivery score ${slaDeliveryScore}/5 · ${onTimeFulfillmentPct}% on-time fulfillment — typical directional SLA, not certified`
        : "No SLA signals yet — delivery scores appear after completed PO reviews",
  };
}

export function buildReviewsBlock(
  reviewCount: number,
  avgReviewScore: number | null,
): TrustCapabilityBlock {
  return {
    id: "reviews",
    label: "Reviews",
    status: blockStatus(reviewCount),
    count: reviewCount,
    summary:
      reviewCount > 0 && avgReviewScore != null
        ? `${reviewCount} review(s) · ${avgReviewScore}/5 avg — verify recent delivery accuracy before reorder`
        : "No reviews yet — buyers can review after DELIVERED or COMPLETED POs",
  };
}

export function buildDisputeResolutionBlock(
  openDisputeCount: number,
  resolvedDisputeCount30d: number,
): TrustCapabilityBlock {
  return {
    id: "dispute-resolution",
    label: "Dispute resolution",
    status: openDisputeCount === 0 && resolvedDisputeCount30d >= 1 ? "ready" : "partial",
    count: openDisputeCount,
    summary:
      openDisputeCount > 0
        ? `${openDisputeCount} open dispute(s) — platform review in progress, not vendor-only chat`
        : resolvedDisputeCount30d > 0
          ? `${resolvedDisputeCount30d} dispute(s) resolved (30d) — open cases route through PO dispute workflow`
          : "No disputes — receiving issues open from marketplace orders page",
  };
}

export function computeTrustReadinessScore(blocks: TrustCapabilityBlock[]): number {
  if (blocks.length === 0) return 0;
  const weights = { ready: 1, partial: 0.5, missing: 0 };
  const total = blocks.reduce((sum, block) => sum + weights[block.status], 0);
  return Math.round((total / blocks.length) * 100);
}

export function buildMarketplaceTrustReport(input: {
  verifiedVendorCount?: number;
  totalVendorCount?: number;
  slaDeliveryScore?: number | null;
  onTimeFulfillmentPct?: number;
  reviewCount?: number;
  avgReviewScore?: number | null;
  openDisputeCount?: number;
  resolvedDisputeCount30d?: number;
}): MarketplaceTrustReport {
  const verifiedVendorCount = input.verifiedVendorCount ?? 0;
  const totalVendorCount = input.totalVendorCount ?? 0;
  const slaDeliveryScore = input.slaDeliveryScore ?? null;
  const onTimeFulfillmentPct = input.onTimeFulfillmentPct ?? 0;
  const reviewCount = input.reviewCount ?? 0;
  const avgReviewScore = input.avgReviewScore ?? null;
  const openDisputeCount = input.openDisputeCount ?? 0;
  const resolvedDisputeCount30d = input.resolvedDisputeCount30d ?? 0;

  const blocks = [
    buildVerifiedBadgeBlock(verifiedVendorCount, totalVendorCount),
    buildSlaBlock(slaDeliveryScore, onTimeFulfillmentPct),
    buildReviewsBlock(reviewCount, avgReviewScore),
    buildDisputeResolutionBlock(openDisputeCount, resolvedDisputeCount30d),
  ];

  return {
    policyId: MARKETPLACE_TRUST_P2_120_POLICY_ID,
    verifiedVendorCount,
    totalVendorCount,
    slaDeliveryScore,
    onTimeFulfillmentPct,
    reviewCount,
    avgReviewScore,
    openDisputeCount,
    resolvedDisputeCount30d,
    blocks,
    readinessScore: computeTrustReadinessScore(blocks),
  };
}

export function buildMarketplaceTrustDemoReport(): MarketplaceTrustReport {
  return buildMarketplaceTrustReport({
    verifiedVendorCount: 5,
    totalVendorCount: 6,
    slaDeliveryScore: 4.2,
    onTimeFulfillmentPct: 87,
    reviewCount: 24,
    avgReviewScore: 4.5,
    openDisputeCount: 1,
    resolvedDisputeCount30d: 3,
  });
}

export function hasActiveTrustSignals(report: MarketplaceTrustReport): boolean {
  return (
    report.verifiedVendorCount > 0 ||
    report.reviewCount > 0 ||
    report.resolvedDisputeCount30d > 0
  );
}
