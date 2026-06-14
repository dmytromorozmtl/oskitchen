/**
 * P1-16 — Remove DEPLOY_SKIP_VITEST from production deploy scripts.
 *
 * @see docs/deploy-skip-vitest-p1-16.md
 */

export const DEPLOY_SKIP_VITEST_P1_16_POLICY_ID = "p1-16-deploy-skip-vitest-removed-v1" as const;

export const DEPLOY_SKIP_VITEST_P1_16_DOC = "docs/deploy-skip-vitest-p1-16.md" as const;

export const DEPLOY_SKIP_VITEST_P1_16_ARTIFACT =
  "artifacts/deploy-skip-vitest-removed-p1-16.json" as const;

export const DEPLOY_SKIP_VITEST_P1_16_FORBIDDEN_TOKEN = "DEPLOY_SKIP_VITEST" as const;

export const DEPLOY_SKIP_VITEST_P1_16_PRIMARY_DEPLOY_SCRIPT =
  "scripts/deploy-prebuilt-prod.sh" as const;

export const DEPLOY_SKIP_VITEST_P1_16_VITEST_GATE_PATTERN = "vitest.mjs run" as const;

/** Shell deploy entrypoints audited for DEPLOY_SKIP_VITEST bypass. */
export const DEPLOY_SKIP_VITEST_P1_16_AUDITED_SCRIPTS = [
  DEPLOY_SKIP_VITEST_P1_16_PRIMARY_DEPLOY_SCRIPT,
  "scripts/predeploy-verify.sh",
  "scripts/final-storefront-deploy.sh",
  "scripts/workspace-prod-deploy.sh",
  "scripts/storefront-post-deploy.sh",
] as const;

export const DEPLOY_SKIP_VITEST_P1_16_CHECK_NPM_SCRIPT =
  "check:deploy-skip-vitest-p1-16" as const;

export const DEPLOY_SKIP_VITEST_P1_16_CI_NPM_SCRIPT =
  "test:ci:deploy-skip-vitest-p1-16" as const;

export const DEPLOY_SKIP_VITEST_P1_16_UNIT_TEST =
  "tests/unit/deploy-skip-vitest-p1-16.test.ts" as const;

export const DEPLOY_SKIP_VITEST_P1_16_LEGACY_GATE_TEST =
  "tests/unit/deploy-prebuilt-prod-gate.test.ts" as const;

export const DEPLOY_SKIP_VITEST_P1_16_DEPLOY_PROD_GATE_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const DEPLOY_SKIP_VITEST_P1_16_WIRING_PATHS = [
  DEPLOY_SKIP_VITEST_P1_16_DOC,
  DEPLOY_SKIP_VITEST_P1_16_PRIMARY_DEPLOY_SCRIPT,
  DEPLOY_SKIP_VITEST_P1_16_UNIT_TEST,
  DEPLOY_SKIP_VITEST_P1_16_LEGACY_GATE_TEST,
  DEPLOY_SKIP_VITEST_P1_16_DEPLOY_PROD_GATE_WORKFLOW,
  DEPLOY_SKIP_VITEST_P1_16_ARTIFACT,
] as const;
