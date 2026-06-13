/**
 * Blueprint P1-20 — POS checkout E2E full scenario.
 *
 * shift → add item → discount → checkout → receipt → close → refund + void.
 *
 * @see e2e/pos-checkout-e2e.spec.ts
 * @see e2e/helpers/pos-checkout-e2e-flow.ts
 */

export {
  POS_CHECKOUT_STATUS_TEST_ID,
  POS_COMPLETE_SALE_TEST_ID,
  POS_PRODUCT_TILE_TEST_ID,
  POS_RECEIPT_PANEL_TEST_ID,
  POS_RECEIPT_ORDER_PATTERN,
  POS_RECEIPT_SUCCESS_PATTERN,
  POS_SHIFTS_PATH,
  POS_TERMINAL_PATH,
  parsePosReceiptCheckoutStatus,
} from "@/lib/pos/pos-shift-checkout-receipt-e2e-policy";

export const POS_CHECKOUT_E2E_POLICY_ID = "pos-checkout-e2e-p1-20-v1" as const;

export const POS_DISCOUNT_MODE_PERCENT_TEST_ID = "pos-discount-mode-percent" as const;
export const POS_DISCOUNT_PRESET_10_TEST_ID = "pos-discount-preset-10" as const;

export const POS_CHECKOUT_E2E_VISIBLE_MS = 60_000 as const;

export const POS_CHECKOUT_E2E_SPEC = "e2e/pos-checkout-e2e.spec.ts" as const;
export const POS_CHECKOUT_E2E_FLOW_HELPER = "e2e/helpers/pos-checkout-e2e-flow.ts" as const;
export const POS_CHECKOUT_E2E_READY_HELPER = "e2e/helpers/pos-checkout-e2e-ready.ts" as const;
export const POS_CHECKOUT_E2E_AUDIT_SCRIPT = "scripts/audit-pos-checkout-e2e.ts" as const;
export const POS_CHECKOUT_E2E_NPM_SCRIPT = "audit:pos-checkout-e2e" as const;
export const POS_CHECKOUT_E2E_UNIT_TEST = "tests/unit/pos-checkout-e2e.test.ts" as const;
export const POS_CHECKOUT_E2E_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const POS_CHECKOUT_E2E_FLOW_STEPS = [
  "open_shift",
  "add_item",
  "apply_discount",
  "checkout",
  "receipt",
  "refund",
  "void_sale",
  "close_shift",
] as const;

export type PosCheckoutE2EFlowStep = (typeof POS_CHECKOUT_E2E_FLOW_STEPS)[number];

export function posCheckoutOrderDetailPath(orderId: string): string {
  return `/dashboard/orders/${orderId}`;
}

export function hasPosCheckoutE2ECredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isPosCheckoutE2EEnabled(): boolean {
  return process.env.E2E_POS_CHECKOUT?.trim() === "true";
}
