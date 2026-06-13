/**
 * Audit money actions audit log (Blueprint P3-79).
 *
 * Usage:
 *   npm run audit:money-actions-audit-p3-79
 */
import { auditAllMoneyActions } from "@/lib/audit/money-actions-audit-policy";
import {
  auditMoneyActionsAuditP3_79,
  formatMoneyActionsAuditP3_79AuditLines,
} from "@/lib/audit/money-actions-audit-p3-79-audit";

function main(): void {
  const upstream = auditAllMoneyActions();

  console.log("");
  console.log(`Money actions wiring (${upstream.policyId})`);
  console.log(`Registry entries: ${upstream.reports.length}`);
  console.log(`All wired: ${upstream.passed ? "yes" : "no"}`);
  console.log("");

  const summary = auditMoneyActionsAuditP3_79();

  for (const line of formatMoneyActionsAuditP3_79AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Money actions audit P3-79 OK");
}

main();
