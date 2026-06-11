/**
 * AI invoice accuracy regression — 50+ invoices, accuracy <95% = fail.
 *
 * Usage:
 *   npm run regression:ai-invoice-accuracy
 *   npm run test:ci:ai-invoice-accuracy-regression
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  AI_INVOICE_ACCURACY_REGRESSION_ARTIFACT,
  AI_INVOICE_ACCURACY_REGRESSION_POLICY_ID,
} from "@/lib/qa/ai-invoice-accuracy-regression-policy";
import { runAiInvoiceAccuracyRegression } from "@/lib/qa/ai-invoice-accuracy-regression-scoring";
import { buildInvoiceScannerAccuracyCorpus } from "@/lib/qa/invoice-scanner-accuracy-corpus";

const ROOT = process.cwd();
const artifactPath = join(ROOT, AI_INVOICE_ACCURACY_REGRESSION_ARTIFACT);

function main(): void {
  const fixtures = buildInvoiceScannerAccuracyCorpus();
  const result = runAiInvoiceAccuracyRegression(fixtures);

  const summary = {
    policyId: AI_INVOICE_ACCURACY_REGRESSION_POLICY_ID,
    generatedAt: new Date().toISOString(),
    mode: "golden-corpus-regression-95",
    ...result,
  };

  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(
    `[ai-invoice-accuracy-regression] ${result.invoiceCount} invoices — supplier ${result.supplierAccuracyPct}% amount ${result.amountAccuracyPct}% line-items ${result.lineItemAccuracyPct}% overall ${result.overallAccuracyPct}% (threshold ${result.thresholdPct}%)`,
  );
  console.log(
    `[ai-invoice-accuracy-regression] artifact → ${AI_INVOICE_ACCURACY_REGRESSION_ARTIFACT}`,
  );

  if (!result.passed) {
    console.error(
      `[ai-invoice-accuracy-regression] FAIL — accuracy below ${result.thresholdPct}% regression gate`,
    );
    process.exit(1);
  }

  console.log("[ai-invoice-accuracy-regression] PASS");
}

main();
