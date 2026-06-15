/**
 * Audit commission-free ordering messaging (Blueprint P2-113).
 *
 * Usage:
 *   npm run audit:commission-free-ordering-p2-113
 */
import {
  auditCommissionFreeOrderingP2_113,
  formatCommissionFreeOrderingP2_113AuditLines,
} from "@/lib/marketing/commission-free-ordering-p2-113-audit";

function main(): void {
  const summary = auditCommissionFreeOrderingP2_113();

  console.log("");
  for (const line of formatCommissionFreeOrderingP2_113AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Commission-free ordering (P2-113) audit OK");
}

main();
