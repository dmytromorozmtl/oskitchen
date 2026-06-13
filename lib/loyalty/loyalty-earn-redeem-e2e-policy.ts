/**
 * Blueprint P2-31 — Loyalty earn/redeem E2E (POS checkout).
 *
 * earn points → redeem at checkout → balance updated
 *
 * @see e2e/loyalty-earn-redeem-e2e.spec.ts
 * @see e2e/helpers/loyalty-earn-redeem-e2e-flow.ts
 */

export const LOYALTY_EARN_REDEEM_E2E_POLICY_ID = "loyalty-earn-redeem-e2e-p2-31-v1" as const;

export const LOYALTY_EARN_REDEEM_E2E_SPEC = "e2e/loyalty-earn-redeem-e2e.spec.ts" as const;

export const LOYALTY_EARN_REDEEM_E2E_FLOW_HELPER =
  "e2e/helpers/loyalty-earn-redeem-e2e-flow.ts" as const;

export const LOYALTY_EARN_REDEEM_E2E_READY_HELPER =
  "e2e/helpers/loyalty-earn-redeem-e2e-ready.ts" as const;

export const LOYALTY_EARN_REDEEM_E2E_AUDIT_SCRIPT =
  "scripts/audit-loyalty-earn-redeem-e2e.ts" as const;

export const LOYALTY_EARN_REDEEM_E2E_NPM_SCRIPT = "audit:loyalty-earn-redeem-e2e" as const;

export const LOYALTY_EARN_REDEEM_E2E_UNIT_TEST =
  "tests/unit/loyalty-earn-redeem-e2e.test.ts" as const;

export const LOYALTY_EARN_REDEEM_E2E_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const LOYALTY_REDEEM_INPUT_TEST_ID = "pos-loyalty-redeem-input" as const;

export const LOYALTY_BALANCE_TEST_ID = "pos-loyalty-balance" as const;

export const LOYALTY_EARN_REDEEM_E2E_VISIBLE_MS = 60_000 as const;

export const LOYALTY_EARN_REDEEM_E2E_REDEEM_POINTS = 100 as const;

export const LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS = [
  "seed_customer",
  "earn_points_checkout",
  "verify_balance_earned",
  "redeem_at_checkout",
  "verify_balance_updated",
] as const;

export type LoyaltyEarnRedeemE2EFlowStep = (typeof LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS)[number];

export function hasLoyaltyEarnRedeemE2ECredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isLoyaltyEarnRedeemE2EEnabled(): boolean {
  return process.env.E2E_LOYALTY_EARN_REDEEM?.trim() === "true";
}
