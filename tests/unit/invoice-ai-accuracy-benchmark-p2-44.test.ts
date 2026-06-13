import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditInvoiceAiAccuracyBenchmarkP2_44 } from "@/lib/ai/invoice-ai-accuracy-benchmark-p2-44-audit";
import {
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_ARTIFACT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_AUDIT_SCRIPT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_BENCHMARK_NPM_SCRIPT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_CHECK_NPM_SCRIPT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_CI_WORKFLOW,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_DOC,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_FLOW_STEPS,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_INVOICE_COUNT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_NPM_SCRIPT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_POLICY_ID,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_RUN_SCRIPT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_UNIT_TEST,
  isInvoiceAiAccuracyBenchmarkP2_44Fail,
  isInvoiceAiAccuracyBenchmarkP2_44Pass,
} from "@/lib/ai/invoice-ai-accuracy-benchmark-p2-44-policy";
import {
  buildDegradedInvoiceBenchmarkP2_44Fixtures,
  buildInvoiceAiAccuracyBenchmarkCorpusP2_44,
  runInvoiceAiAccuracyBenchmarkP2_44,
} from "@/lib/ai/invoice-ai-accuracy-benchmark-p2-44-scoring";

const ROOT = process.cwd();

describe("Invoice AI accuracy benchmark (P2-44)", () => {
  it("locks policy id, 50 invoices, and 95% benchmark gate", () => {
    expect(INVOICE_AI_ACCURACY_BENCHMARK_P2_44_POLICY_ID).toBe(
      "invoice-ai-accuracy-benchmark-p2-44-v1",
    );
    expect(INVOICE_AI_ACCURACY_BENCHMARK_P2_44_INVOICE_COUNT).toBe(50);
    expect(INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT).toBe(95);
    expect(INVOICE_AI_ACCURACY_BENCHMARK_P2_44_FLOW_STEPS).toEqual([
      "load_corpus_50",
      "score_all_invoices",
      "assert_benchmark_threshold_95",
    ]);
  });

  it("passes golden corpus with exactly 50 invoices at 100% (above 95% gate)", () => {
    const fixtures = buildInvoiceAiAccuracyBenchmarkCorpusP2_44();
    expect(fixtures.length).toBe(INVOICE_AI_ACCURACY_BENCHMARK_P2_44_INVOICE_COUNT);

    const result = runInvoiceAiAccuracyBenchmarkP2_44(fixtures);
    expect(result.supplierAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT,
    );
    expect(result.amountAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT,
    );
    expect(result.lineItemAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT,
    );
    expect(result.overallAccuracyPct).toBeGreaterThanOrEqual(
      INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT,
    );
    expect(result.passed).toBe(true);
  });

  it("fails benchmark when accuracy drops below 95%", () => {
    const fixtures = buildInvoiceAiAccuracyBenchmarkCorpusP2_44();
    const degraded = buildDegradedInvoiceBenchmarkP2_44Fixtures(fixtures, 3);
    const result = runInvoiceAiAccuracyBenchmarkP2_44(degraded);

    expect(result.supplierAccuracyPct).toBeLessThan(
      INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT,
    );
    expect(result.passed).toBe(false);
    expect(isInvoiceAiAccuracyBenchmarkP2_44Fail(result.supplierAccuracyPct)).toBe(true);
    expect(isInvoiceAiAccuracyBenchmarkP2_44Pass(100)).toBe(true);
  });

  it("passes full invoice AI accuracy benchmark audit", () => {
    const summary = auditInvoiceAiAccuracyBenchmarkP2_44(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.runScriptPresent).toBe(true);
    expect(summary.scoringWired).toBe(true);
    expect(summary.corpusCount).toBe(INVOICE_AI_ACCURACY_BENCHMARK_P2_44_INVOICE_COUNT);
    expect(summary.thresholdPct).toBe(95);
    expect(summary.goldenPassed).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm scripts, and deploy gate", () => {
    expect(existsSync(join(ROOT, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_RUN_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_DOC))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[INVOICE_AI_ACCURACY_BENCHMARK_P2_44_NPM_SCRIPT]).toContain(
      "audit-invoice-ai-accuracy-benchmark-p2-44.ts",
    );
    expect(pkg.scripts?.[INVOICE_AI_ACCURACY_BENCHMARK_P2_44_CHECK_NPM_SCRIPT]).toContain(
      INVOICE_AI_ACCURACY_BENCHMARK_P2_44_UNIT_TEST,
    );
    expect(pkg.scripts?.[INVOICE_AI_ACCURACY_BENCHMARK_P2_44_BENCHMARK_NPM_SCRIPT]).toContain(
      "run-invoice-ai-accuracy-benchmark-p2-44.ts",
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:invoice-ai-accuracy-benchmark-p2-44"]).toContain(
      INVOICE_AI_ACCURACY_BENCHMARK_P2_44_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, INVOICE_AI_ACCURACY_BENCHMARK_P2_44_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("invoice-ai-accuracy-benchmark-p2-44");

    expect(INVOICE_AI_ACCURACY_BENCHMARK_P2_44_ARTIFACT).toBe(
      "artifacts/invoice-ai-accuracy-benchmark-p2-44-summary.json",
    );
  });
});
