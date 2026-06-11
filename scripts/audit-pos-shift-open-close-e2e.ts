/**
 * Audit POS shift open → close E2E wiring.
 *
 * Usage:
 *   npm run audit:pos-shift-open-close-e2e
 */
import {
  auditPosShiftOpenCloseE2E,
  formatPosShiftOpenCloseAuditLines,
} from "@/lib/qa/pos-shift-open-close-e2e-audit";

function main(): void {
  const summary = auditPosShiftOpenCloseE2E();

  console.log("");
  for (const line of formatPosShiftOpenCloseAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ POS shift open → close E2E audit OK");
}

main();
