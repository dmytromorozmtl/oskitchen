/**
 * Audit labor cost widget (Blueprint P2-49).
 *
 * Usage:
 *   npm run audit:labor-cost-widget-p2-49
 */
import {
  auditLaborCostWidgetP2_49,
  formatLaborCostWidgetP2_49AuditLines,
} from "@/lib/staff/labor-cost-widget-p2-49-audit";

function main(): void {
  const summary = auditLaborCostWidgetP2_49();

  console.log("");
  for (const line of formatLaborCostWidgetP2_49AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Labor cost widget P2-49 OK");
}

main();
