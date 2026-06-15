/**
 * Audit weekly GO/NO-GO log (Blueprint P3-127).
 *
 * Usage:
 *   npm run audit:weekly-go-no-go-p3-127
 */
import {
  auditWeeklyGoNoGo,
  formatWeeklyGoNoGoAuditLines,
} from "@/lib/pm/weekly-go-no-go-p3-127-audit";

function main(): void {
  const summary = auditWeeklyGoNoGo();

  console.log("");
  for (const line of formatWeeklyGoNoGoAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Weekly GO/NO-GO log audit OK");
}

main();
