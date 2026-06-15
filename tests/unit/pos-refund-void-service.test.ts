import { beforeEach, describe, expect, it, vi } from "vitest";

const attemptStripePosRefund = vi.hoisted(() => vi.fn());
const auditLog = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  pOSTransaction: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  order: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
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

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { refundPosTransaction } from "@/services/pos/pos-refund-service";
import { voidPosTransaction } from "@/services/pos/pos-void-service";

describe("POS refund and void services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.pOSTransaction.findFirst.mockResolvedValue({
      id: "tx-1",
      orderId: "ord-1",
      status: "COMPLETED",
      total: 12.5,
      receiptNumber: "POS-ABC-123",
      externalPaymentReference: "pi_123",
      order: { paymentStatus: "PAID" },
    });
    attemptStripePosRefund.mockResolvedValue({ ok: true, stripeRefundId: "re_1" });
    prismaMock.order.update.mockResolvedValue({ id: "ord-1" });
    prismaMock.pOSTransaction.update.mockResolvedValue({ id: "tx-1" });
    prismaMock.$transaction.mockResolvedValue([{ id: "tx-1" }, { id: "ord-1" }]);
    auditLog.mockResolvedValue(undefined);
  });

  describe("refundPosTransaction", () => {
    it("records cash-style local refunds when processor reversal is skipped", async () => {
      prismaMock.pOSTransaction.findFirst.mockResolvedValue({
        id: "tx-1",
        orderId: "ord-1",
        status: "COMPLETED",
        total: 12.5,
        receiptNumber: "POS-ABC-123",
        externalPaymentReference: null,
        order: { paymentStatus: "PAID" },
      });
      attemptStripePosRefund.mockResolvedValue({
        ok: false,
        skipped: true,
        reason: "NO_PAYMENT_REFERENCE",
      });

      const result = await refundPosTransaction({
        userId: "owner-1",
        performedByUserId: "manager-1",
        transactionId: "tx-1",
        reason: "Customer paid cash and requested a refund",
      });

      expect(result).toEqual({ ok: true });
      expect(attemptStripePosRefund).toHaveBeenCalledWith({
        externalPaymentReference: null,
        amountCents: undefined,
        idempotencyKey: "pos_refund_tx-1_full",
      });
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: "ord-1", userId: "owner-1" },
        data: {
          paymentStatus: "REFUNDED",
          statusDetail: "REFUNDED",
          notes: "Customer paid cash and requested a refund",
        },
      });
      expect(auditLog).toHaveBeenCalledWith({
        actor: { userId: "manager-1" },
        action: AUDIT_ACTIONS.POS_TRANSACTION_REFUNDED,
        category: "ORDERS",
        source: "USER",
        severity: "WARNING",
        entity: { type: "POSTransaction", id: "tx-1", label: "POS-ABC-123" },
        metadata: {
          orderId: "ord-1",
          partialAmount: null,
          reason: "Customer paid cash and requested a refund",
          stripeRefundId: null,
          stripeSkipped: "NO_PAYMENT_REFERENCE",
        },
        maskPiiInMetadata: true,
      });
    });

    it("marks partial refunds with Stripe evidence and preserves partial status", async () => {
      const result = await refundPosTransaction({
        userId: "owner-1",
        performedByUserId: "manager-1",
        transactionId: "tx-1",
        reason: "Guest returned one item",
        partialAmount: 5,
      });

      expect(result).toEqual({ ok: true });
      expect(attemptStripePosRefund).toHaveBeenCalledWith({
        externalPaymentReference: "pi_123",
        amountCents: 500,
        idempotencyKey: "pos_refund_tx-1_partial_500",
      });
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: "ord-1", userId: "owner-1" },
        data: {
          paymentStatus: "PARTIALLY_REFUNDED",
          statusDetail: "PARTIALLY_REFUNDED",
          notes: "Guest returned one item",
        },
      });
      expect(auditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AUDIT_ACTIONS.POS_TRANSACTION_REFUNDED,
          metadata: {
            orderId: "ord-1",
            partialAmount: 5,
            reason: "Guest returned one item",
            stripeRefundId: "re_1",
            stripeSkipped: null,
          },
        }),
      );
    });

    it("blocks local refund mutation when the Stripe reversal fails", async () => {
      attemptStripePosRefund.mockResolvedValue({
        ok: false,
        error: "Stripe refund failed",
      });

      const result = await refundPosTransaction({
        userId: "owner-1",
        performedByUserId: "manager-1",
        transactionId: "tx-1",
        reason: "Customer dispute",
      });

      expect(result).toEqual({ ok: false, error: "Stripe refund failed" });
      expect(prismaMock.order.update).not.toHaveBeenCalled();
      expect(auditLog).not.toHaveBeenCalled();
    });

    it("rejects fully automatic refunds after a prior partial refund", async () => {
      prismaMock.pOSTransaction.findFirst.mockResolvedValue({
        id: "tx-1",
        orderId: "ord-1",
        status: "COMPLETED",
        total: 12.5,
        receiptNumber: "POS-ABC-123",
        externalPaymentReference: "pi_123",
        order: { paymentStatus: "PARTIALLY_REFUNDED" },
      });

      const result = await refundPosTransaction({
        userId: "owner-1",
        performedByUserId: "manager-1",
        transactionId: "tx-1",
        reason: "Attempting duplicate full refund",
      });

      expect(result).toEqual({
        ok: false,
        error: "This sale was already partially refunded. Specify a partial amount.",
      });
      expect(attemptStripePosRefund).not.toHaveBeenCalled();
      expect(prismaMock.order.update).not.toHaveBeenCalled();
    });
  });

  describe("voidPosTransaction", () => {
    it("rejects voiding a missing transaction", async () => {
      prismaMock.pOSTransaction.findFirst.mockResolvedValue(null);

      const result = await voidPosTransaction({
        userId: "owner-1",
        performedByUserId: "manager-1",
        transactionId: "tx-404",
        reason: "Wrong receipt",
      });

      expect(result).toEqual({ ok: false, error: "Transaction not found." });
      expect(prismaMock.pOSTransaction.update).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(auditLog).not.toHaveBeenCalled();
    });

    it("rejects voiding an already voided transaction", async () => {
      prismaMock.pOSTransaction.findFirst.mockResolvedValue({
        id: "tx-1",
        orderId: "ord-1",
        status: "VOIDED",
        receiptNumber: "POS-ABC-123",
      });

      const result = await voidPosTransaction({
        userId: "owner-1",
        performedByUserId: "manager-1",
        transactionId: "tx-1",
        reason: "Duplicate void",
      });

      expect(result).toEqual({ ok: false, error: "Transaction is already voided." });
      expect(prismaMock.pOSTransaction.update).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
      expect(auditLog).not.toHaveBeenCalled();
    });

    it("voids the transaction, updates the order, and writes a warning audit event", async () => {
      const result = await voidPosTransaction({
        userId: "owner-1",
        performedByUserId: "manager-1",
        transactionId: "tx-1",
        reason: "Entered on the wrong register",
      });

      expect(result).toEqual({ ok: true });
      expect(prismaMock.pOSTransaction.update).toHaveBeenCalledWith({
        where: { id: "tx-1" },
        data: { status: "VOIDED" },
      });
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: "ord-1", userId: "owner-1" },
        data: {
          paymentStatus: "VOIDED",
          statusDetail: "VOIDED",
          notes: "Entered on the wrong register",
        },
      });
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(auditLog).toHaveBeenCalledWith({
        actor: { userId: "manager-1" },
        action: AUDIT_ACTIONS.POS_TRANSACTION_VOIDED,
        category: "ORDERS",
        source: "USER",
        severity: "WARNING",
        entity: { type: "POSTransaction", id: "tx-1", label: "POS-ABC-123" },
        metadata: {
          orderId: "ord-1",
          reason: "Entered on the wrong register",
        },
        maskPiiInMetadata: true,
      });
    });
  });
});
