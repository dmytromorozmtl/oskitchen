/**
 * Audit bump/recall audit (Blueprint P2-91).
 *
 * Usage:
 *   npm run audit:bump-recall-audit
 */
import {
  auditBumpRecallAudit,
  formatBumpRecallAuditAuditLines,
} from "@/lib/kitchen/bump-recall-audit-p2-91-audit";

function main(): void {
  const summary = auditBumpRecallAudit();

  console.log("");
  for (const line of formatBumpRecallAuditAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Bump/recall audit OK");
}

main();
