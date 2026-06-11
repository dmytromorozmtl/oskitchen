/**
 * Blueprint P1-52 — POS shift open → close E2E (full shift cycle with totals).
 *
 * @see e2e/pos-shift-open-close.spec.ts
 * @see e2e/pos-checkout-shift-close-report.spec.ts
 * @see lib/pos/pos-shift-closeout-math.ts
 */

export {
  POS_SHIFT_CLOSE_FORM_TEST_ID,
  POS_SHIFT_CLOSE_HISTORY_TEST_ID,
  POS_SHIFT_CLOSE_SUBMIT_TEST_ID,
  POS_SHIFTS_PATH,
  posShiftHistoryRowTestId,
} from "@/lib/pos/pos-checkout-shift-report-e2e-policy";

export {
  POS_CHECKOUT_STATUS_TEST_ID,
  POS_COMPLETE_SALE_TEST_ID,
  POS_PRODUCT_TILE_TEST_ID,
  POS_RECEIPT_PANEL_TEST_ID,
  POS_TERMINAL_PATH,
} from "@/lib/pos/pos-shift-checkout-receipt-e2e-policy";

export const POS_SHIFT_OPEN_CLOSE_E2E_POLICY_ID = "pos-shift-open-close-e2e-v1" as const;

export const POS_SHIFT_CLOSEOUT_PREVIEW_TEST_ID = "pos-shift-closeout-preview" as const;
export const POS_SHIFT_USE_EXPECTED_CASH_TEST_ID = "pos-shift-use-expected-cash" as const;
export const POS_SHIFT_CLOSING_CASH_INPUT_TEST_ID = "pos-shift-closing-cash-input" as const;
export const POS_SHIFT_CLOSE_SELECT_TEST_ID = "pos-shift-close-select" as const;

export const POS_SHIFT_BALANCED_VARIANCE_LABEL = "Balanced" as const;
export const POS_SHIFT_CASH_SALES_PATTERN = /Cash sales \(\d+\)/i;

export const POS_SHIFT_OPEN_CLOSE_VISIBLE_MS = 60_000 as const;

export const POS_SHIFT_OPEN_CLOSE_E2E_SPEC = "e2e/pos-shift-open-close.spec.ts" as const;
export const POS_SHIFT_OPEN_CLOSE_FLOW_HELPER =
  "e2e/helpers/pos-shift-open-close-flow.ts" as const;
export const POS_SHIFT_OPEN_CLOSE_READY_HELPER =
  "e2e/helpers/pos-shift-open-close-ready.ts" as const;
export const POS_SHIFT_OPEN_CLOSE_AUDIT_SCRIPT =
  "scripts/audit-pos-shift-open-close-e2e.ts" as const;
export const POS_SHIFT_OPEN_CLOSE_NPM_SCRIPT = "audit:pos-shift-open-close-e2e" as const;
export const POS_SHIFT_OPEN_CLOSE_UNIT_TEST =
  "tests/unit/pos-shift-open-close-e2e.test.ts" as const;
export const POS_SHIFT_OPEN_CLOSE_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const POS_SHIFT_OPEN_CLOSE_FLOW_STEPS = [
  "open_shift",
  "cash_sale",
  "close_shift",
  "verify_history_totals",
] as const;

export type PosShiftOpenCloseFlowStep = (typeof POS_SHIFT_OPEN_CLOSE_FLOW_STEPS)[number];

export function parseCashSalesTotalFromPreview(text: string): number | null {
  const match = text.match(/Cash sales \(\d+\)[\s\S]*?\$([\d,]+\.\d{2})/i);
  if (!match?.[1]) return null;
  const parsed = Number.parseFloat(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseExpectedCashFromPreview(text: string): number | null {
  const match = text.match(/Expected in drawer[\s\S]*?\$([\d,]+\.\d{2})/i);
  if (!match?.[1]) return null;
  const parsed = Number.parseFloat(match[1].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function closedShiftHistoryShowsBalanced(rowText: string): boolean {
  return rowText.includes(POS_SHIFT_BALANCED_VARIANCE_LABEL);
}

export function hasPosShiftOpenCloseCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function isPosShiftOpenCloseE2EEnabled(): boolean {
  return process.env.E2E_POS_SHIFT_OPEN_CLOSE?.trim() === "true";
}
