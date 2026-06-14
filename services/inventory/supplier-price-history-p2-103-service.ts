import {
  buildIngredientGraphSeries,
  buildMultiSupplierTrendRows,
  buildPriceChangeSummaryRows,
  buildSupplierPriceHistoryDemoReport,
  buildSupplierPriceHistoryReport,
  type SupplierPriceHistoryReport,
} from "@/lib/inventory/supplier-price-history-p2-103-operations";
import { SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID } from "@/lib/inventory/supplier-price-history-p2-103-policy";
import { getSupplierPriceHistoryForChart } from "@/services/purchasing/supplier-price-history-service";

export type SupplierPriceHistorySnapshot = SupplierPriceHistoryReport & {
  policyId: typeof SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID;
  mode: "live" | "demo";
  analyzedAt: string;
};

export async function loadSupplierPriceHistorySnapshot(
  userId: string,
): Promise<SupplierPriceHistorySnapshot> {
  try {
    const chartPoints = await getSupplierPriceHistoryForChart(userId, { months: 6 });

    if (chartPoints.length > 0) {
      const normalized = chartPoints.map((point) => ({
        ingredientId: point.supplierItemId ?? point.ingredientName,
        ingredientName: point.ingredientName,
        date: point.date,
        price: point.price,
        supplierName: point.supplierName,
      }));

      const ingredientGraphs = buildIngredientGraphSeries(normalized);
      const multiSupplierTrends = buildMultiSupplierTrendRows(normalized);
      const priceChangeSummaries = buildPriceChangeSummaryRows(normalized);

      const report = buildSupplierPriceHistoryReport({
        ingredientGraphs,
        multiSupplierTrends,
        priceChangeSummaries,
      });

      return {
        policyId: SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID,
        mode: "live",
        analyzedAt: new Date().toISOString(),
        ...report,
      };
    }
  } catch {
    // Fall through to demo fixture
  }

  const report = buildSupplierPriceHistoryDemoReport();

  return {
    policyId: SUPPLIER_PRICE_HISTORY_P2_103_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
    ...report,
  };
}
