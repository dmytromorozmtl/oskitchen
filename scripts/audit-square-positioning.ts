/**
 * Audit Square positioning (Blueprint P1-75).
 *
 * Usage:
 *   npm run audit:square-positioning
 */
import {
  auditSquarePositioning,
  formatSquarePositioningAuditLines,
} from "@/lib/marketing/square-positioning-audit";

function main(): void {
  const summary = auditSquarePositioning();

  console.log("");
  for (const line of formatSquarePositioningAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Square positioning audit OK");
}

main();
