/**
 * Blueprint P2-41 — Loyalty earn/redeem (Square parity).
 *
 * Storefront earn on order → redeem at checkout → balance updated.
 *
 * @see docs/loyalty-earn-redeem-p2-41.md
 */

export const LOYALTY_EARN_REDEEM_P2_41_POLICY_ID = "loyalty-earn-redeem-p2-41-v1" as const;

export const LOYALTY_EARN_REDEEM_P2_41_DOC = "docs/loyalty-earn-redeem-p2-41.md" as const;

export const LOYALTY_EARN_REDEEM_P2_41_ARTIFACT =
  "artifacts/loyalty-earn-redeem-p2-41-registry.json" as const;

export const LOYALTY_EARN_REDEEM_P2_41_SERVICE = "services/storefront/loyalty-service.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_41_CHECKOUT_PANEL =
  "components/storefront/storefront-loyalty-checkout-panel.tsx" as const;

export const LOYALTY_EARN_REDEEM_P2_41_CHECKOUT_CLIENT =
  "components/storefront/store-checkout-client.tsx" as const;

export const LOYALTY_EARN_REDEEM_P2_41_STOREFRONT_ORDER = "actions/storefront-order.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_41_STRIPE_HOOK =
  "services/storefront/storefront-stripe-checkout-service.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_41_BALANCE_ROUTE =
  "app/api/storefront/loyalty/balance/route.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_41_REDEEM_ROUTE =
  "app/api/storefront/loyalty/redeem/route.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_41_CHECKOUT_ROUTE = "/s/[storeSlug]/checkout" as const;

export const LOYALTY_EARN_REDEEM_P2_41_BALANCE_TEST_ID = "storefront-loyalty-balance" as const;

export const LOYALTY_EARN_REDEEM_P2_41_REDEEM_TEST_ID = "storefront-loyalty-redeem" as const;

export const LOYALTY_EARN_REDEEM_P2_41_AUDIT_SCRIPT =
  "scripts/audit-loyalty-earn-redeem-p2-41.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_41_NPM_SCRIPT = "audit:loyalty-earn-redeem-p2-41" as const;

export const LOYALTY_EARN_REDEEM_P2_41_CHECK_NPM_SCRIPT = "check:loyalty-earn-redeem-p2-41" as const;

export const LOYALTY_EARN_REDEEM_P2_41_UNIT_TEST =
  "tests/unit/loyalty-earn-redeem-p2-41.test.ts" as const;

export const LOYALTY_EARN_REDEEM_P2_41_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const LOYALTY_EARN_REDEEM_P2_41_FLOW_STEPS = [
  "lookup_balance_by_email",
  "redeem_points_at_checkout",
  "earn_points_on_order",
  "restore_on_payment_failure",
] as const;

export const LOYALTY_EARN_REDEEM_P2_41_HONESTY_MARKERS = [
  "Square parity",
  "storefront",
  "earn",
  "redeem",
  "balance",
] as const;

export const LOYALTY_EARN_REDEEM_P2_41_WIRING_PATHS = [
  LOYALTY_EARN_REDEEM_P2_41_DOC,
  "lib/loyalty/loyalty-earn-redeem-p2-41-audit.ts",
  LOYALTY_EARN_REDEEM_P2_41_SERVICE,
  LOYALTY_EARN_REDEEM_P2_41_CHECKOUT_PANEL,
  LOYALTY_EARN_REDEEM_P2_41_UNIT_TEST,
  LOYALTY_EARN_REDEEM_P2_41_ARTIFACT,
] as const;
