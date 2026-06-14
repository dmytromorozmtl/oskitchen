import {
  buildMarketplaceComparisonP2_124DemoReport,
  buildMarketplaceComparisonP2_124Report,
  type MarketplaceComparisonP2_124Report,
} from "@/lib/marketplace/marketplace-comparison-p2-124-operations";
import { MARKETPLACE_COMPARISON_P2_124_POLICY_ID } from "@/lib/marketplace/marketplace-comparison-p2-124-policy";
import { MARKETPLACE_COMPARE_SORT_OPTIONS } from "@/lib/marketplace/compare-filters";
import { loadMarketplaceCompare } from "@/services/marketplace/marketplace-compare-service";

export type MarketplaceComparisonP2_124Snapshot = MarketplaceComparisonP2_124Report & {
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadMarketplaceComparisonP2_124Snapshot(): Promise<MarketplaceComparisonP2_124Snapshot> {
  try {
    const compare = await loadMarketplaceCompare({ q: "", products: [], sort: "price_asc" });
    const vendorCount = new Set(compare.rows.map((row) => row.vendorId)).size;

    const report = buildMarketplaceComparisonP2_124Report({
      compareOfferCount: compare.total,
      vendorCount,
      sortOptionCount: MARKETPLACE_COMPARE_SORT_OPTIONS.length,
      trayProductCount: 0,
    });

    return {
      ...report,
      policyId: MARKETPLACE_COMPARISON_P2_124_POLICY_ID,
      mode: "live",
      analyzedAt: new Date().toISOString(),
    };
  } catch {
    // Fall through to demo fixture when DB unavailable.
  }

  return {
    ...buildMarketplaceComparisonP2_124DemoReport(),
    policyId: MARKETPLACE_COMPARISON_P2_124_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
