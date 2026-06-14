/**
 * P2-62 — Loyalty earn/redeem LIVE with POS integration (Square parity).
 *
 * Promotes loyalty from preview → LIVE; POS + storefront earn/redeem wired.
 *
 * @see docs/loyalty-earn-redeem-p2-62.md
 */

export const LOYALTY_EARN_REDEEM_P2_62_POLICY_ID = "loyalty-earn-redeem-p2-62-v1" as const;

export const LOYALTY_EARN_REDEEM_P2_62_DOC = "docs/loyalty-earn-redeem-p2-62.md" as const;

export const LOYALTY_EARN_REDEEM_P2_62_ARTIFACT =
  "artifacts/loyalty-earn-redeem-p2-62.json" as const;

export const LOYALTY_EARN_REDEEM_P2_62_AUDIT_MODULE =
  "lib/loyalty/loyalty-earn-redeem-p2-62-audit.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_62_CHECK_NPM_SCRIPT =
  "check:loyalty-earn-redeem-p2-62" as const;

export const LOYALTY_EARN_REDEEM_P2_62_CI_NPM_SCRIPT =
  "test:ci:loyalty-earn-redeem-p2-62" as const;

export const LOYALTY_EARN_REDEEM_P2_62_UNIT_TEST =
  "tests/unit/loyalty-earn-redeem-p2-62.test.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_62_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const LOYALTY_EARN_REDEEM_P2_62_POS_CHECKOUT_SERVICE =
  "services/pos/pos-checkout-service.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_62_POS_ACTION = "actions/pos.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_62_POS_PAYMENT_PANEL =
  "components/dashboard/pos-terminal/payment-panel.tsx" as const;

export const LOYALTY_EARN_REDEEM_P2_62_LOYALTY_SERVICE =
  "services/loyalty/loyalty-service.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_62_STOREFRONT_POLICY =
  "lib/loyalty/loyalty-earn-redeem-p2-41-policy.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_62_E2E_POLICY =
  "lib/loyalty/loyalty-earn-redeem-e2e-policy.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_62_LIVE_ROUTES = [
  "/dashboard/customers/loyalty",
  "/dashboard/storefront/loyalty",
] as const;

export const LOYALTY_EARN_REDEEM_P2_62_POS_REDEEM_TEST_ID = "pos-loyalty-redeem-input" as const;

export const LOYALTY_EARN_REDEEM_P2_62_POS_BALANCE_TEST_ID = "pos-loyalty-balance" as const;

export const LOYALTY_EARN_REDEEM_P2_62_FLOW_STEPS = [
  "pos_redeem_at_checkout",
  "pos_earn_on_sale",
  "storefront_earn_redeem",
  "crm_balance_sync",
] as const;

export const LOYALTY_EARN_REDEEM_P2_62_SQUARE_PARITY_NOTE =
  "POS + storefront earn on order, redeem at checkout — Square parity for in-house channels; not certified third-party Square Loyalty API." as const;

export const LOYALTY_EARN_REDEEM_P2_62_WIRING_PATHS = [
  LOYALTY_EARN_REDEEM_P2_62_DOC,
  LOYALTY_EARN_REDEEM_P2_62_AUDIT_MODULE,
  LOYALTY_EARN_REDEEM_P2_62_UNIT_TEST,
  LOYALTY_EARN_REDEEM_P2_62_ARTIFACT,
  LOYALTY_EARN_REDEEM_P2_62_CI_WORKFLOW,
  LOYALTY_EARN_REDEEM_P2_62_POS_CHECKOUT_SERVICE,
  LOYALTY_EARN_REDEEM_P2_62_POS_ACTION,
  LOYALTY_EARN_REDEEM_P2_62_POS_PAYMENT_PANEL,
  LOYALTY_EARN_REDEEM_P2_62_LOYALTY_SERVICE,
  LOYALTY_EARN_REDEEM_P2_62_STOREFRONT_POLICY,
  LOYALTY_EARN_REDEEM_P2_62_E2E_POLICY,
  "lib/navigation/nav-audit-suppressed-prefixes.ts",
] as const;
