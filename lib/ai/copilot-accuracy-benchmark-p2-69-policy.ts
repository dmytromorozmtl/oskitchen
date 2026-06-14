/**
 * P2-69 — AI co-pilot accuracy benchmarks: restaurant Q&A eval suite + hallucination rate.
 *
 * @see docs/copilot-accuracy-benchmark-p2-69.md
 */

export const COPILOT_ACCURACY_BENCHMARK_P2_69_POLICY_ID =
  "copilot-accuracy-benchmark-p2-69-v1" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_DOC =
  "docs/copilot-accuracy-benchmark-p2-69.md" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_ARTIFACT =
  "artifacts/copilot-accuracy-benchmark-p2-69.json" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_BUILDER =
  "lib/ai/copilot-accuracy-benchmark-p2-69-builder.ts" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_CORPUS_MODULE =
  "lib/ai/copilot-accuracy-benchmark-p2-69-corpus.ts" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_SCORING_MODULE =
  "lib/ai/copilot-accuracy-benchmark-p2-69-scoring.ts" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_AUDIT_MODULE =
  "lib/ai/copilot-accuracy-benchmark-p2-69-audit.ts" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_COPILOT_SERVICE =
  "services/ai/copilot-service.ts" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_CHAT_PAGE =
  "app/dashboard/copilot/chat/page.tsx" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_GUARDRAILS =
  "lib/ai/copilot-guardrails.ts" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_PROMPTS =
  "lib/ai/copilot-prompts.ts" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_SCENARIO_COUNT = 25 as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_MIN_ACCURACY_PCT = 95 as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_MAX_HALLUCINATION_PCT = 0 as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_CHECK_NPM_SCRIPT =
  "check:copilot-accuracy-benchmark-p2-69" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_CI_NPM_SCRIPT =
  "test:ci:copilot-accuracy-benchmark-p2-69" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_UNIT_TEST =
  "tests/unit/copilot-accuracy-benchmark-p2-69.test.ts" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_EVAL_NOTE =
  "Deterministic restaurant Q&A from workspace signals — eval suite with hallucination rate gate, without claiming LLM accuracy certification." as const;

export const COPILOT_ACCURACY_BENCHMARK_P2_69_WIRING_PATHS = [
  COPILOT_ACCURACY_BENCHMARK_P2_69_DOC,
  COPILOT_ACCURACY_BENCHMARK_P2_69_ARTIFACT,
  COPILOT_ACCURACY_BENCHMARK_P2_69_CORPUS_MODULE,
  COPILOT_ACCURACY_BENCHMARK_P2_69_SCORING_MODULE,
  COPILOT_ACCURACY_BENCHMARK_P2_69_AUDIT_MODULE,
  COPILOT_ACCURACY_BENCHMARK_P2_69_BUILDER,
  COPILOT_ACCURACY_BENCHMARK_P2_69_COPILOT_SERVICE,
  COPILOT_ACCURACY_BENCHMARK_P2_69_CHAT_PAGE,
  COPILOT_ACCURACY_BENCHMARK_P2_69_GUARDRAILS,
  COPILOT_ACCURACY_BENCHMARK_P2_69_PROMPTS,
  COPILOT_ACCURACY_BENCHMARK_P2_69_UNIT_TEST,
  COPILOT_ACCURACY_BENCHMARK_P2_69_CI_WORKFLOW,
  "lib/ai/deterministic-insights-from-overview.ts",
] as const;
