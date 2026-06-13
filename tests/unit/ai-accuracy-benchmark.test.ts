import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  AI_ACCURACY_BENCHMARK_ARTIFACT,
  AI_ACCURACY_BENCHMARK_COPILOT_QUESTION_COUNT,
  AI_ACCURACY_BENCHMARK_INVOICE_COUNT,
  AI_ACCURACY_BENCHMARK_MIN_COPILOT_PCT,
  AI_ACCURACY_BENCHMARK_MIN_INVOICE_PCT,
  AI_ACCURACY_BENCHMARK_NPM_SCRIPT,
  AI_ACCURACY_BENCHMARK_POLICY_ID,
  AI_ACCURACY_BENCHMARK_RUN_NPM_SCRIPT,
  AI_ACCURACY_BENCHMARK_SCRIPT,
  AI_ACCURACY_BENCHMARK_UNIT_TEST,
  AI_ACCURACY_BENCHMARK_WIRING_PATHS,
} from "@/lib/qa/ai-accuracy-benchmark-policy";
import {
  buildAiAccuracyBenchmarkInvoiceCorpus,
  runAiAccuracyBenchmark,
} from "@/lib/qa/ai-accuracy-benchmark-operations";
import { buildCopilotAccuracyCorpus } from "@/lib/qa/copilot-accuracy-corpus";
import { runCopilotAccuracyBenchmark } from "@/lib/qa/copilot-accuracy-scoring";

const ROOT = process.cwd();

describe("AI accuracy benchmarks (P1-13)", () => {
  it("locks policy id and 50 invoice + 20 co-pilot targets", () => {
    expect(AI_ACCURACY_BENCHMARK_POLICY_ID).toBe("ai-accuracy-benchmark-p1-13-v1");
    expect(AI_ACCURACY_BENCHMARK_INVOICE_COUNT).toBe(50);
    expect(AI_ACCURACY_BENCHMARK_COPILOT_QUESTION_COUNT).toBe(20);
    expect(AI_ACCURACY_BENCHMARK_MIN_INVOICE_PCT).toBe(85);
    expect(AI_ACCURACY_BENCHMARK_MIN_COPILOT_PCT).toBe(90);
  });

  it("passes 50-invoice PDF golden corpus above 85% accuracy", () => {
    const fixtures = buildAiAccuracyBenchmarkInvoiceCorpus();
    expect(fixtures).toHaveLength(AI_ACCURACY_BENCHMARK_INVOICE_COUNT);
    expect(fixtures[0]?.pdfRef).toContain("tests/fixtures/invoices/pdf/invoice-001.pdf");

    const result = runAiAccuracyBenchmark();
    expect(result.invoice.invoiceCount).toBe(50);
    expect(result.invoice.overallAccuracyPct).toBeGreaterThanOrEqual(
      AI_ACCURACY_BENCHMARK_MIN_INVOICE_PCT,
    );
    expect(result.invoice.passed).toBe(true);
  });

  it("passes 20 co-pilot questions with deterministic keyword scoring", () => {
    const fixtures = buildCopilotAccuracyCorpus();
    expect(fixtures).toHaveLength(AI_ACCURACY_BENCHMARK_COPILOT_QUESTION_COUNT);

    const result = runCopilotAccuracyBenchmark(fixtures);
    expect(result.passedCount).toBe(20);
    expect(result.accuracyPct).toBeGreaterThanOrEqual(AI_ACCURACY_BENCHMARK_MIN_COPILOT_PCT);
    expect(result.passed).toBe(true);
  });

  it("passes combined invoice + co-pilot benchmark suite", () => {
    const result = runAiAccuracyBenchmark();
    expect(result.passed).toBe(true);
    expect(result.copilot.questionCount).toBe(20);
    expect(result.copilot.accuracyPct).toBe(100);
  });

  it("registers npm scripts, run script, and wiring paths", () => {
    expect(existsSync(join(ROOT, AI_ACCURACY_BENCHMARK_SCRIPT))).toBe(true);
    expect(AI_ACCURACY_BENCHMARK_UNIT_TEST).toBe(
      "tests/unit/ai-accuracy-benchmark.test.ts",
    );

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[AI_ACCURACY_BENCHMARK_NPM_SCRIPT]).toContain(
      AI_ACCURACY_BENCHMARK_UNIT_TEST,
    );
    expect(pkg.scripts?.[AI_ACCURACY_BENCHMARK_RUN_NPM_SCRIPT]).toContain(
      "run-ai-accuracy-benchmark.ts",
    );
    expect(AI_ACCURACY_BENCHMARK_ARTIFACT).toBe(
      "artifacts/ai-accuracy-benchmark-summary.json",
    );

    for (const path of AI_ACCURACY_BENCHMARK_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path))).toBe(true);
    }
  });
});
