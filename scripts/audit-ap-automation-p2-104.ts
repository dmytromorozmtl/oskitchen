/**
 * Audit AP automation (Blueprint P2-104).
 *
 * Usage:
 *   npm run audit:ap-automation-p2-104
 */
import {
  auditApAutomationP2_104,
  formatApAutomationP2_104AuditLines,
} from "@/lib/accounting/ap-automation-p2-104-audit";

function main(): void {
  const summary = auditApAutomationP2_104();

  console.log("");
  for (const line of formatApAutomationP2_104AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ AP automation (P2-104) audit OK");
}

main();
