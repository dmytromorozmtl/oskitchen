/**
 * Audit P2-44 invoice AI accuracy benchmark wiring.
 *
 * Usage:
 *   npm run audit:invoice-ai-accuracy-benchmark-p2-44
 */
import {
  auditInvoiceAiAccuracyBenchmarkP2_44,
  formatInvoiceAiAccuracyBenchmarkP2_44AuditLines,
} from "@/lib/ai/invoice-ai-accuracy-benchmark-p2-44-audit";

function main(): void {
  const summary = auditInvoiceAiAccuracyBenchmarkP2_44();

  console.log("");
  for (const line of formatInvoiceAiAccuracyBenchmarkP2_44AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Invoice AI accuracy benchmark P2-44 audit OK");
}

main();
