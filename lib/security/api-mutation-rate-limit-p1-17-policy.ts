/**
 * P1-17 — Rate-limit all API mutation routes (middleware + dedicated + exempt class).
 *
 * @see docs/api-mutation-rate-limit-p1-17.md
 */

import {
  API_MUTATION_RATE_LIMIT_AUDIT_ARTIFACT,
  API_MUTATION_RATE_LIMIT_AUDIT_SCRIPT,
  API_MUTATION_RATE_LIMIT_BLUEPRINT_POLICY_ID,
  API_MUTATION_RATE_LIMIT_UNIT_TEST,
} from "@/lib/qa/api-mutation-rate-limit-policy";

export const API_MUTATION_RATE_LIMIT_P1_17_POLICY_ID =
  "p1-17-api-mutation-rate-limit-v1" as const;

export const API_MUTATION_RATE_LIMIT_P1_17_DOC =
  "docs/api-mutation-rate-limit-p1-17.md" as const;

export const API_MUTATION_RATE_LIMIT_P1_17_ARTIFACT =
  "artifacts/api-mutation-rate-limit-p1-17.json" as const;

export const API_MUTATION_RATE_LIMIT_P1_17_UNCOVERED_TARGET = 0 as const;

export const API_MUTATION_RATE_LIMIT_P1_17_MIDDLEWARE_FILE = "middleware.ts" as const;

export const API_MUTATION_RATE_LIMIT_P1_17_MIDDLEWARE_FN =
  "enforceApiMutationRateLimitMiddleware" as const;

export const API_MUTATION_RATE_LIMIT_P1_17_ENFORCE_FN = "enforceApiRateLimit" as const;

export const API_MUTATION_RATE_LIMIT_P1_17_CHECK_NPM_SCRIPT =
  "check:api-mutation-rate-limit-p1-17" as const;

export const API_MUTATION_RATE_LIMIT_P1_17_CI_NPM_SCRIPT =
  "test:ci:api-mutation-rate-limit-p1-17" as const;

export const API_MUTATION_RATE_LIMIT_P1_17_AUDIT_NPM_SCRIPT =
  "audit:api-mutation-rate-limit" as const;

export const API_MUTATION_RATE_LIMIT_P1_17_EXTENDS_POLICY_ID =
  API_MUTATION_RATE_LIMIT_BLUEPRINT_POLICY_ID;

export const API_MUTATION_RATE_LIMIT_P1_17_WIRING_PATHS = [
  API_MUTATION_RATE_LIMIT_P1_17_DOC,
  "lib/api/middleware-api-rate-limit.ts",
  "lib/api/with-api-mutation-rate-limit.ts",
  "scripts/lib/api-mutation-rate-limit-audit.ts",
  API_MUTATION_RATE_LIMIT_AUDIT_SCRIPT,
  API_MUTATION_RATE_LIMIT_UNIT_TEST,
  "tests/unit/api-mutation-rate-limit-p1-17.test.ts",
  API_MUTATION_RATE_LIMIT_P1_17_MIDDLEWARE_FILE,
  API_MUTATION_RATE_LIMIT_AUDIT_ARTIFACT,
  API_MUTATION_RATE_LIMIT_P1_17_ARTIFACT,
] as const;
