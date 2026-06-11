/**
 * Audit Toast positioning (Blueprint P1-74).
 *
 * Usage:
 *   npm run audit:toast-positioning
 */
import {
  auditToastPositioning,
  formatToastPositioningAuditLines,
} from "@/lib/marketing/toast-positioning-audit";

function main(): void {
  const summary = auditToastPositioning();

  console.log("");
  for (const line of formatToastPositioningAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Toast positioning audit OK");
}

main();
