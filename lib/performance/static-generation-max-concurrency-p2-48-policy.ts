/**
 * P2-48 — staticGenerationMaxConcurrency review: measure routes, retain Vercel=1 OOM guard.
 *
 * @see docs/static-generation-max-concurrency-p2-48.md
 * @see lib/performance/static-generation-concurrency-policy.ts
 */

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_POLICY_ID =
  "static-generation-max-concurrency-p2-48-v1" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DOC =
  "docs/static-generation-max-concurrency-p2-48.md" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_ARTIFACT =
  "artifacts/static-generation-max-concurrency-p2-48.json" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_AUDIT_MODULE =
  "lib/performance/static-generation-max-concurrency-p2-48-audit.ts" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_CHECK_NPM_SCRIPT =
  "check:static-generation-max-concurrency-p2-48" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_CI_NPM_SCRIPT =
  "test:ci:static-generation-max-concurrency-p2-48" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_UNIT_TEST =
  "tests/unit/static-generation-max-concurrency-p2-48.test.ts" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_BASE_POLICY =
  "lib/performance/static-generation-concurrency-policy.ts" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_NEXT_CONFIG = "next.config.ts" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_VERCEL_BUILD =
  "scripts/vercel-build.sh" as const;

/** Engineering review outcome — do not raise Vercel default above 1 without heap/cpu uplift. */
export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DECISION =
  "retain-vercel-1-local-uncapped" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_OVERRIDE_ENV =
  "NEXT_STATIC_GENERATION_MAX_CONCURRENCY" as const;

export const STATIC_GENERATION_MAX_CONCURRENCY_P2_48_WIRING_PATHS = [
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_DOC,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_ARTIFACT,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_AUDIT_MODULE,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_UNIT_TEST,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_CI_WORKFLOW,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_BASE_POLICY,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_NEXT_CONFIG,
  STATIC_GENERATION_MAX_CONCURRENCY_P2_48_VERCEL_BUILD,
] as const;
