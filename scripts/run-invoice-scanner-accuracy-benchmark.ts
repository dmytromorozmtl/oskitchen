/**
 * Invoice scanner accuracy benchmark — 50+ invoices, >85% supplier/amount/line-item accuracy.
 *
 * Usage:
 *   npm run benchmark:invoice-scanner-accuracy
 *   npm run test:ci:invoice-scanner-accuracy-benchmark
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  INVOICE_SCANNER_ACCURACY_BENCHMARK_ARTIFACT,
  INVOICE_SCANNER_ACCURACY_BENCHMARK_POLICY_ID,
} from "@/lib/qa/invoice-scanner-accuracy-benchmark-policy";
import { buildInvoiceScannerAccuracyCorpus } from "@/lib/qa/invoice-scanner-accuracy-corpus";
import { runInvoiceScannerAccuracyBenchmark } from "@/lib/qa/invoice-scanner-accuracy-scoring";

const ROOT = process.cwd();
const artifactPath = join(ROOT, INVOICE_SCANNER_ACCURACY_BENCHMARK_ARTIFACT);

function main(): void {
  const fixtures = buildInvoiceScannerAccuracyCorpus();
  const result = runInvoiceScannerAccuracyBenchmark(fixtures);

  const summary = {
    policyId: INVOICE_SCANNER_ACCURACY_BENCHMARK_POLICY_ID,
    generatedAt: new Date().toISOString(),
    mode: "golden-corpus-regression",
    ...result,
  };

  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(
    `[invoice-scanner-accuracy] ${result.invoiceCount} invoices — supplier ${result.supplierAccuracyPct}% amount ${result.amountAccuracyPct}% line-items ${result.lineItemAccuracyPct}% overall ${result.overallAccuracyPct}% (threshold ${result.thresholdPct}%)`,
  );
  console.log(`[invoice-scanner-accuracy] artifact → ${INVOICE_SCANNER_ACCURACY_BENCHMARK_ARTIFACT}`);

  if (!result.passed) {
    console.error("[invoice-scanner-accuracy] FAIL — accuracy below threshold");
    process.exit(1);
  }

  console.log("[invoice-scanner-accuracy] PASS");
}

main();
