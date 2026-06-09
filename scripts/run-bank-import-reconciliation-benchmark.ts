/**
 * Bank import reconciliation accuracy — 3 months CSV, category match rate >85%.
 *
 * Usage:
 *   npm run benchmark:bank-import-reconciliation
 *   npm run test:ci:bank-import-reconciliation-benchmark
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  BANK_IMPORT_RECONCILIATION_BENCHMARK_ARTIFACT,
  BANK_IMPORT_RECONCILIATION_BENCHMARK_POLICY_ID,
} from "@/lib/qa/bank-import-reconciliation-benchmark-policy";
import {
  buildBankImportReconciliationCorpus,
  buildBankImportReconciliationCsv,
} from "@/lib/qa/bank-import-reconciliation-corpus";
import { runBankImportReconciliationBenchmark } from "@/lib/qa/bank-import-reconciliation-scoring";

const ROOT = process.cwd();
const artifactPath = join(ROOT, BANK_IMPORT_RECONCILIATION_BENCHMARK_ARTIFACT);

function main(): void {
  const fixtures = buildBankImportReconciliationCorpus();
  const csvText = buildBankImportReconciliationCsv(fixtures);
  const result = runBankImportReconciliationBenchmark(fixtures, csvText);

  const summary = {
    policyId: BANK_IMPORT_RECONCILIATION_BENCHMARK_POLICY_ID,
    generatedAt: new Date().toISOString(),
    mode: "golden-corpus-regression",
    ...result,
  };

  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(
    `[bank-import-reconciliation] ${result.monthCount} months, ${result.transactionCount} tx — CSV parse ${result.csvParseSuccessPct}% category match ${result.categoryMatchPct}% (threshold ${result.thresholdPct}%)`,
  );
  console.log(
    `[bank-import-reconciliation] artifact → ${BANK_IMPORT_RECONCILIATION_BENCHMARK_ARTIFACT}`,
  );

  if (!result.passed) {
    console.error("[bank-import-reconciliation] FAIL — below threshold");
    process.exit(1);
  }

  console.log("[bank-import-reconciliation] PASS");
}

main();
