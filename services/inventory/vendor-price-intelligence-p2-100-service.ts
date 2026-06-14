import {
  buildCheaperVendorRecommendations,
  buildPriceHistoryPoints,
  buildSubstitutionSuggestions,
  buildVendorPriceIntelligenceDemoReport,
  buildVendorPriceIntelligenceReport,
  type VendorPriceIntelligenceReport,
} from "@/lib/inventory/vendor-price-intelligence-p2-100-operations";
import { VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID } from "@/lib/inventory/vendor-price-intelligence-p2-100-policy";
import {
  compareSupplierPricesByIngredient,
  getSupplierPriceHistoryForChart,
} from "@/services/purchasing/supplier-price-history-service";

export type VendorPriceIntelligenceSnapshot = VendorPriceIntelligenceReport & {
  policyId: typeof VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID;
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadVendorPriceIntelligenceSnapshot(
  userId: string,
): Promise<VendorPriceIntelligenceSnapshot> {
  try {
    const [chartPoints, comparisons] = await Promise.all([
      getSupplierPriceHistoryForChart(userId, { months: 6 }),
      compareSupplierPricesByIngredient(userId),
    ]);

    if (chartPoints.length > 0 || comparisons.length > 0) {
      const priceHistory = buildPriceHistoryPoints(
        chartPoints.map((point) => ({
          ingredientId: point.supplierItemId ?? point.ingredientName,
          ingredientName: point.ingredientName,
          supplierName: point.supplierName,
          date: point.date,
          unitPrice: point.price,
        })),
      );

      const substitutions = buildSubstitutionSuggestions(comparisons, []);
      const cheaperVendors = buildCheaperVendorRecommendations(comparisons);

      const report = buildVendorPriceIntelligenceReport({
        priceHistory,
        substitutions,
        cheaperVendors,
      });

      return {
        policyId: VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
        ...report,
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildVendorPriceIntelligenceDemoReport();

  return {
    policyId: VENDOR_PRICE_INTELLIGENCE_P2_100_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
    ...report,
  };
}
