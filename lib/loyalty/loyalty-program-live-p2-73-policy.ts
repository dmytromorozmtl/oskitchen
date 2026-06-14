/**
 * P2-73 — Loyalty program earn/redeem LIVE: full E2E POS + storefront apply.
 *
 * @see docs/loyalty-program-live-p2-73.md
 */

export const LOYALTY_PROGRAM_LIVE_P2_73_POLICY_ID = "loyalty-program-live-p2-73-v1" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_DOC = "docs/loyalty-program-live-p2-73.md" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_ARTIFACT =
  "artifacts/loyalty-program-live-p2-73.json" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_FLOW_MODULE =
  "lib/loyalty/loyalty-program-live-p2-73-flow.ts" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_SCORING_MODULE =
  "lib/loyalty/loyalty-program-live-p2-73-scoring.ts" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_AUDIT_MODULE =
  "lib/loyalty/loyalty-program-live-p2-73-audit.ts" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_PANEL =
  "components/loyalty/loyalty-program-live-panel.tsx" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_CUSTOMERS_PAGE =
  "app/dashboard/customers/loyalty/page.tsx" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_CHECK_NPM_SCRIPT =
  "check:loyalty-program-live-p2-73" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_CI_NPM_SCRIPT =
  "test:ci:loyalty-program-live-p2-73" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_UNIT_TEST =
  "tests/unit/loyalty-program-live-p2-73.test.ts" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_PANEL_TEST_ID = "loyalty-program-live-panel" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_POS_CHANNEL_TEST_ID =
  "loyalty-program-live-pos-channel" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_STOREFRONT_CHANNEL_TEST_ID =
  "loyalty-program-live-storefront-channel" as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_SCENARIO_COUNT = 6 as const;

/** Full cross-channel chain: earn → CRM balance → redeem on next order. */
export const LOYALTY_PROGRAM_LIVE_P2_73_FULL_CHAIN = [
  "order_earn",
  "crm_balance",
  "redeem_apply",
  "balance_updated",
] as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_CHANNELS = ["pos", "storefront"] as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_UPSTREAM_POLICIES = [
  "loyalty-earn-redeem-p2-62-v1",
  "loyalty-earn-redeem-p2-41-v1",
  "loyalty-earn-redeem-e2e-p1-36-v1",
] as const;

export const LOYALTY_PROGRAM_LIVE_P2_73_WIRING_PATHS = [
  LOYALTY_PROGRAM_LIVE_P2_73_DOC,
  LOYALTY_PROGRAM_LIVE_P2_73_ARTIFACT,
  LOYALTY_PROGRAM_LIVE_P2_73_FLOW_MODULE,
  LOYALTY_PROGRAM_LIVE_P2_73_SCORING_MODULE,
  LOYALTY_PROGRAM_LIVE_P2_73_AUDIT_MODULE,
  LOYALTY_PROGRAM_LIVE_P2_73_PANEL,
  LOYALTY_PROGRAM_LIVE_P2_73_CUSTOMERS_PAGE,
  LOYALTY_PROGRAM_LIVE_P2_73_UNIT_TEST,
  LOYALTY_PROGRAM_LIVE_P2_73_CI_WORKFLOW,
  "lib/loyalty/loyalty-earn-redeem-p2-62-policy.ts",
  "lib/loyalty/loyalty-earn-redeem-p2-41-policy.ts",
  "lib/loyalty/loyalty-earn-redeem-e2e-p1-36-policy.ts",
  "services/loyalty/loyalty-service.ts",
  "services/pos/pos-checkout-service.ts",
  "services/storefront/loyalty-service.ts",
  "components/storefront/storefront-loyalty-checkout-panel.tsx",
  "components/dashboard/pos-terminal/payment-panel.tsx",
] as const;
