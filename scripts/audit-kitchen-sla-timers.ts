/**
 * Audit kitchen SLA timers (Blueprint P2-92).
 *
 * Usage:
 *   npm run audit:kitchen-sla-timers
 */
import {
  auditKitchenSlaTimers,
  formatKitchenSlaTimersAuditLines,
} from "@/lib/kitchen/kitchen-sla-timers-p2-92-audit";

function main(): void {
  const summary = auditKitchenSlaTimers();

  console.log("");
  for (const line of formatKitchenSlaTimersAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Kitchen SLA timers audit OK");
}

main();
