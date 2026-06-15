import { expect, test } from "@playwright/test";

import {
  POS_REFUND_PERMISSION,
  POS_TERMINAL_PATH,
  REFUND_AUDIT_ACTION,
  REFUND_DENIED_ALREADY_FULL,
  REFUND_DENIED_PARTIAL_WITHOUT_AMOUNT,
  REFUND_FLOW_E2E_POLICY_ID,
  REFUND_FLOW_SLI_ID,
  REFUND_PAYMENT_STATUS_FULL,
  REFUND_PAYMENT_STATUS_PARTIAL,
  expectedRefundPaymentStatus,
  isKnownRefundDeniedError,
  posRefundIdempotencyKey,
  refundFlowWithinContract,
} from "@/lib/pos/refund-flow-e2e-policy";
import { refundFlowSucceeded, summarizeRefundFlowResult } from "@/lib/pos/refund-flow-metrics";

import { runFullCashRefundFlow } from "./helpers/refund-flow-flow";
import { skipRefundFlowIfNoDb, skipRefundFlowIfNotAuthed } from "./helpers/refund-flow-ready";

/**
 * POS refund flow E2E (QA-35).
 *
 * @see services/pos/pos-refund-service.ts
 * @see e2e/pos-checkout-staging.spec.ts
 */

test.describe("refund flow policy", () => {
  test("exports refund permission and idempotency contract", () => {
    expect(REFUND_FLOW_E2E_POLICY_ID).toBe("refund-flow-e2e-v1");
    expect(REFUND_FLOW_SLI_ID).toBe("pos.refund_flow_integrity");
    expect(POS_REFUND_PERMISSION).toBe("pos.refund");
    expect(POS_TERMINAL_PATH).toBe("/dashboard/pos/terminal");
    expect(REFUND_AUDIT_ACTION).toBe("POS_TRANSACTION_REFUNDED");
    expect(posRefundIdempotencyKey("tx-1")).toBe("pos_refund_tx-1_full");
    expect(posRefundIdempotencyKey("tx-1", 5)).toBe("pos_refund_tx-1_partial_500");
    expect(expectedRefundPaymentStatus("full")).toBe(REFUND_PAYMENT_STATUS_FULL);
    expect(expectedRefundPaymentStatus("partial")).toBe(REFUND_PAYMENT_STATUS_PARTIAL);
  });

  test("evaluates refund flow contract and known denial errors", () => {
    const summary = summarizeRefundFlowResult({
      ok: true,
      paymentStatus: REFUND_PAYMENT_STATUS_FULL,
      partialAmount: null,
      stripeSkipped: true,
      auditWritten: true,
    });
    expect(refundFlowWithinContract(summary)).toBe(true);
    expect(refundFlowSucceeded(summary)).toBe(true);
    expect(isKnownRefundDeniedError(REFUND_DENIED_ALREADY_FULL)).toBe(true);
    expect(isKnownRefundDeniedError(REFUND_DENIED_PARTIAL_WITHOUT_AMOUNT)).toBe(true);
    expect(isKnownRefundDeniedError("unknown")).toBe(false);
  });
});

test.describe("refund flow staging (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Refund flow staging runs in chromium-authed project only",
    );
    skipRefundFlowIfNotAuthed();
    skipRefundFlowIfNoDb();
  });

  test("cash sale → full refund updates order paymentStatus", async ({ page }) => {
    const { orderId, transactionId } = await runFullCashRefundFlow(page);
    expect(orderId.length).toBeGreaterThan(0);
    expect(transactionId.length).toBeGreaterThan(0);
  });
});
