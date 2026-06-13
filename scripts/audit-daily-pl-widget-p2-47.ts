/**
 * Audit daily P&L widget (Blueprint P2-47).
 *
 * Usage:
 *   npm run audit:daily-pl-widget-p2-47
 */
import {
  auditDailyPlWidgetP2_47,
  formatDailyPlWidgetP2_47AuditLines,
} from "@/lib/finance/daily-pl-widget-p2-47-audit";

function main(): void {
  const summary = auditDailyPlWidgetP2_47();

  console.log("");
  for (const line of formatDailyPlWidgetP2_47AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Daily P&L widget P2-47 OK");
}

main();
