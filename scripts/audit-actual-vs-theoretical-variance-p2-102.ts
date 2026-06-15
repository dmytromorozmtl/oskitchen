/**
 * Audit actual vs theoretical variance (Blueprint P2-102).
 *
 * Usage:
 *   npm run audit:actual-vs-theoretical-variance-p2-102
 */
import {
  auditActualVsTheoreticalVarianceP2_102,
  formatActualVsTheoreticalVarianceP2_102AuditLines,
} from "@/lib/inventory/actual-vs-theoretical-variance-p2-102-audit";

function main(): void {
  const summary = auditActualVsTheoreticalVarianceP2_102();

  console.log("");
  for (const line of formatActualVsTheoreticalVarianceP2_102AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Actual vs theoretical variance (P2-102) audit OK");
}

main();
