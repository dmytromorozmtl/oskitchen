/**
 * Audit Bank import → reconcile E2E wiring.
 *
 * Usage:
 *   npm run audit:bank-import-reconcile-e2e
 */
import {
  auditBankImportReconcileE2E,
  formatBankImportReconcileAuditLines,
} from "@/lib/qa/bank-import-reconcile-e2e-audit";

function main(): void {
  const summary = auditBankImportReconcileE2E();

  console.log("");
  for (const line of formatBankImportReconcileAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Bank import → reconcile E2E audit OK");
}

main();
