/**
 * Blueprint P3-142 — 15-minute onboarding (Square parity: fast self-serve signup).
 *
 * @see docs/fifteen-minute-onboarding.md
 */

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_POLICY_ID =
  "fifteen-minute-onboarding-p3-142-v1" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_DOC = "docs/fifteen-minute-onboarding.md" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_ARTIFACT =
  "artifacts/fifteen-minute-onboarding-registry.json" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_AUDIT_SCRIPT =
  "scripts/audit-fifteen-minute-onboarding-p3-142.ts" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_NPM_SCRIPT =
  "audit:fifteen-minute-onboarding-p3-142" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_UNIT_TEST =
  "tests/unit/fifteen-minute-onboarding-p3-142.test.ts" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_COMPETITOR = "square" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_TARGET_MINUTES = 15 as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_ROUTE = "/dashboard/quick-start" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_HEADLINE =
  "First order in about 15 minutes" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_STEP_IDS = ["profile", "menu", "order"] as const;

export type FifteenMinuteOnboardingStepId =
  (typeof FIFTEEN_MINUTE_ONBOARDING_P3_142_STEP_IDS)[number];

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_IMPLEMENTATION_REFS = {
  quickStartWizard: "components/onboarding/quick-start-wizard.tsx",
  quickStartService: "services/onboarding/quick-start-service.ts",
  singleOnboardingEntry: "single-onboarding-entry-p1-57-v1",
  e2eSpec: "e2e/quick-start-15min.spec.ts",
} as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_WIZARD_MODULE =
  "components/onboarding/quick-start-wizard.tsx" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_PAGE_MODULE =
  "app/dashboard/quick-start/page.tsx" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_E2E_SPEC =
  "e2e/quick-start-15min.spec.ts" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_LIVE_AUDIT_NPM =
  "test:ci:fifteen-minute-onboarding-p3-142" as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_RELATED_DOCS = [
  "docs/competitor-battle-cards/square.md",
  "docs/kb/quick-start-guide.md",
  "docs/quick-start-single-entry-ia.md",
  "docs/software-first-pos-positioning.md",
  "lib/design/single-onboarding-entry-policy.ts",
  "lib/onboarding/quick-start-types.ts",
] as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_HONESTY_MARKERS = [
  "not affiliated",
  "0 signed LOIs",
  "BETA",
  "baseline",
  "typical",
] as const;

export const FIFTEEN_MINUTE_ONBOARDING_P3_142_WIRING_PATHS = [
  FIFTEEN_MINUTE_ONBOARDING_P3_142_DOC,
  "lib/onboarding/fifteen-minute-onboarding-p3-142-policy.ts",
  "lib/onboarding/fifteen-minute-onboarding-p3-142-operations.ts",
  "lib/onboarding/fifteen-minute-onboarding-p3-142-audit.ts",
  FIFTEEN_MINUTE_ONBOARDING_P3_142_ARTIFACT,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_UNIT_TEST,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_WIZARD_MODULE,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_PAGE_MODULE,
  FIFTEEN_MINUTE_ONBOARDING_P3_142_E2E_SPEC,
] as const;
