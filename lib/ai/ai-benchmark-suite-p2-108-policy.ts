/**
 * Blueprint P2-108 — AI benchmark suite (invoice, forecast, food cost anomaly, labor quality).
 *
 * @see docs/ai-benchmark-suite.md
 * @see app/dashboard/ai/benchmark-suite/page.tsx
 */

export const AI_BENCHMARK_SUITE_P2_108_POLICY_ID = "ai-benchmark-suite-p2-108-v1" as const;

export const AI_BENCHMARK_SUITE_P2_108_DOC = "docs/ai-benchmark-suite.md" as const;

export const AI_BENCHMARK_SUITE_P2_108_LEGACY_INVOICE =
  "lib/qa/invoice-scanner-accuracy-scoring.ts" as const;

export const AI_BENCHMARK_SUITE_P2_108_LEGACY_FORECAST =
  "scripts/eval-forecast-accuracy.ts" as const;

export const AI_BENCHMARK_SUITE_P2_108_LEGACY_FOOD_COST =
  "lib/inventory/actual-vs-theoretical-variance-p2-102-operations.ts" as const;

export const AI_BENCHMARK_SUITE_P2_108_LEGACY_LABOR = "services/ai/labor-manager.ts" as const;

export const AI_BENCHMARK_SUITE_P2_108_CONTENT_PATH =
  "lib/ai/ai-benchmark-suite-p2-108-content.ts" as const;

export const AI_BENCHMARK_SUITE_P2_108_OPERATIONS_PATH =
  "lib/ai/ai-benchmark-suite-p2-108-operations.ts" as const;

export const AI_BENCHMARK_SUITE_P2_108_SERVICE_PATH =
  "services/ai/ai-benchmark-suite-p2-108-service.ts" as const;

export const AI_BENCHMARK_SUITE_P2_108_COMPONENT =
  "components/ai/ai-benchmark-suite-panel.tsx" as const;

export const AI_BENCHMARK_SUITE_P2_108_PAGE =
  "app/dashboard/ai/benchmark-suite/page.tsx" as const;

export const AI_BENCHMARK_SUITE_P2_108_ROUTE = "/dashboard/ai/benchmark-suite" as const;

export const AI_BENCHMARK_SUITE_P2_108_CONFIDENCE_LABELS_ROUTE =
  "/dashboard/ai/confidence-labels" as const;

export const AI_BENCHMARK_SUITE_P2_108_BENCHMARK_COUNT = 4 as const;

export const AI_BENCHMARK_SUITE_P2_108_ARTIFACT =
  "artifacts/ai-benchmark-suite-p2-108-summary.json" as const;

export const AI_BENCHMARK_SUITE_P2_108_MIN_INVOICE_ACCURACY_PCT = 85 as const;

export const AI_BENCHMARK_SUITE_P2_108_MAX_FORECAST_MAPE_PCT = 20 as const;

export const AI_BENCHMARK_SUITE_P2_108_MIN_FOOD_COST_RECALL_PCT = 80 as const;

export const AI_BENCHMARK_SUITE_P2_108_MIN_LABOR_QUALITY_PCT = 75 as const;

export const AI_BENCHMARK_SUITE_P2_108_TEST_IDS = [
  "ai-benchmark-suite",
  "ai-benchmark-invoice-accuracy",
  "ai-benchmark-forecast-accuracy",
  "ai-benchmark-food-cost-anomaly",
  "ai-benchmark-labor-quality",
] as const;

export const AI_BENCHMARK_SUITE_P2_108_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "typical",
  "not certified",
  "directional",
  "golden corpus",
] as const;

export const AI_BENCHMARK_SUITE_P2_108_AUDIT_SCRIPT =
  "scripts/audit-ai-benchmark-suite-p2-108.ts" as const;

export const AI_BENCHMARK_SUITE_P2_108_RUN_SCRIPT =
  "scripts/run-ai-benchmark-suite-p2-108.ts" as const;

export const AI_BENCHMARK_SUITE_P2_108_NPM_SCRIPT = "audit:ai-benchmark-suite-p2-108" as const;

export const AI_BENCHMARK_SUITE_P2_108_BENCHMARK_NPM_SCRIPT =
  "benchmark:ai-benchmark-suite-p2-108" as const;

export const AI_BENCHMARK_SUITE_P2_108_UNIT_TEST =
  "tests/unit/ai-benchmark-suite-p2-108.test.ts" as const;

export const AI_BENCHMARK_SUITE_P2_108_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const AI_BENCHMARK_SUITE_P2_108_WIRING_PATHS = [
  AI_BENCHMARK_SUITE_P2_108_DOC,
  AI_BENCHMARK_SUITE_P2_108_CONTENT_PATH,
  AI_BENCHMARK_SUITE_P2_108_OPERATIONS_PATH,
  AI_BENCHMARK_SUITE_P2_108_SERVICE_PATH,
  AI_BENCHMARK_SUITE_P2_108_COMPONENT,
  AI_BENCHMARK_SUITE_P2_108_PAGE,
  "lib/ai/ai-benchmark-suite-p2-108-policy.ts",
  "lib/ai/ai-benchmark-suite-p2-108-audit.ts",
  AI_BENCHMARK_SUITE_P2_108_UNIT_TEST,
  AI_BENCHMARK_SUITE_P2_108_RUN_SCRIPT,
  AI_BENCHMARK_SUITE_P2_108_LEGACY_INVOICE,
  AI_BENCHMARK_SUITE_P2_108_LEGACY_FORECAST,
  AI_BENCHMARK_SUITE_P2_108_LEGACY_FOOD_COST,
  AI_BENCHMARK_SUITE_P2_108_LEGACY_LABOR,
  "lib/qa/invoice-scanner-accuracy-corpus.ts",
] as const;
