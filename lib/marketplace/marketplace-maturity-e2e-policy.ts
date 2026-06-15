/**
 * Blueprint P2-122 — Marketplace maturity E2E (buyer → cart → PO → fulfill → payout).
 *
 * Extends P1-44 cart → PO → fulfill with vendor finance payout request.
 *
 * @see e2e/marketplace-checkout-fulfill-payout.spec.ts
 * @see e2e/helpers/marketplace-maturity-e2e-flow.ts
 * @see lib/marketplace/marketplace-cart-po-fulfill-e2e-policy.ts
 * @see services/marketplace/vendor-finance-service.ts
 */

import {
  MARKETPLACE_CART_PATH,
  MARKETPLACE_PO_CHECKOUT_PATH,
  MARKETPLACE_PO_ORDERS_PATH,
  vendorOrderPath,
} from "@/lib/marketplace/marketplace-cart-po-fulfill-e2e-policy";

export const MARKETPLACE_MATURITY_E2E_POLICY_ID =
  "marketplace-maturity-e2e-v1" as const;

export const MARKETPLACE_VENDOR_FINANCE_PATH = "/vendor/finance" as const;

export const MARKETPLACE_PAYOUT_INITIATED_PATTERN = /payout .* initiated/i;
export const MARKETPLACE_AVAILABLE_BALANCE_LABEL = /available balance/i;

export const MARKETPLACE_MATURITY_E2E_VISIBLE_MS = 60_000 as const;

export const MARKETPLACE_MATURITY_E2E_SPEC =
  "e2e/marketplace-checkout-fulfill-payout.spec.ts" as const;
export const MARKETPLACE_MATURITY_E2E_FLOW_HELPER =
  "e2e/helpers/marketplace-maturity-e2e-flow.ts" as const;
export const MARKETPLACE_MATURITY_E2E_READY_HELPER =
  "e2e/helpers/marketplace-maturity-e2e-ready.ts" as const;
export const MARKETPLACE_MATURITY_E2E_AUDIT_SCRIPT =
  "scripts/audit-marketplace-maturity-e2e.ts" as const;
export const MARKETPLACE_MATURITY_E2E_NPM_SCRIPT =
  "audit:marketplace-maturity-e2e" as const;
export const MARKETPLACE_MATURITY_E2E_UNIT_TEST =
  "tests/unit/marketplace-maturity-e2e.test.ts" as const;
export const MARKETPLACE_MATURITY_LIFECYCLE_UNIT_TEST =
  "tests/unit/marketplace-checkout-fulfill-payout.test.ts" as const;
export const MARKETPLACE_MATURITY_E2E_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const MARKETPLACE_MATURITY_E2E_FLOW_STEPS = [
  "cart_add",
  "checkout_po",
  "buyer_po",
  "vendor_fulfill",
  "vendor_payout",
] as const;

export type MarketplaceMaturityE2EFlowStep =
  (typeof MARKETPLACE_MATURITY_E2E_FLOW_STEPS)[number];

export {
  MARKETPLACE_CART_PATH,
  MARKETPLACE_PO_CHECKOUT_PATH,
  MARKETPLACE_PO_ORDERS_PATH,
  vendorOrderPath,
};

export function hasMarketplaceMaturityE2ECredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isMarketplacePayoutEligible(availableBalanceUsd: number): boolean {
  return availableBalanceUsd > 0;
}
