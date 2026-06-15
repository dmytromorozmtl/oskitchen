/**
 * Audit bus factor PM baseline (Blueprint P3-134).
 *
 * Usage:
 *   npm run audit:bus-factor-p3-134
 */
import {
  auditBusFactorP3_134,
  formatBusFactorP3_134AuditLines,
} from "@/lib/pm/bus-factor-p3-134-audit";

function main(): void {
  const summary = auditBusFactorP3_134();

  console.log("");
  for (const line of formatBusFactorP3_134AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Bus factor PM audit OK");
}

main();
