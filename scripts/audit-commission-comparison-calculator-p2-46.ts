/**
 * Audit commission comparison calculator (Blueprint P2-46).
 *
 * Usage:
 *   npm run audit:commission-comparison-calculator-p2-46
 */
import {
  auditCommissionComparisonCalculatorP2_46,
  formatCommissionComparisonCalculatorP2_46AuditLines,
} from "@/lib/marketing/commission-comparison-calculator-p2-46-audit";

function main(): void {
  const summary = auditCommissionComparisonCalculatorP2_46();

  console.log("");
  for (const line of formatCommissionComparisonCalculatorP2_46AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Commission comparison calculator P2-46 OK");
}

main();
