import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  BANK_IMPORT_RECONCILIATION_BENCHMARK_ARTIFACT,
  BANK_IMPORT_RECONCILIATION_BENCHMARK_NPM_SCRIPT,
  BANK_IMPORT_RECONCILIATION_BENCHMARK_POLICY_ID,
  BANK_IMPORT_RECONCILIATION_BENCHMARK_SCRIPT,
  BANK_IMPORT_RECONCILIATION_BENCHMARK_UNIT_TEST,
  BANK_IMPORT_RECONCILIATION_MIN_CATEGORY_MATCH_PCT,
  BANK_IMPORT_RECONCILIATION_MIN_MONTHS,
  BANK_IMPORT_RECONCILIATION_MIN_TRANSACTIONS,
} from "@/lib/qa/bank-import-reconciliation-benchmark-policy";
import {
  buildBankImportReconciliationCorpus,
  buildBankImportReconciliationCsv,
} from "@/lib/qa/bank-import-reconciliation-corpus";
import {
  runBankImportReconciliationBenchmark,
  scoreBankTransactionCategory,
} from "@/lib/qa/bank-import-reconciliation-scoring";

const ROOT = process.cwd();

describe("bank import reconciliation benchmark (P0-19)", () => {
  it("locks policy id and script paths", () => {
    expect(BANK_IMPORT_RECONCILIATION_BENCHMARK_POLICY_ID).toBe(
      "bank-import-reconciliation-benchmark-v1",
    );
    expect(existsSync(join(ROOT, BANK_IMPORT_RECONCILIATION_BENCHMARK_SCRIPT))).toBe(true);
    expect(BANK_IMPORT_RECONCILIATION_BENCHMARK_UNIT_TEST).toBe(
      "tests/unit/bank-import-reconciliation-benchmark.test.ts",
    );
  });

  it("scores category match per transaction", () => {
    const [fixture] = buildBankImportReconciliationCorpus();
    const score = scoreBankTransactionCategory(fixture!);
    expect(score.categoryMatch).toBe(true);
    expect(score.predictedCategory).toBe(fixture!.expectedCategory);
  });

  it("passes 3-month corpus with 90+ transactions above 85% category match", () => {
    const fixtures = buildBankImportReconciliationCorpus();
    const csv = buildBankImportReconciliationCsv(fixtures);

    expect(fixtures.length).toBeGreaterThanOrEqual(
      BANK_IMPORT_RECONCILIATION_MIN_TRANSACTIONS,
    );
    const months = new Set(fixtures.map((fixture) => fixture.month));
    expect(months.size).toBeGreaterThanOrEqual(BANK_IMPORT_RECONCILIATION_MIN_MONTHS);

    const result = runBankImportReconciliationBenchmark(fixtures, csv);
    expect(result.csvParseSuccessPct).toBeGreaterThanOrEqual(95);
    expect(result.categoryMatchPct).toBeGreaterThanOrEqual(
      BANK_IMPORT_RECONCILIATION_MIN_CATEGORY_MATCH_PCT,
    );
    expect(result.passed).toBe(true);
  });

  it("registers npm benchmark script and artifact path", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[BANK_IMPORT_RECONCILIATION_BENCHMARK_NPM_SCRIPT]).toContain(
      "bank-import-reconciliation-benchmark.test.ts",
    );
    expect(pkg.scripts?.["benchmark:bank-import-reconciliation"]).toContain(
      "run-bank-import-reconciliation-benchmark.ts",
    );
    expect(BANK_IMPORT_RECONCILIATION_BENCHMARK_ARTIFACT).toBe(
      "artifacts/bank-import-reconciliation-benchmark-summary.json",
    );
  });
});
