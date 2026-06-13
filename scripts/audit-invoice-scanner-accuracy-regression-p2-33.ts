/**
 * Audit P2-33 invoice scanner accuracy regression wiring.
 *
 * Usage:
 *   npm run audit:invoice-scanner-accuracy-regression-p2-33
 */
import {
  auditInvoiceScannerAccuracyRegressionP2_33,
  formatInvoiceScannerAccuracyRegressionP2_33AuditLines,
} from "@/lib/qa/invoice-scanner-accuracy-regression-p2-33-audit";

function main(): void {
  const summary = auditInvoiceScannerAccuracyRegressionP2_33();

  console.log("");
  for (const line of formatInvoiceScannerAccuracyRegressionP2_33AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Invoice scanner accuracy regression P2-33 audit OK");
}

main();
