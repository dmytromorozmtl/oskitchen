/**
 * Pure helpers for vendor analytics (Blueprint P2-119).
 */

import { VENDOR_ANALYTICS_P2_119_POLICY_ID } from "@/lib/marketplace/vendor-analytics-p2-119-policy";

export type VendorAnalyticsCapabilityBlock = {
  id: string;
  label: string;
  status: "ready" | "partial" | "missing";
  summary: string;
  count: number;
};

export type VendorAnalyticsReport = {
  policyId: typeof VENDOR_ANALYTICS_P2_119_POLICY_ID;
  topProductCount: number;
  topProductRevenueUsd: number;
  repeatBuyerRatePct: number;
  repeatBuyerCount: number;
  lostCartCount: number;
  lostCartValueUsd: number;
  competitiveSkuCount: number;
  uncompetitiveSkuCount: number;
  blocks: VendorAnalyticsCapabilityBlock[];
  readinessScore: number;
};

function blockStatus(count: number, threshold = 3): "ready" | "partial" | "missing" {
  if (count >= threshold) return "ready";
  if (count >= 1) return "partial";
  return "missing";
}

export function buildTopProductsBlock(
  topProductCount: number,
  topProductRevenueUsd: number,
): VendorAnalyticsCapabilityBlock {
  return {
    id: "top-products",
    label: "Top products",
    status: blockStatus(topProductCount),
    count: topProductCount,
    summary:
      topProductCount > 0
        ? `${topProductCount} ranked SKU(s) · $${topProductRevenueUsd.toFixed(2)} top-line revenue — verify stock before promoting`
        : "No product performance data — activate catalog SKUs to rank sales",
  };
}

export function buildRepeatBuyersBlock(
  repeatBuyerRatePct: number,
  repeatBuyerCount: number,
): VendorAnalyticsCapabilityBlock {
  return {
    id: "repeat-buyers",
    label: "Repeat buyers",
    status: repeatBuyerRatePct >= 30 ? "ready" : repeatBuyerRatePct > 0 ? "partial" : "missing",
    count: repeatBuyerCount,
    summary:
      repeatBuyerCount > 0
        ? `${repeatBuyerRatePct}% repeat rate · ${repeatBuyerCount} returning workspace(s) — typical retention signal`
        : "No repeat buyers yet — retention appears after second PO from same workspace",
  };
}

export function buildLostCartsBlock(
  lostCartCount: number,
  lostCartValueUsd: number,
): VendorAnalyticsCapabilityBlock {
  return {
    id: "lost-carts",
    label: "Lost carts",
    status: lostCartCount > 0 ? "partial" : "ready",
    count: lostCartCount,
    summary:
      lostCartCount > 0
        ? `${lostCartCount} abandoned cart/PO signal(s) · ~$${lostCartValueUsd.toFixed(2)} at risk — follow up before expiry`
        : "No lost carts detected — draft POs and cart lines with vendor SKUs appear here",
  };
}

export function buildPriceCompetitivenessBlock(
  competitiveSkuCount: number,
  uncompetitiveSkuCount: number,
): VendorAnalyticsCapabilityBlock {
  const total = competitiveSkuCount + uncompetitiveSkuCount;
  return {
    id: "price-competitiveness",
    label: "Price competitiveness",
    status: blockStatus(competitiveSkuCount),
    count: competitiveSkuCount,
    summary:
      total > 0
        ? `${competitiveSkuCount}/${total} SKU(s) at best price — ${uncompetitiveSkuCount} need repricing vs compare lane`
        : "No competitive pricing data — GTIN-matched compare rows required for signals",
  };
}

export function computeVendorAnalyticsReadinessScore(
  blocks: VendorAnalyticsCapabilityBlock[],
): number {
  if (blocks.length === 0) return 0;
  const weights = { ready: 1, partial: 0.5, missing: 0 };
  const total = blocks.reduce((sum, block) => sum + weights[block.status], 0);
  return Math.round((total / blocks.length) * 100);
}

export function buildVendorAnalyticsReport(input: {
  topProductCount?: number;
  topProductRevenueUsd?: number;
  repeatBuyerRatePct?: number;
  repeatBuyerCount?: number;
  lostCartCount?: number;
  lostCartValueUsd?: number;
  competitiveSkuCount?: number;
  uncompetitiveSkuCount?: number;
}): VendorAnalyticsReport {
  const topProductCount = input.topProductCount ?? 0;
  const topProductRevenueUsd = input.topProductRevenueUsd ?? 0;
  const repeatBuyerRatePct = input.repeatBuyerRatePct ?? 0;
  const repeatBuyerCount = input.repeatBuyerCount ?? 0;
  const lostCartCount = input.lostCartCount ?? 0;
  const lostCartValueUsd = input.lostCartValueUsd ?? 0;
  const competitiveSkuCount = input.competitiveSkuCount ?? 0;
  const uncompetitiveSkuCount = input.uncompetitiveSkuCount ?? 0;

  const blocks = [
    buildTopProductsBlock(topProductCount, topProductRevenueUsd),
    buildRepeatBuyersBlock(repeatBuyerRatePct, repeatBuyerCount),
    buildLostCartsBlock(lostCartCount, lostCartValueUsd),
    buildPriceCompetitivenessBlock(competitiveSkuCount, uncompetitiveSkuCount),
  ];

  return {
    policyId: VENDOR_ANALYTICS_P2_119_POLICY_ID,
    topProductCount,
    topProductRevenueUsd,
    repeatBuyerRatePct,
    repeatBuyerCount,
    lostCartCount,
    lostCartValueUsd,
    competitiveSkuCount,
    uncompetitiveSkuCount,
    blocks,
    readinessScore: computeVendorAnalyticsReadinessScore(blocks),
  };
}

export function buildVendorAnalyticsDemoReport(): VendorAnalyticsReport {
  return buildVendorAnalyticsReport({
    topProductCount: 8,
    topProductRevenueUsd: 12450.75,
    repeatBuyerRatePct: 42,
    repeatBuyerCount: 6,
    lostCartCount: 3,
    lostCartValueUsd: 890.2,
    competitiveSkuCount: 12,
    uncompetitiveSkuCount: 4,
  });
}

export function hasActiveVendorAnalytics(report: VendorAnalyticsReport): boolean {
  return report.topProductCount > 0 || report.repeatBuyerCount > 0 || report.competitiveSkuCount > 0;
}
