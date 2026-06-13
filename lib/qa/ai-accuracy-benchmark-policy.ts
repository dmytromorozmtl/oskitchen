/**
 * Blueprint P1-13 — AI accuracy benchmarks (50 invoice PDF + 20 co-pilot questions).
 *
 * @see scripts/run-ai-accuracy-benchmark.ts
 * @see tests/unit/ai-accuracy-benchmark.test.ts
 */

export const AI_ACCURACY_BENCHMARK_POLICY_ID = "ai-accuracy-benchmark-p1-13-v1" as const;

export const AI_ACCURACY_BENCHMARK_INVOICE_COUNT = 50 as const;

export const AI_ACCURACY_BENCHMARK_COPILOT_QUESTION_COUNT = 20 as const;

export const AI_ACCURACY_BENCHMARK_MIN_INVOICE_PCT = 85 as const;

export const AI_ACCURACY_BENCHMARK_MIN_COPILOT_PCT = 90 as const;

export const AI_ACCURACY_BENCHMARK_ARTIFACT =
  "artifacts/ai-accuracy-benchmark-summary.json" as const;

export const AI_ACCURACY_BENCHMARK_SCRIPT = "scripts/run-ai-accuracy-benchmark.ts" as const;

export const AI_ACCURACY_BENCHMARK_UNIT_TEST =
  "tests/unit/ai-accuracy-benchmark.test.ts" as const;

export const AI_ACCURACY_BENCHMARK_NPM_SCRIPT = "test:ci:ai-accuracy-benchmark" as const;

export const AI_ACCURACY_BENCHMARK_RUN_NPM_SCRIPT = "benchmark:ai-accuracy" as const;

export const AI_ACCURACY_BENCHMARK_INVOICE_CORPUS =
  "lib/qa/invoice-scanner-accuracy-corpus.ts" as const;

export const AI_ACCURACY_BENCHMARK_COPILOT_CORPUS =
  "lib/qa/copilot-accuracy-corpus.ts" as const;

export const AI_ACCURACY_BENCHMARK_OPERATIONS =
  "lib/qa/ai-accuracy-benchmark-operations.ts" as const;

export const AI_ACCURACY_BENCHMARK_INVOICE_FIXTURE_DIR =
  "tests/fixtures/invoices/pdf" as const;

export const AI_ACCURACY_BENCHMARK_WIRING_PATHS = [
  AI_ACCURACY_BENCHMARK_SCRIPT,
  AI_ACCURACY_BENCHMARK_UNIT_TEST,
  AI_ACCURACY_BENCHMARK_OPERATIONS,
  AI_ACCURACY_BENCHMARK_INVOICE_CORPUS,
  AI_ACCURACY_BENCHMARK_COPILOT_CORPUS,
  "lib/qa/copilot-accuracy-scoring.ts",
  "lib/qa/ai-accuracy-benchmark-policy.ts",
] as const;
