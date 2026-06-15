/**
 * Audit invoice OCR accuracy benchmark (Blueprint P2-96).
 *
 * Usage:
 *   npm run audit:invoice-ocr-accuracy-benchmark-p2-96
 */
import {
  auditInvoiceOcrAccuracyBenchmarkP2_96,
  formatInvoiceOcrAccuracyBenchmarkP2_96AuditLines,
} from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-audit";

function main(): void {
  const summary = auditInvoiceOcrAccuracyBenchmarkP2_96();

  console.log("");
  for (const line of formatInvoiceOcrAccuracyBenchmarkP2_96AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Invoice OCR accuracy benchmark (P2-96) audit OK");
}

main();
