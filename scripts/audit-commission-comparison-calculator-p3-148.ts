/**
 * Audit commission comparison calculator ChowNow baseline (Blueprint P3-148).
 *
 * Usage:
 *   npm run audit:commission-comparison-calculator-p3-148
 */
import {
  auditCommissionComparisonCalculatorP3_148,
  formatCommissionComparisonCalculatorP3_148AuditLines,
} from "@/lib/marketing/commission-comparison-calculator-p3-148-audit";

function main(): void {
  const summary = auditCommissionComparisonCalculatorP3_148();

  console.log("");
  for (const line of formatCommissionComparisonCalculatorP3_148AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Commission comparison calculator ChowNow audit OK");
}

main();
