/**
 * P1-36 — Loyalty earn→redeem E2E: order → points → CRM → apply on next order.
 *
 * @see docs/loyalty-earn-redeem-e2e-p1-36.md
 * @see e2e/loyalty-earn-redeem-e2e.spec.ts
 */

export {
  CRM_LOYALTY_POINTS_TEST_ID,
  CRM_UNIFIED_PROFILE_PATH,
  LOYALTY_BALANCE_TEST_ID,
  LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS,
  LOYALTY_EARN_REDEEM_E2E_SPEC,
  LOYALTY_EARN_REDEEM_E2E_FLOW_HELPER,
  LOYALTY_EARN_REDEEM_E2E_READY_HELPER,
  LOYALTY_EARN_REDEEM_E2E_AUDIT_SCRIPT,
  LOYALTY_EARN_REDEEM_E2E_UNIT_TEST,
  LOYALTY_REDEEM_INPUT_TEST_ID,
  hasLoyaltyEarnRedeemE2ECredentials,
  isLoyaltyEarnRedeemE2EEnabled,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-policy";

export const LOYALTY_EARN_REDEEM_E2E_P1_36_POLICY_ID =
  "loyalty-earn-redeem-e2e-p1-36-v1" as const;

export const LOYALTY_EARN_REDEEM_E2E_P1_36_DOC =
  "docs/loyalty-earn-redeem-e2e-p1-36.md" as const;

export const LOYALTY_EARN_REDEEM_E2E_P1_36_ARTIFACT =
  "artifacts/loyalty-earn-redeem-e2e-p1-36.json" as const;

export const LOYALTY_EARN_REDEEM_E2E_P1_36_AUDIT_MODULE =
  "lib/loyalty/loyalty-earn-redeem-e2e-p1-36-audit.ts" as const;

export const LOYALTY_EARN_REDEEM_E2E_P1_36_CHECK_NPM_SCRIPT =
  "check:loyalty-earn-redeem-e2e-p1-36" as const;

export const LOYALTY_EARN_REDEEM_E2E_P1_36_CI_NPM_SCRIPT =
  "test:ci:loyalty-earn-redeem-e2e-p1-36" as const;

export const LOYALTY_EARN_REDEEM_E2E_P1_36_UNIT_TEST =
  "tests/unit/loyalty-earn-redeem-e2e-p1-36.test.ts" as const;

export const LOYALTY_EARN_REDEEM_E2E_P1_36_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const LOYALTY_EARN_REDEEM_E2E_P1_36_E2E_NPM_SCRIPT =
  "test:e2e:loyalty-earn-redeem-e2e" as const;

/** Gap-closure chain: order → points → CRM → apply on next order. */
export const LOYALTY_EARN_REDEEM_E2E_P1_36_CHAIN = [
  "order",
  "points",
  "crm",
  "apply_next",
] as const;

export const LOYALTY_EARN_REDEEM_E2E_P1_36_WIRING_PATHS = [
  LOYALTY_EARN_REDEEM_E2E_P1_36_DOC,
  LOYALTY_EARN_REDEEM_E2E_P1_36_AUDIT_MODULE,
  LOYALTY_EARN_REDEEM_E2E_P1_36_UNIT_TEST,
  LOYALTY_EARN_REDEEM_E2E_P1_36_ARTIFACT,
  LOYALTY_EARN_REDEEM_E2E_P1_36_CI_WORKFLOW,
  "lib/loyalty/loyalty-earn-redeem-e2e-policy.ts",
  "lib/loyalty/loyalty-earn-redeem-e2e-audit.ts",
  "e2e/loyalty-earn-redeem-e2e.spec.ts",
  "e2e/helpers/loyalty-earn-redeem-e2e-flow.ts",
  "components/crm/unified-customer-profile-panel.tsx",
] as const;
