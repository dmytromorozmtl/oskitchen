/**
 * Audit multi-station KDS (Blueprint P2-90).
 *
 * Usage:
 *   npm run audit:multi-station-kds
 */
import {
  auditMultiStationKds,
  formatMultiStationKdsAuditLines,
} from "@/lib/kitchen/multi-station-kds-p2-90-audit";

function main(): void {
  const summary = auditMultiStationKds();

  console.log("");
  for (const line of formatMultiStationKdsAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Multi-station KDS audit OK");
}

main();
