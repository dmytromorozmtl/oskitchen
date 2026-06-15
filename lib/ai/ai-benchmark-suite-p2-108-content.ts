import {
  AI_BENCHMARK_SUITE_P2_108_BENCHMARK_COUNT,
  AI_BENCHMARK_SUITE_P2_108_CONFIDENCE_LABELS_ROUTE,
  AI_BENCHMARK_SUITE_P2_108_ROUTE,
} from "@/lib/ai/ai-benchmark-suite-p2-108-policy";

export const AI_BENCHMARK_SUITE_P2_108_EYEBROW =
  "AI benchmark suite · regression harness" as const;

export const AI_BENCHMARK_SUITE_P2_108_HEADLINE =
  "Invoice accuracy, forecast accuracy, food cost anomaly, and labor quality benchmarks" as const;

export const AI_BENCHMARK_SUITE_P2_108_SUBLINE =
  "Four AI regression benchmarks run against golden corpora — invoice OCR accuracy, forecast MAPE, food cost anomaly recall, and labor schedule quality. BETA: verify scores against live tenant data — typical directional trust signals, not certified accuracy audit." as const;

export const AI_BENCHMARK_SUITE_P2_108_BENCHMARKS = [
  {
    id: "invoice-accuracy",
    label: "Invoice accuracy",
    description: "Supplier, amount, and line-item accuracy on 52+ invoice golden corpus.",
    module: "lib/qa/invoice-scanner-accuracy-scoring.ts",
    route: AI_BENCHMARK_SUITE_P2_108_ROUTE,
    thresholdLabel: "≥85% overall",
  },
  {
    id: "forecast-accuracy",
    label: "Forecast accuracy",
    description: "MAPE on weekly order-count forecast vs actuals from demo fixture.",
    module: "scripts/eval-forecast-accuracy.ts",
    route: AI_BENCHMARK_SUITE_P2_108_ROUTE,
    thresholdLabel: "MAPE ≤20%",
  },
  {
    id: "food-cost-anomaly",
    label: "Food cost anomaly",
    description: "Recall on flagged items where actual food cost exceeds theoretical baseline.",
    module: "lib/inventory/actual-vs-theoretical-variance-p2-102-operations.ts",
    route: AI_BENCHMARK_SUITE_P2_108_ROUTE,
    thresholdLabel: "≥80% recall",
  },
  {
    id: "labor-quality",
    label: "Labor quality",
    description: "Schedule coverage, overtime risk, and staffing alignment score.",
    module: "services/ai/labor-manager.ts",
    route: AI_BENCHMARK_SUITE_P2_108_ROUTE,
    thresholdLabel: "≥75% quality",
  },
] as const;

export const AI_BENCHMARK_SUITE_P2_108_OPERATOR_LINKS = [
  { label: "Confidence labels", href: AI_BENCHMARK_SUITE_P2_108_CONFIDENCE_LABELS_ROUTE },
  { label: "Invoice scanner", href: "/dashboard/inventory/invoice-scanner" },
  { label: "Food cost analytics", href: "/dashboard/analytics/food-cost" },
] as const;

export { AI_BENCHMARK_SUITE_P2_108_BENCHMARK_COUNT, AI_BENCHMARK_SUITE_P2_108_ROUTE };
