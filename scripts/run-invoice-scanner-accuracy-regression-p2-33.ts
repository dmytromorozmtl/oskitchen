/**
 * P2-33 invoice scanner accuracy regression — 50 invoices, accuracy <80% = fail.
 *
 * Usage:
 *   npm run regression:invoice-scanner-accuracy-p2-33
 *   npm run test:ci:invoice-scanner-accuracy-regression-p2-33
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_ARTIFACT,
  INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_POLICY_ID,
} from "@/lib/qa/invoice-scanner-accuracy-regression-p2-33-policy";
import {
  buildInvoiceScannerAccuracyCorpusP2_33,
  runInvoiceScannerAccuracyRegressionP2_33,
} from "@/lib/qa/invoice-scanner-accuracy-regression-p2-33-scoring";

const ROOT = process.cwd();
const artifactPath = join(ROOT, INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_ARTIFACT);

function main(): void {
  const fixtures = buildInvoiceScannerAccuracyCorpusP2_33();
  const result = runInvoiceScannerAccuracyRegressionP2_33(fixtures);

  const summary = {
    policyId: INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_POLICY_ID,
    generatedAt: new Date().toISOString(),
    mode: "golden-corpus-regression-80-p2-33",
    ...result,
  };

  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(
    `[invoice-scanner-accuracy-p2-33] ${result.invoiceCount} invoices — supplier ${result.supplierAccuracyPct}% amount ${result.amountAccuracyPct}% line-items ${result.lineItemAccuracyPct}% overall ${result.overallAccuracyPct}% (threshold ${result.thresholdPct}%)`,
  );
  console.log(
    `[invoice-scanner-accuracy-p2-33] artifact → ${INVOICE_SCANNER_ACCURACY_REGRESSION_P2_33_ARTIFACT}`,
  );

  if (!result.passed) {
    console.error(
      `[invoice-scanner-accuracy-p2-33] FAIL — accuracy below ${result.thresholdPct}% regression gate`,
    );
    process.exit(1);
  }

  console.log("[invoice-scanner-accuracy-p2-33] PASS");
}

main();
