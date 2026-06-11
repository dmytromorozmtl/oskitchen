/**
 * Audit Invoice scan → PO → approve E2E wiring.
 *
 * Usage:
 *   npm run audit:invoice-scan-po-approve-e2e
 */
import {
  auditInvoiceScanPoApproveE2E,
  formatInvoiceScanPoApproveAuditLines,
} from "@/lib/qa/invoice-scan-po-approve-e2e-audit";

function main(): void {
  const summary = auditInvoiceScanPoApproveE2E();

  console.log("");
  for (const line of formatInvoiceScanPoApproveAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Invoice scan → PO → approve E2E audit OK");
}

main();
