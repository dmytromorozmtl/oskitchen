/**
 * Audit positioning reformulation (Blueprint P1-72).
 *
 * Usage:
 *   npm run audit:positioning-reformulation
 */
import {
  auditPositioningReformulation,
  formatPositioningReformulationAuditLines,
} from "@/lib/marketing/positioning-reformulation-audit";

function main(): void {
  const summary = auditPositioningReformulation();

  console.log("");
  for (const line of formatPositioningReformulationAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Positioning reformulation audit OK");
}

main();
