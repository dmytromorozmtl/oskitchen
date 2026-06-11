/**
 * POS refund flow E2E policy (QA-35).
 *
 * Full/partial refund → order paymentStatus + audit + Stripe idempotency.
 *
 * @see e2e/refund-flow-e2e.spec.ts
 * @see services/pos/pos-refund-service.ts
 * @see docs/knowledge-base/11-handling-refunds.md
 */

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { posRefundIdempotencyKey } from "@/lib/idempotency/idempotency-keys";

export { posRefundIdempotencyKey };

export const REFUND_FLOW_E2E_POLICY_ID = "refund-flow-e2e-v1" as const;

export const REFUND_FLOW_SLI_ID = "pos.refund_flow_integrity" as const;

export const POS_REFUND_PERMISSION = "pos.refund" as const;
export const POS_VOID_PERMISSION = "pos.void" as const;

export const POS_TERMINAL_PATH = "/dashboard/pos/terminal" as const;
export const POS_ORDERS_PATH = "/dashboard/orders" as const;

export const POS_COMPLETE_SALE_TESTID = "pos-complete-sale" as const;
export const POS_CHECKOUT_STATUS_TESTID = "pos-checkout-status" as const;
export const POS_PRODUCT_TILE_TESTID = "pos-product-tile" as const;

export const REFUND_AUDIT_ACTION = AUDIT_ACTIONS.POS_TRANSACTION_REFUNDED;

export const REFUND_PAYMENT_STATUS_FULL = "REFUNDED" as const;
export const REFUND_PAYMENT_STATUS_PARTIAL = "PARTIALLY_REFUNDED" as const;
export const REFUND_PAYMENT_STATUS_PAID = "PAID" as const;

export const REFUND_DENIED_ALREADY_FULL =
  "This sale was already fully refunded." as const;
export const REFUND_DENIED_PARTIAL_WITHOUT_AMOUNT =
  "This sale was already partially refunded. Specify a partial amount." as const;
export const REFUND_DENIED_VOIDED = "Cannot refund a voided transaction." as const;
export const REFUND_DENIED_NOT_FOUND = "Transaction not found." as const;

export type RefundFlowKind = "full" | "partial";

export type RefundFlowContract = {
  ok: boolean;
  paymentStatus: string | null;
  partialAmount: number | null;
  stripeSkipped: boolean;
  auditWritten: boolean;
};

export function expectedRefundPaymentStatus(kind: RefundFlowKind): string {
  return kind === "partial" ? REFUND_PAYMENT_STATUS_PARTIAL : REFUND_PAYMENT_STATUS_FULL;
}

export function refundFlowWithinContract(contract: RefundFlowContract): boolean {
  return contract.ok && contract.paymentStatus != null && contract.auditWritten;
}

export function isKnownRefundDeniedError(message: string): boolean {
  return (
    message === REFUND_DENIED_ALREADY_FULL ||
    message === REFUND_DENIED_PARTIAL_WITHOUT_AMOUNT ||
    message === REFUND_DENIED_VOIDED ||
    message === REFUND_DENIED_NOT_FOUND ||
    message === "Partial refund amount is invalid." ||
    message === "Stripe refund failed"
  );
}

export function orderDetailPath(orderId: string): string {
  return `${POS_ORDERS_PATH}/${orderId}`;
}
