/**
 * Audit AI invoice accuracy regression wiring (50+ invoices, 95% gate).
 *
 * Usage:
 *   npm run audit:ai-invoice-accuracy-regression
 */
import {
  auditAiInvoiceAccuracyRegression,
  formatAiInvoiceAccuracyRegressionAuditLines,
} from "@/lib/qa/ai-invoice-accuracy-regression-audit";

function main(): void {
  const summary = auditAiInvoiceAccuracyRegression();

  console.log("");
  for (const line of formatAiInvoiceAccuracyRegressionAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ AI invoice accuracy regression audit OK");
}

main();
