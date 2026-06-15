import type { InventoryCountVarianceSummary } from "@/services/inventory/count-service";

/** Display net dollar variance for count list cells. */
export function formatCountNetVarianceCost(summary: InventoryCountVarianceSummary): string {
  if (summary.linesCounted === 0) {
    return "—";
  }
  const amount = Math.abs(summary.totalVarianceCost);
  const prefix = summary.totalVarianceCost < 0 ? "−" : summary.totalVarianceCost > 0 ? "+" : "";
  return `${prefix}$${amount.toFixed(2)}`;
}
