/**
 * Audit scheduled reports (Blueprint P2-48).
 *
 * Usage:
 *   npm run audit:scheduled-reports-p2-48
 */
import {
  auditScheduledReportsP2_48,
  formatScheduledReportsP2_48AuditLines,
} from "@/lib/analytics/scheduled-reports-p2-48-audit";

function main(): void {
  const summary = auditScheduledReportsP2_48();

  console.log("");
  for (const line of formatScheduledReportsP2_48AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Scheduled reports P2-48 OK");
}

main();
