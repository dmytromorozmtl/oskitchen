/**
 * P1-13 — AI accuracy benchmarks: 50 invoice PDF + 20 co-pilot questions.
 *
 * Usage:
 *   npm run benchmark:ai-accuracy
 *   npm run test:ci:ai-accuracy-benchmark
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { runAiAccuracyBenchmark } from "@/lib/qa/ai-accuracy-benchmark-operations";
import {
  AI_ACCURACY_BENCHMARK_ARTIFACT,
  AI_ACCURACY_BENCHMARK_COPILOT_QUESTION_COUNT,
  AI_ACCURACY_BENCHMARK_INVOICE_COUNT,
  AI_ACCURACY_BENCHMARK_POLICY_ID,
} from "@/lib/qa/ai-accuracy-benchmark-policy";

const ROOT = process.cwd();
const artifactPath = join(ROOT, AI_ACCURACY_BENCHMARK_ARTIFACT);

function main(): void {
  const result = runAiAccuracyBenchmark();

  const summary = {
    policyId: AI_ACCURACY_BENCHMARK_POLICY_ID,
    generatedAt: new Date().toISOString(),
    mode: "golden-corpus-regression",
    targets: {
      invoiceCount: AI_ACCURACY_BENCHMARK_INVOICE_COUNT,
      copilotQuestionCount: AI_ACCURACY_BENCHMARK_COPILOT_QUESTION_COUNT,
    },
    invoice: result.invoice,
    copilot: {
      questionCount: result.copilot.questionCount,
      passedCount: result.copilot.passedCount,
      accuracyPct: result.copilot.accuracyPct,
      passed: result.copilot.passed,
      thresholdPct: result.copilot.thresholdPct,
    },
    passed: result.passed,
  };

  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(
    `[ai-accuracy-benchmark] invoice ${result.invoice.invoiceCount} PDFs — overall ${result.invoice.overallAccuracyPct}% (≥${result.invoice.thresholdPct}%)`,
  );
  console.log(
    `[ai-accuracy-benchmark] co-pilot ${result.copilot.questionCount} questions — ${result.copilot.accuracyPct}% (≥${result.copilot.thresholdPct}%)`,
  );
  console.log(`[ai-accuracy-benchmark] artifact → ${AI_ACCURACY_BENCHMARK_ARTIFACT}`);

  if (!result.passed) {
    console.error("[ai-accuracy-benchmark] FAIL — accuracy below threshold");
    process.exit(1);
  }

  console.log("[ai-accuracy-benchmark] PASS");
}

main();
