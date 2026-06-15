import { beforeEach, describe, expect, it, vi } from "vitest";

const attemptStripePosRefund = vi.hoisted(() => vi.fn());
const auditLog = vi.hoisted(() => vi.fn());
const requireMutationPermission = vi.hoisted(() => vi.fn());
const canUseFeature = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  pOSTransaction: { findFirst: vi.fn() },
  order: { update: vi.fn() },
}));

vi.mock("@/services/pos/pos-stripe-refund-service", () => ({
  attemptStripePosRefund,
}));

vi.mock("@/services/audit/audit-service", () => ({
  auditLog,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/plans/feature-registry", () => ({
  canUseFeature,
}));

vi.mock("@/services/pos/pos-permission-audit", () => ({
  logPosPermissionDenied: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { posRefundTransactionAction } from "@/actions/pos";
import {
  REFUND_AUDIT_ACTION,
  REFUND_FLOW_E2E_POLICY_ID,
  REFUND_PAYMENT_STATUS_FULL,
  REFUND_PAYMENT_STATUS_PARTIAL,
  posRefundIdempotencyKey,
  refundFlowWithinContract,
} from "@/lib/pos/refund-flow-e2e-policy";
import { refundFlowSucceeded } from "@/lib/pos/refund-flow-metrics";
import { refundPosTransaction } from "@/services/pos/pos-refund-service";

describe("refund flow E2E policy (QA-35)", () => {
  it("exports idempotency keys aligned with pos-refund-service", () => {
    expect(REFUND_FLOW_E2E_POLICY_ID).toBe("refund-flow-e2e-v1");
    expect(posRefundIdempotencyKey("tx-qa35", 12.5)).toBe("pos_refund_tx-qa35_partial_1250");
    expect(REFUND_AUDIT_ACTION).toBe("POS_TRANSACTION_REFUNDED");
  });
});

describe("refund flow service contract (QA-35)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.pOSTransaction.findFirst.mockResolvedValue({
      id: "tx-qa35",
      orderId: "ord-qa35",
      status: "COMPLETED",
      total: 20,
      receiptNumber: "POS-QA35",
      externalPaymentReference: null,
      order: { paymentStatus: "PAID" },
    });
    attemptStripePosRefund.mockResolvedValue({
      ok: false,
      skipped: true,
      reason: "NO_PAYMENT_REFERENCE",
    });
    prismaMock.order.update.mockResolvedValue({ id: "ord-qa35" });
    auditLog.mockResolvedValue(undefined);
  });

  it("full cash refund satisfies refund flow contract", async () => {
    const result = await refundPosTransaction({
      userId: "owner-qa35",
      performedByUserId: "manager-qa35",
      transactionId: "tx-qa35",
      reason: "Guest returned entire order",
    });

    expect(result).toEqual({ ok: true });
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: "ord-qa35", userId: "owner-qa35" },
      data: {
        paymentStatus: REFUND_PAYMENT_STATUS_FULL,
        statusDetail: REFUND_PAYMENT_STATUS_FULL,
        notes: "Guest returned entire order",
      },
    });

    const contract = {
      ok: true,
      paymentStatus: REFUND_PAYMENT_STATUS_FULL,
      partialAmount: null,
      stripeSkipped: true,
      auditWritten: true,
    };
    expect(refundFlowWithinContract(contract)).toBe(true);
    expect(refundFlowSucceeded(contract)).toBe(true);
  });

  it("partial refund uses partial idempotency key and payment status", async () => {
    prismaMock.pOSTransaction.findFirst.mockResolvedValue({
      id: "tx-qa35",
      orderId: "ord-qa35",
      status: "COMPLETED",
      total: 20,
      receiptNumber: "POS-QA35",
      externalPaymentReference: "pi_test",
      order: { paymentStatus: "PAID" },
    });
    attemptStripePosRefund.mockResolvedValue({ ok: true, stripeRefundId: "re_qa35" });

    const result = await refundPosTransaction({
      userId: "owner-qa35",
      performedByUserId: "manager-qa35",
      transactionId: "tx-qa35",
      reason: "Partial item return",
      partialAmount: 8,
    });

    expect(result).toEqual({ ok: true });
    expect(attemptStripePosRefund).toHaveBeenCalledWith({
      externalPaymentReference: "pi_test",
      amountCents: 800,
      idempotencyKey: posRefundIdempotencyKey("tx-qa35", 8),
    });
    expect(prismaMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paymentStatus: REFUND_PAYMENT_STATUS_PARTIAL,
        }),
      }),
    );
  });
});

describe("refund flow action RBAC (QA-35)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canUseFeature.mockResolvedValue({ allowed: true });
  });

  it("blocks refund action without pos.refund permission", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Permission denied",
    });

    const result = await posRefundTransactionAction({
      transactionId: "00000000-0000-4000-8000-000000000099",
      reason: "Should be denied",
    });

    expect(result).toEqual({ error: "Permission denied" });
  });
});
