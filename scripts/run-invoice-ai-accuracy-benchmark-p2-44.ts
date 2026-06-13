/**
 * P2-44 invoice AI accuracy benchmark — 50 invoices, accuracy <95% = fail.
 *
 * Usage:
 *   npm run benchmark:invoice-ai-accuracy-p2-44
 *   npm run test:ci:invoice-ai-accuracy-benchmark-p2-44
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_ARTIFACT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_POLICY_ID,
} from "@/lib/ai/invoice-ai-accuracy-benchmark-p2-44-policy";
import {
  buildInvoiceAiAccuracyBenchmarkCorpusP2_44,
  runInvoiceAiAccuracyBenchmarkP2_44,
} from "@/lib/ai/invoice-ai-accuracy-benchmark-p2-44-scoring";

const ROOT = process.cwd();
const artifactPath = join(ROOT, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_ARTIFACT);

function main(): void {
  const fixtures = buildInvoiceAiAccuracyBenchmarkCorpusP2_44();
  const result = runInvoiceAiAccuracyBenchmarkP2_44(fixtures);

  const summary = {
    policyId: INVOICE_AI_ACCURACY_BENCHMARK_P2_44_POLICY_ID,
    generatedAt: new Date().toISOString(),
    mode: "golden-corpus-benchmark-95-p2-44",
    ...result,
  };

  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(
    `[invoice-ai-accuracy-p2-44] ${result.invoiceCount} invoices — supplier ${result.supplierAccuracyPct}% amount ${result.amountAccuracyPct}% line-items ${result.lineItemAccuracyPct}% overall ${result.overallAccuracyPct}% (threshold ${result.thresholdPct}%)`,
  );
  console.log(
    `[invoice-ai-accuracy-p2-44] artifact → ${INVOICE_AI_ACCURACY_BENCHMARK_P2_44_ARTIFACT}`,
  );

  if (!result.passed) {
    console.error(
      `[invoice-ai-accuracy-p2-44] FAIL — accuracy below ${result.thresholdPct}% benchmark gate`,
    );
    process.exit(1);
  }

  console.log("[invoice-ai-accuracy-p2-44] PASS");
}

main();
