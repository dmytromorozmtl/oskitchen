/**
 * Blueprint P2-44 — Invoice AI accuracy benchmark (50 invoices, 95%+ target).
 *
 * @see docs/invoice-ai-accuracy-benchmark-p2-44.md
 * @see lib/qa/invoice-scanner-accuracy-corpus.ts
 */

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_POLICY_ID =
  "invoice-ai-accuracy-benchmark-p2-44-v1" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_DOC =
  "docs/invoice-ai-accuracy-benchmark-p2-44.md" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_INVOICE_COUNT = 50 as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT = 95 as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_ARTIFACT =
  "artifacts/invoice-ai-accuracy-benchmark-p2-44-summary.json" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_REGISTRY =
  "artifacts/invoice-ai-accuracy-benchmark-p2-44-registry.json" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_RUN_SCRIPT =
  "scripts/run-invoice-ai-accuracy-benchmark-p2-44.ts" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_AUDIT_SCRIPT =
  "scripts/audit-invoice-ai-accuracy-benchmark-p2-44.ts" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_NPM_SCRIPT =
  "audit:invoice-ai-accuracy-benchmark-p2-44" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_CHECK_NPM_SCRIPT =
  "check:invoice-ai-accuracy-benchmark-p2-44" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_BENCHMARK_NPM_SCRIPT =
  "benchmark:invoice-ai-accuracy-p2-44" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_UNIT_TEST =
  "tests/unit/invoice-ai-accuracy-benchmark-p2-44.test.ts" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_CORPUS =
  "lib/qa/invoice-scanner-accuracy-corpus.ts" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_SCORING =
  "lib/ai/invoice-ai-accuracy-benchmark-p2-44-scoring.ts" as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_FLOW_STEPS = [
  "load_corpus_50",
  "score_all_invoices",
  "assert_benchmark_threshold_95",
] as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_HONESTY_MARKERS = [
  "95% target",
  "BETA",
  "golden corpus",
  "not certified",
] as const;

export const INVOICE_AI_ACCURACY_BENCHMARK_P2_44_WIRING_PATHS = [
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_DOC,
  "lib/ai/invoice-ai-accuracy-benchmark-p2-44-audit.ts",
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_SCORING,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_CORPUS,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_RUN_SCRIPT,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_UNIT_TEST,
  INVOICE_AI_ACCURACY_BENCHMARK_P2_44_REGISTRY,
] as const;

export function isInvoiceAiAccuracyBenchmarkP2_44Pass(accuracyPct: number): boolean {
  return accuracyPct >= INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT;
}

export function isInvoiceAiAccuracyBenchmarkP2_44Fail(accuracyPct: number): boolean {
  return accuracyPct < INVOICE_AI_ACCURACY_BENCHMARK_P2_44_MIN_PCT;
}
