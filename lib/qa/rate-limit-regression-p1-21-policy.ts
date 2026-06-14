/**
 * P1-21 — Rate-limit regression at production scale (200+ requests / 60s → 429).
 *
 * Extends P1-18 fast N+1 smoke with api_mutation window verification.
 *
 * @see docs/rate-limit-regression-p1-21.md
 */

import {
  RATE_LIMIT_REGRESSION_MUTATION_TARGETS,
  RATE_LIMIT_REGRESSION_UNIT_TEST,
} from "@/lib/qa/rate-limit-regression-policy";

export const RATE_LIMIT_REGRESSION_P1_21_POLICY_ID =
  "rate-limit-regression-p1-21-v1" as const;

export const RATE_LIMIT_REGRESSION_P1_21_DOC =
  "docs/rate-limit-regression-p1-21.md" as const;

export const RATE_LIMIT_REGRESSION_P1_21_ARTIFACT =
  "artifacts/rate-limit-regression-p1-21.json" as const;

/** Production api_mutation policy — lib/rate-limit/rate-limit-policies.ts */
export const RATE_LIMIT_REGRESSION_P1_21_WINDOW_MS = 60_000 as const;

export const RATE_LIMIT_REGRESSION_P1_21_PRODUCTION_MAX = 120 as const;

/** 200+ requests within the 60s window (N+1 over production max). */
export const RATE_LIMIT_REGRESSION_P1_21_HIGH_VOLUME_BURST = 201 as const;

export const RATE_LIMIT_REGRESSION_P1_21_POLICY_KEY = "api_mutation" as const;

export const RATE_LIMIT_REGRESSION_P1_21_RATE_POLICIES_FILE =
  "lib/rate-limit/rate-limit-policies.ts" as const;

export const RATE_LIMIT_REGRESSION_P1_21_PRIMARY_TARGET_ID =
  "pos-terminal-post" as const;

export const RATE_LIMIT_REGRESSION_P1_21_CHECK_NPM_SCRIPT =
  "check:rate-limit-regression-p1-21" as const;

export const RATE_LIMIT_REGRESSION_P1_21_CI_NPM_SCRIPT =
  "test:ci:rate-limit-regression-p1-21" as const;

export const RATE_LIMIT_REGRESSION_P1_21_UNIT_TEST =
  "tests/unit/rate-limit-regression-p1-21.test.ts" as const;

export const RATE_LIMIT_REGRESSION_P1_21_LEGACY_UNIT_TEST = RATE_LIMIT_REGRESSION_UNIT_TEST;

export const RATE_LIMIT_REGRESSION_P1_21_SCORING_MODULE =
  "lib/qa/rate-limit-regression-scoring.ts" as const;

export const RATE_LIMIT_REGRESSION_P1_21_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const RATE_LIMIT_REGRESSION_P1_21_MUTATION_TARGETS =
  RATE_LIMIT_REGRESSION_MUTATION_TARGETS;

export const RATE_LIMIT_REGRESSION_P1_21_WIRING_PATHS = [
  RATE_LIMIT_REGRESSION_P1_21_DOC,
  "lib/qa/rate-limit-regression-policy.ts",
  RATE_LIMIT_REGRESSION_P1_21_SCORING_MODULE,
  RATE_LIMIT_REGRESSION_P1_21_LEGACY_UNIT_TEST,
  RATE_LIMIT_REGRESSION_P1_21_UNIT_TEST,
  RATE_LIMIT_REGRESSION_P1_21_RATE_POLICIES_FILE,
  "scripts/run-rate-limit-regression-benchmark.ts",
  RATE_LIMIT_REGRESSION_P1_21_ARTIFACT,
  RATE_LIMIT_REGRESSION_P1_21_CI_WORKFLOW,
] as const;
