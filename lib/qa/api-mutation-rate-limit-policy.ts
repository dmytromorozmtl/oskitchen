/**
 * Blueprint P1-21 — All API mutation routes rate-limited (middleware, dedicated, or exempt class).
 */

export const API_MUTATION_RATE_LIMIT_BLUEPRINT_POLICY_ID =
  "api-mutation-rate-limit-blueprint-v1" as const;

export const API_MUTATION_RATE_LIMIT_AUDIT_SCRIPT =
  "scripts/audit-api-mutation-rate-limit.ts" as const;

export const API_MUTATION_RATE_LIMIT_AUDIT_NPM_SCRIPT =
  "audit:api-mutation-rate-limit" as const;

export const API_MUTATION_RATE_LIMIT_AUDIT_ARTIFACT =
  "artifacts/api-mutation-rate-limit-audit.json" as const;

export const API_MUTATION_RATE_LIMIT_UNIT_TEST =
  "tests/unit/api-mutation-rate-limit.test.ts" as const;

export const API_MUTATION_RATE_LIMIT_CI_NPM_SCRIPT =
  "test:ci:api-mutation-rate-limit" as const;

export const API_MUTATION_RATE_LIMIT_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;
