/**
 * P2-75 — Developer API rate limits + OpenAPI spec + sandbox.
 *
 * @see docs/developer-api-rate-limits-p2-75.md
 */

export const DEVELOPER_API_RATE_LIMITS_P2_75_POLICY_ID =
  "developer-api-rate-limits-p2-75-v1" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_DOC =
  "docs/developer-api-rate-limits-p2-75.md" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_ARTIFACT =
  "artifacts/developer-api-rate-limits-p2-75.json" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_FLOW_MODULE =
  "lib/developer/developer-api-rate-limits-p2-75-flow.ts" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_SCORING_MODULE =
  "lib/developer/developer-api-rate-limits-p2-75-scoring.ts" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_AUDIT_MODULE =
  "lib/developer/developer-api-rate-limits-p2-75-audit.ts" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_SANDBOX_MODULE =
  "lib/developer/developer-api-sandbox-p2-75.ts" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_PANEL =
  "components/developer/developer-api-rate-limits-panel.tsx" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_DOCS_PAGE =
  "app/dashboard/developer/docs/page.tsx" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_CHECK_NPM_SCRIPT =
  "check:developer-api-rate-limits-p2-75" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_CI_NPM_SCRIPT =
  "test:ci:developer-api-rate-limits-p2-75" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_UNIT_TEST =
  "tests/unit/developer-api-rate-limits-p2-75.test.ts" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_PANEL_TEST_ID =
  "developer-api-rate-limits-panel" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_PER_KEY_TEST_ID =
  "developer-api-rate-limits-per-key" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_OPENAPI_TEST_ID =
  "developer-api-rate-limits-openapi" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_SANDBOX_TEST_ID =
  "developer-api-rate-limits-sandbox" as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_SCENARIO_COUNT = 6 as const;

export const DEVELOPER_API_SANDBOX_KEY_PREFIX = "kos_test_" as const;

export const DEVELOPER_API_PRODUCTION_KEY_PREFIX = "kos_" as const;

export const DEVELOPER_API_OPENAPI_PATH = "/api/openapi.json" as const;

export const DEVELOPER_API_RATE_LIMIT_HEADERS = [
  "X-RateLimit-Limit",
  "X-RateLimit-Remaining",
  "X-RateLimit-Reset",
  "Retry-After",
] as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_UPSTREAM_POLICIES = [
  "public-api-rate-limit-e2e-v1",
] as const;

export const DEVELOPER_API_RATE_LIMITS_P2_75_WIRING_PATHS = [
  DEVELOPER_API_RATE_LIMITS_P2_75_DOC,
  DEVELOPER_API_RATE_LIMITS_P2_75_ARTIFACT,
  DEVELOPER_API_RATE_LIMITS_P2_75_FLOW_MODULE,
  DEVELOPER_API_RATE_LIMITS_P2_75_SCORING_MODULE,
  DEVELOPER_API_RATE_LIMITS_P2_75_AUDIT_MODULE,
  DEVELOPER_API_RATE_LIMITS_P2_75_SANDBOX_MODULE,
  DEVELOPER_API_RATE_LIMITS_P2_75_PANEL,
  DEVELOPER_API_RATE_LIMITS_P2_75_DOCS_PAGE,
  DEVELOPER_API_RATE_LIMITS_P2_75_UNIT_TEST,
  DEVELOPER_API_RATE_LIMITS_P2_75_CI_WORKFLOW,
  "lib/api-public/public-api-rate-limit.ts",
  "lib/api-public/guard.ts",
  "lib/api/openapi-spec.ts",
  "app/api/openapi.json/route.ts",
  "lib/rate-limit/rate-limit-policies.ts",
  "lib/api-public/public-api-rate-limit-e2e-policy.ts",
  "docs/API_REFERENCE.md",
  "actions/monetization.ts",
  "components/developer/api-keys-panel.tsx",
] as const;
