/**
 * Audit accounting depth R365 baseline (Blueprint P3-149).
 *
 * Usage:
 *   npm run audit:accounting-depth-p3-149
 */
import {
  auditAccountingDepthP3_149,
  formatAccountingDepthP3_149AuditLines,
} from "@/lib/accounting/accounting-depth-p3-149-audit";

function main(): void {
  const summary = auditAccountingDepthP3_149();

  console.log("");
  for (const line of formatAccountingDepthP3_149AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Accounting depth R365 audit OK");
}

main();
