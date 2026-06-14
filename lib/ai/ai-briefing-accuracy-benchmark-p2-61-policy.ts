/**
 * P2-61 — AI briefing accuracy benchmarks: Toast IQ parity metrics from hub ground truth.
 *
 * @see docs/ai-briefing-accuracy-benchmark-p2-61.md
 */

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_POLICY_ID =
  "ai-briefing-accuracy-benchmark-p2-61-v1" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_DOC =
  "docs/ai-briefing-accuracy-benchmark-p2-61.md" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_ARTIFACT =
  "artifacts/ai-briefing-accuracy-benchmark-p2-61.json" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CORPUS_MODULE =
  "lib/ai/ai-briefing-accuracy-benchmark-p2-61-corpus.ts" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCORING_MODULE =
  "lib/ai/ai-briefing-accuracy-benchmark-p2-61-scoring.ts" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_AUDIT_MODULE =
  "lib/ai/ai-briefing-accuracy-benchmark-p2-61-audit.ts" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CHECK_NPM_SCRIPT =
  "check:ai-briefing-accuracy-benchmark-p2-61" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CI_NPM_SCRIPT =
  "test:ci:ai-briefing-accuracy-benchmark-p2-61" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_UNIT_TEST =
  "tests/unit/ai-briefing-accuracy-benchmark-p2-61.test.ts" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIO_COUNT = 25 as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_RECALL_PCT = 95 as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_ROUTE_ACCURACY_PCT = 95 as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MAX_HALLUCINATION_PCT = 0 as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_BRIEFING_CORE =
  "lib/ai/deterministic-insights-from-overview.ts" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_BRIEFING_SERVICE =
  "services/ai/deterministic-insights-service.ts" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_NARRATIVE_POLICY =
  "lib/ai/ai-briefing-narrative-p2-111-policy.ts" as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_TOAST_IQ_PARITY_NOTE =
  "Deterministic hub-signal briefing — comparable daily ops summary category to Toast IQ, without claiming certified parity." as const;

export const AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_WIRING_PATHS = [
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_DOC,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_ARTIFACT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CORPUS_MODULE,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCORING_MODULE,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_AUDIT_MODULE,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_UNIT_TEST,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CI_WORKFLOW,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_BRIEFING_CORE,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_BRIEFING_SERVICE,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_NARRATIVE_POLICY,
  "docs/ai-briefing-narrative.md",
] as const;

export const AI_BRIEFING_INSIGHT_ACTION_ROUTES = {
  throughput_today: "/dashboard/orders",
  failed_integrations: "/dashboard/integrations",
  production_overdue: "/dashboard/production",
  packing_accuracy_low: "/dashboard/packing",
  failed_delivery_stops: "/dashboard/routes",
  inventory_shortage: "/dashboard/inventory/demand",
  inventory_shortage_upcoming: "/dashboard/inventory/demand",
  purchasing_open: "/dashboard/purchasing",
  catering_followup_overdue: "/dashboard/catering-quotes",
  meal_plan_cycles_missing: "/dashboard/meal-plans",
  overdue_tasks: "/dashboard/tasks",
  low_margin_item: "/dashboard/costing",
  low_repeat_rate: "/dashboard/customers/at-risk",
} as const;
