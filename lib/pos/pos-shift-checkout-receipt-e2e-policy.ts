/**
 * Blueprint P1-42 — POS shift → checkout → receipt E2E (critical money path).
 *
 * @see e2e/pos-shift-checkout-receipt.spec.ts
 * @see components/dashboard/pos-terminal/receipt-panel.tsx
 * @see e2e/helpers/pos-checkout-shift-flow.ts
 */

export const POS_SHIFT_CHECKOUT_RECEIPT_E2E_POLICY_ID =
  "pos-shift-checkout-receipt-e2e-v1" as const;

export const POS_TERMINAL_PATH = "/dashboard/pos/terminal" as const;
export const POS_SHIFTS_PATH = "/dashboard/pos/shifts" as const;

export const POS_RECEIPT_PANEL_TEST_ID = "pos-receipt-panel" as const;
export const POS_CHECKOUT_STATUS_TEST_ID = "pos-checkout-status" as const;
export const POS_COMPLETE_SALE_TEST_ID = "pos-complete-sale" as const;
export const POS_PRODUCT_TILE_TEST_ID = "pos-product-tile" as const;

export const POS_RECEIPT_SUCCESS_PATTERN = /sale complete/i;
export const POS_RECEIPT_ORDER_PATTERN = /order\s+([a-f0-9]{8})/i;
export const POS_RECEIPT_NUMBER_PATTERN = /receipt\s+(\S+)/i;

export const POS_SHIFT_CHECKOUT_RECEIPT_VISIBLE_MS = 60_000 as const;

export const POS_SHIFT_CHECKOUT_RECEIPT_E2E_SPEC =
  "e2e/pos-shift-checkout-receipt.spec.ts" as const;
export const POS_SHIFT_CHECKOUT_RECEIPT_FLOW_HELPER =
  "e2e/helpers/pos-shift-checkout-receipt-flow.ts" as const;
export const POS_SHIFT_CHECKOUT_RECEIPT_READY_HELPER =
  "e2e/helpers/pos-shift-checkout-receipt-ready.ts" as const;
export const POS_SHIFT_CHECKOUT_RECEIPT_AUDIT_SCRIPT =
  "scripts/audit-pos-shift-checkout-receipt-e2e.ts" as const;
export const POS_SHIFT_CHECKOUT_RECEIPT_NPM_SCRIPT =
  "audit:pos-shift-checkout-receipt-e2e" as const;
export const POS_SHIFT_CHECKOUT_RECEIPT_UNIT_TEST =
  "tests/unit/pos-shift-checkout-receipt-e2e.test.ts" as const;
export const POS_SHIFT_CHECKOUT_RECEIPT_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS = [
  "open_shift",
  "terminal_ready",
  "checkout",
  "receipt",
] as const;

export type PosShiftCheckoutReceiptFlowStep =
  (typeof POS_SHIFT_CHECKOUT_RECEIPT_FLOW_STEPS)[number];

export function parsePosReceiptCheckoutStatus(text: string): {
  saleComplete: boolean;
  orderPrefix: string | null;
  receiptRef: string | null;
} {
  const saleComplete = POS_RECEIPT_SUCCESS_PATTERN.test(text);
  const orderMatch = text.match(POS_RECEIPT_ORDER_PATTERN);
  const receiptMatch = text.match(POS_RECEIPT_NUMBER_PATTERN);
  return {
    saleComplete,
    orderPrefix: orderMatch?.[1] ?? null,
    receiptRef: receiptMatch?.[1] ?? null,
  };
}

export function hasPosShiftCheckoutReceiptCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}
