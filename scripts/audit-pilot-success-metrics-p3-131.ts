/**
 * Audit pilot success metrics (Blueprint P3-131).
 *
 * Usage:
 *   npm run audit:pilot-success-metrics-p3-131
 */
import {
  auditPilotSuccessMetrics,
  formatPilotSuccessMetricsAuditLines,
} from "@/lib/pm/pilot-success-metrics-p3-131-audit";

function main(): void {
  const summary = auditPilotSuccessMetrics();

  console.log("");
  for (const line of formatPilotSuccessMetricsAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Pilot success metrics audit OK");
}

main();
