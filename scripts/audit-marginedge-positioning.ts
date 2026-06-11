/**
 * Audit MarginEdge positioning (Blueprint P1-78).
 *
 * Usage:
 *   npm run audit:marginedge-positioning
 */
import {
  auditMarginedgePositioning,
  formatMarginedgePositioningAuditLines,
} from "@/lib/marketing/marginedge-positioning-audit";

function main(): void {
  const summary = auditMarginedgePositioning();

  console.log("");
  for (const line of formatMarginedgePositioningAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ MarginEdge positioning audit OK");
}

main();
