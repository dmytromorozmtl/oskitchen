/**
 * Blueprint P2-40 — Onboarding TTV measurement (<30 min to first order).
 *
 * @see docs/onboarding-ttv-p2-40.md
 */

export const ONBOARDING_TTV_P2_40_POLICY_ID = "onboarding-ttv-p2-40-v1" as const;

export const ONBOARDING_TTV_P2_40_TARGET_MINUTES = 30 as const;

export const ONBOARDING_TTV_P2_40_DOC = "docs/onboarding-ttv-p2-40.md" as const;

export const ONBOARDING_TTV_P2_40_ARTIFACT =
  "artifacts/onboarding-ttv-p2-40-registry.json" as const;

export const ONBOARDING_TTV_P2_40_MEASUREMENT_MODULE =
  "lib/onboarding/onboarding-ttv-p2-40-measurement.ts" as const;

export const ONBOARDING_TTV_P2_40_SERVICE = "services/onboarding/onboarding-ttv-service.ts" as const;

export const ONBOARDING_TTV_P2_40_STRIP = "components/onboarding/onboarding-ttv-strip.tsx" as const;

export const ONBOARDING_TTV_P2_40_ORDER_HOOK =
  "services/orders/order-creation-service.ts" as const;

export const ONBOARDING_TTV_P2_40_LIFECYCLE_EVENT = "onboarding_ttv_first_order" as const;

export const ONBOARDING_TTV_P2_40_AUDIT_SCRIPT = "scripts/audit-onboarding-ttv-p2-40.ts" as const;

export const ONBOARDING_TTV_P2_40_NPM_SCRIPT = "audit:onboarding-ttv-p2-40" as const;

export const ONBOARDING_TTV_P2_40_CHECK_NPM_SCRIPT = "check:onboarding-ttv-p2-40" as const;

export const ONBOARDING_TTV_P2_40_UNIT_TEST = "tests/unit/onboarding-ttv-p2-40.test.ts" as const;

export const ONBOARDING_TTV_P2_40_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const ONBOARDING_TTV_P2_40_TODAY_ROUTE = "/dashboard/today" as const;

export const ONBOARDING_TTV_P2_40_STRIP_TEST_ID = "onboarding-ttv-strip" as const;

export const ONBOARDING_TTV_P2_40_FLOW_STEPS = [
  "measure_signup_to_first_order",
  "record_lifecycle_event",
  "render_ttv_strip",
  "assert_target_30_min",
] as const;

export const ONBOARDING_TTV_P2_40_HONESTY_MARKERS = [
  "UserProfile.createdAt",
  "30 min",
  "first order",
  "lifecycle event",
] as const;

export const ONBOARDING_TTV_P2_40_WIRING_PATHS = [
  ONBOARDING_TTV_P2_40_DOC,
  ONBOARDING_TTV_P2_40_MEASUREMENT_MODULE,
  "lib/onboarding/onboarding-ttv-p2-40-audit.ts",
  ONBOARDING_TTV_P2_40_SERVICE,
  ONBOARDING_TTV_P2_40_STRIP,
  ONBOARDING_TTV_P2_40_UNIT_TEST,
  ONBOARDING_TTV_P2_40_ARTIFACT,
] as const;
