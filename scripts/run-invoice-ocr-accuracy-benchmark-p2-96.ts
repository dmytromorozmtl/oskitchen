/**
 * Invoice OCR accuracy benchmark — 100 invoices (Blueprint P2-96).
 *
 * Usage:
 *   npm run benchmark:invoice-ocr-accuracy-p2-96
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_ARTIFACT,
  INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_POLICY_ID,
} from "@/lib/ai/invoice-ocr-accuracy-benchmark-p2-96-policy";
import { loadInvoiceOcrAccuracyBenchmarkP2_96 } from "@/services/ai/invoice-ocr-accuracy-benchmark-p2-96-service";

const ROOT = process.cwd();
const artifactPath = join(ROOT, INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_ARTIFACT);

function main(): void {
  const summary = loadInvoiceOcrAccuracyBenchmarkP2_96();

  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(
    `[invoice-ocr-p2-96] ${summary.invoiceCount} invoices — supplier ${summary.supplierAccuracyPct}% line-items ${summary.lineItemAccuracyPct}% price-variance ${summary.priceVarianceAccuracyPct}% confidence ${summary.avgConfidencePct}%`,
  );
  console.log(
    `[invoice-ocr-p2-96] suppliers tracked: ${summary.supplierBreakdown.length}`,
  );
  console.log(`[invoice-ocr-p2-96] artifact → ${INVOICE_OCR_ACCURACY_BENCHMARK_P2_96_ARTIFACT}`);

  if (!summary.passed) {
    console.error("[invoice-ocr-p2-96] FAIL — accuracy below threshold");
    process.exit(1);
  }

  console.log("[invoice-ocr-p2-96] PASS");
}

main();
