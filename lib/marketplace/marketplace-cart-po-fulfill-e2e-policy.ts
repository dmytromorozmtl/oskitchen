/**
 * Blueprint P1-44 — Marketplace cart → PO → fulfill E2E (full marketplace flow).
 *
 * @see e2e/marketplace-cart-po-fulfill.spec.ts
 * @see e2e/helpers/marketplace-catalog-checkout-vendor-order-flow.ts
 * @see e2e/marketplace-checkout-fulfill-payout.spec.ts
 */

import {
  MARKETPLACE_BUYER_ORDERS_PATH,
  MARKETPLACE_CATALOG_PATH,
  MARKETPLACE_CHECKOUT_PATH,
  VENDOR_ORDERS_PATH,
  vendorOrderPath,
} from "@/lib/marketplace/marketplace-catalog-checkout-vendor-order-e2e-policy";

export const MARKETPLACE_CART_PO_FULFILL_E2E_POLICY_ID =
  "marketplace-cart-po-fulfill-e2e-v1" as const;

export const MARKETPLACE_CART_PATH = MARKETPLACE_CATALOG_PATH;
export const MARKETPLACE_PO_CHECKOUT_PATH = MARKETPLACE_CHECKOUT_PATH;
export const MARKETPLACE_PO_ORDERS_PATH = MARKETPLACE_BUYER_ORDERS_PATH;
export const MARKETPLACE_VENDOR_ORDERS_PATH = VENDOR_ORDERS_PATH;

export const MARKETPLACE_CART_ADDED_PATTERN = /added to marketplace cart/i;
export const MARKETPLACE_CHECKOUT_PO_PATTERN =
  /checkout complete|submitted for manager approval/i;
export const MARKETPLACE_FULFILL_SHIPPED_PATTERN = /shipped/i;

export const MARKETPLACE_CART_PO_FULFILL_VISIBLE_MS = 60_000 as const;

export const MARKETPLACE_CART_PO_FULFILL_E2E_SPEC =
  "e2e/marketplace-cart-po-fulfill.spec.ts" as const;
export const MARKETPLACE_CART_PO_FULFILL_FLOW_HELPER =
  "e2e/helpers/marketplace-cart-po-fulfill-flow.ts" as const;
export const MARKETPLACE_CART_PO_FULFILL_READY_HELPER =
  "e2e/helpers/marketplace-cart-po-fulfill-ready.ts" as const;
export const MARKETPLACE_CART_PO_FULFILL_AUDIT_SCRIPT =
  "scripts/audit-marketplace-cart-po-fulfill-e2e.ts" as const;
export const MARKETPLACE_CART_PO_FULFILL_NPM_SCRIPT =
  "audit:marketplace-cart-po-fulfill-e2e" as const;
export const MARKETPLACE_CART_PO_FULFILL_UNIT_TEST =
  "tests/unit/marketplace-cart-po-fulfill-e2e.test.ts" as const;
export const MARKETPLACE_CART_PO_FULFILL_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS = [
  "cart_add",
  "checkout_po",
  "buyer_po",
  "vendor_fulfill",
] as const;

export type MarketplaceCartPoFulfillFlowStep =
  (typeof MARKETPLACE_CART_PO_FULFILL_FLOW_STEPS)[number];

export { vendorOrderPath };

export function hasMarketplaceCartPoFulfillCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isMarketplaceFulfillmentTerminalStatus(status: string): boolean {
  return status === "SHIPPED" || status === "COMPLETED" || status === "DELIVERED";
}
