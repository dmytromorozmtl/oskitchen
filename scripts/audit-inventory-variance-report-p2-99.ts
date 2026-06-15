/**
 * Audit inventory variance report (Blueprint P2-99).
 *
 * Usage:
 *   npm run audit:inventory-variance-report-p2-99
 */
import {
  auditInventoryVarianceReportP2_99,
  formatInventoryVarianceReportP2_99AuditLines,
} from "@/lib/inventory/inventory-variance-report-p2-99-audit";

function main(): void {
  const summary = auditInventoryVarianceReportP2_99();

  console.log("");
  for (const line of formatInventoryVarianceReportP2_99AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Inventory variance report (P2-99) audit OK");
}

main();
