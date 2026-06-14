/**
 * P1-30 — Self-serve onboarding: registration → integrations → first order (Square parity).
 *
 * @see docs/self-serve-onboarding-p1-30.md
 */

export const SELF_SERVE_ONBOARDING_P1_30_POLICY_ID =
  "self-serve-onboarding-p1-30-v1" as const;

export const SELF_SERVE_ONBOARDING_P1_30_DOC =
  "docs/self-serve-onboarding-p1-30.md" as const;

export const SELF_SERVE_ONBOARDING_P1_30_ARTIFACT =
  "artifacts/self-serve-onboarding-p1-30.json" as const;

export const SELF_SERVE_ONBOARDING_P1_30_WIZARD =
  "components/onboarding/quick-start-wizard.tsx" as const;

export const SELF_SERVE_ONBOARDING_P1_30_ACTION = "actions/quick-start.ts" as const;

export const SELF_SERVE_ONBOARDING_P1_30_SIGNUP_ACTION = "actions/auth.ts" as const;

export const SELF_SERVE_ONBOARDING_P1_30_ROUTE = "/dashboard/quick-start" as const;

export const SELF_SERVE_ONBOARDING_P1_30_SIGNUP_REDIRECT = "/dashboard/quick-start" as const;

export const SELF_SERVE_ONBOARDING_P1_30_WIZARD_TEST_ID = "quick-start-wizard" as const;

export const SELF_SERVE_ONBOARDING_P1_30_INTEGRATIONS_TEST_ID =
  "quick-start-integrations-step" as const;

export const SELF_SERVE_ONBOARDING_P1_30_CHECK_NPM_SCRIPT =
  "check:self-serve-onboarding-p1-30" as const;

export const SELF_SERVE_ONBOARDING_P1_30_CI_NPM_SCRIPT =
  "test:ci:self-serve-onboarding-p1-30" as const;

export const SELF_SERVE_ONBOARDING_P1_30_UNIT_TEST =
  "tests/unit/self-serve-onboarding-p1-30.test.ts" as const;

export const SELF_SERVE_ONBOARDING_P1_30_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

/** Zero-touch flow steps — registration through first order. */
export const SELF_SERVE_ONBOARDING_P1_30_FLOW_STEPS = [
  "registration",
  "menu",
  "integrations",
  "first-order",
] as const;

export const SELF_SERVE_ONBOARDING_P1_30_WIRING_PATHS = [
  SELF_SERVE_ONBOARDING_P1_30_DOC,
  SELF_SERVE_ONBOARDING_P1_30_WIZARD,
  SELF_SERVE_ONBOARDING_P1_30_ACTION,
  SELF_SERVE_ONBOARDING_P1_30_SIGNUP_ACTION,
  SELF_SERVE_ONBOARDING_P1_30_UNIT_TEST,
  SELF_SERVE_ONBOARDING_P1_30_ARTIFACT,
  SELF_SERVE_ONBOARDING_P1_30_CI_WORKFLOW,
] as const;
