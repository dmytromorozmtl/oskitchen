/**
 * Audit supplier price history (Blueprint P2-103).
 *
 * Usage:
 *   npm run audit:supplier-price-history-p2-103
 */
import {
  auditSupplierPriceHistoryP2_103,
  formatSupplierPriceHistoryP2_103AuditLines,
} from "@/lib/inventory/supplier-price-history-p2-103-audit";

function main(): void {
  const summary = auditSupplierPriceHistoryP2_103();

  console.log("");
  for (const line of formatSupplierPriceHistoryP2_103AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Supplier price history (P2-103) audit OK");
}

main();
