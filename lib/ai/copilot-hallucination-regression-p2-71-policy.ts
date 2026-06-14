/**
 * P2-71 — Co-pilot hallucination regression: 50 Q&A with grounded correct answers.
 *
 * @see docs/copilot-hallucination-regression-p2-71.md
 */

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_POLICY_ID =
  "copilot-hallucination-regression-p2-71-v1" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_DOC =
  "docs/copilot-hallucination-regression-p2-71.md" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_ARTIFACT =
  "artifacts/copilot-hallucination-regression-p2-71.json" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_PATTERNS_MODULE =
  "lib/ai/copilot-hallucination-regression-p2-71-patterns.ts" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_CORPUS_MODULE =
  "lib/ai/copilot-hallucination-regression-p2-71-corpus.ts" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_SCORING_MODULE =
  "lib/ai/copilot-hallucination-regression-p2-71-scoring.ts" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_AUDIT_MODULE =
  "lib/ai/copilot-hallucination-regression-p2-71-audit.ts" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_BUILDER =
  "lib/ai/copilot-accuracy-benchmark-p2-69-builder.ts" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_COPILOT_SERVICE =
  "services/ai/copilot-service.ts" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_GUARDRAILS =
  "lib/ai/copilot-guardrails.ts" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_NO_HALLUCINATION =
  "lib/ai/ai-no-hallucination-mode-p2-110-operations.ts" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_SCENARIO_COUNT = 50 as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_OPERATIONAL_COUNT = 30 as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_TRAP_COUNT = 20 as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_MAX_HALLUCINATION_PCT = 0 as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_MIN_PASS_PCT = 100 as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_CHECK_NPM_SCRIPT =
  "check:copilot-hallucination-regression-p2-71" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_CI_NPM_SCRIPT =
  "test:ci:copilot-hallucination-regression-p2-71" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_UNIT_TEST =
  "tests/unit/copilot-hallucination-regression-p2-71.test.ts" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_EVAL_NOTE =
  "50-scenario co-pilot Q&A regression — grounded answers only, zero unsupported marketing or certification claims." as const;

export const COPILOT_HALLUCINATION_REGRESSION_P2_71_WIRING_PATHS = [
  COPILOT_HALLUCINATION_REGRESSION_P2_71_DOC,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_ARTIFACT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_PATTERNS_MODULE,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_CORPUS_MODULE,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_SCORING_MODULE,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_AUDIT_MODULE,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_BUILDER,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_COPILOT_SERVICE,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_GUARDRAILS,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_NO_HALLUCINATION,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_UNIT_TEST,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_CI_WORKFLOW,
  "lib/ai/deterministic-insights-from-overview.ts",
  "lib/ai/copilot-accuracy-benchmark-p2-69-policy.ts",
] as const;
