/**
 * Audit bundle budget gate (Blueprint P3-59).
 *
 * Usage:
 *   npm run audit:bundle-budget-gate-p3-59
 */
import {
  auditBundleBudgetGateP3_59,
  formatBundleBudgetGateP3_59AuditLines,
} from "@/lib/qa/bundle-budget-gate-p3-59-audit";

function main(): void {
  const summary = auditBundleBudgetGateP3_59();

  console.log("");
  for (const line of formatBundleBudgetGateP3_59AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Bundle budget gate P3-59 OK");
}

main();
