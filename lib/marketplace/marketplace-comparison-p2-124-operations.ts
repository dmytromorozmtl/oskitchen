/**
 * Pure helpers for marketplace comparison tool (Blueprint P2-124).
 */

import { MARKETPLACE_COMPARISON_P2_124_POLICY_ID } from "@/lib/marketplace/marketplace-comparison-p2-124-policy";

export type ComparisonCapabilityBlock = {
  id: string;
  label: string;
  status: "ready" | "partial" | "missing";
  summary: string;
  count: number;
};

export type MarketplaceComparisonP2_124Report = {
  policyId: typeof MARKETPLACE_COMPARISON_P2_124_POLICY_ID;
  compareOfferCount: number;
  vendorCount: number;
  sortOptionCount: number;
  trayProductCount: number;
  blocks: ComparisonCapabilityBlock[];
  readinessScore: number;
};

function blockStatus(count: number, minReady = 3): "ready" | "partial" | "missing" {
  if (count >= minReady) return "ready";
  if (count >= 1) return "partial";
  return "missing";
}

export function buildSideBySideBlock(
  compareOfferCount: number,
  vendorCount: number,
): ComparisonCapabilityBlock {
  const status =
    compareOfferCount >= 2 && vendorCount >= 2
      ? "ready"
      : compareOfferCount >= 1
        ? "partial"
        : "missing";
  return {
    id: "side-by-side",
    label: "Side-by-side table",
    status,
    count: compareOfferCount,
    summary:
      compareOfferCount >= 2
        ? `${compareOfferCount} offer(s) across ${vendorCount} vendor(s) — side-by-side up to 4 columns`
        : compareOfferCount === 1
          ? "1 offer found — add more SKUs from catalog to enable side-by-side"
          : "No offers — search by name or GTIN on compare page",
  };
}

export function buildSearchMatchBlock(compareOfferCount: number): ComparisonCapabilityBlock {
  return {
    id: "search-match",
    label: "Name / GTIN search",
    status: blockStatus(compareOfferCount, 1),
    count: compareOfferCount,
    summary:
      compareOfferCount > 0
        ? `${compareOfferCount} matching offer(s) — verify GTIN match before switching vendors`
        : "No search matches — try product name, SKU, or 8–14 digit GTIN",
  };
}

export function buildMultiSortBlock(
  compareOfferCount: number,
  sortOptionCount: number,
): ComparisonCapabilityBlock {
  return {
    id: "multi-sort",
    label: "Multi-column sort",
    status: sortOptionCount >= 5 ? (compareOfferCount >= 2 ? "ready" : "partial") : "missing",
    count: sortOptionCount,
    summary:
      sortOptionCount >= 5
        ? `${sortOptionCount} sort options wired — price, rating, delivery, MOQ`
        : "Sort options incomplete — verify compare-filters wiring",
  };
}

export function buildCompareTrayBlock(trayProductCount: number): ComparisonCapabilityBlock {
  return {
    id: "compare-tray",
    label: "Catalog compare tray",
    status: trayProductCount >= 2 ? "ready" : trayProductCount >= 1 ? "partial" : "missing",
    count: trayProductCount,
    summary:
      trayProductCount >= 2
        ? `${trayProductCount} SKU(s) in compare tray — open compare page for side-by-side`
        : trayProductCount === 1
          ? "1 SKU in tray — add another from catalog for side-by-side"
          : "Compare tray empty — use Compare on catalog product cards",
  };
}

export function computeComparisonReadinessScore(blocks: ComparisonCapabilityBlock[]): number {
  if (blocks.length === 0) return 0;
  const weights = { ready: 1, partial: 0.5, missing: 0 };
  const total = blocks.reduce((sum, block) => sum + weights[block.status], 0);
  return Math.round((total / blocks.length) * 100);
}

export function buildMarketplaceComparisonP2_124Report(input: {
  compareOfferCount?: number;
  vendorCount?: number;
  sortOptionCount?: number;
  trayProductCount?: number;
}): MarketplaceComparisonP2_124Report {
  const compareOfferCount = input.compareOfferCount ?? 0;
  const vendorCount = input.vendorCount ?? 0;
  const sortOptionCount = input.sortOptionCount ?? 0;
  const trayProductCount = input.trayProductCount ?? 0;

  const blocks = [
    buildSideBySideBlock(compareOfferCount, vendorCount),
    buildSearchMatchBlock(compareOfferCount),
    buildMultiSortBlock(compareOfferCount, sortOptionCount),
    buildCompareTrayBlock(trayProductCount),
  ];

  return {
    policyId: MARKETPLACE_COMPARISON_P2_124_POLICY_ID,
    compareOfferCount,
    vendorCount,
    sortOptionCount,
    trayProductCount,
    blocks,
    readinessScore: computeComparisonReadinessScore(blocks),
  };
}

export function buildMarketplaceComparisonP2_124DemoReport(): MarketplaceComparisonP2_124Report {
  return buildMarketplaceComparisonP2_124Report({
    compareOfferCount: 12,
    vendorCount: 4,
    sortOptionCount: 5,
    trayProductCount: 3,
  });
}

export function hasActiveComparison(report: MarketplaceComparisonP2_124Report): boolean {
  return report.compareOfferCount >= 2 || report.trayProductCount >= 2;
}
