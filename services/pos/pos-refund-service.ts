import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { hasLegacyPermission, normalizeRole } from "@/lib/permissions/legacy";
import { auditLog } from "@/services/audit/audit-service";
import { attemptStripePosRefund } from "@/services/pos/pos-stripe-refund-service";

export type RefundPosResult = { ok: true } | { ok: false; error: string };

/**
 * Mark a POS sale as refunded (MVP — no payment processor reversal).
 * Requires manager/owner `pos_comp`.
 */
export async function refundPosTransaction(params: {
  userId: string;
  performedByUserId: string;
  transactionId: string;
  reason: string;
  partialAmount?: number;
}): Promise<RefundPosResult> {
  const actorProfile = await prisma.userProfile.findUnique({
    where: { id: params.performedByUserId },
    select: { role: true },
  });
  if (!hasLegacyPermission(normalizeRole(actorProfile?.role), "pos_comp")) {
    return { ok: false, error: "Refund requires manager or owner permission." };
  }

  const tx = await prisma.pOSTransaction.findFirst({
    where: { id: params.transactionId, userId: params.userId },
    select: {
      id: true,
      orderId: true,
      status: true,
      total: true,
      receiptNumber: true,
      externalPaymentReference: true,
      order: { select: { paymentStatus: true } },
    },
  });
  if (!tx) return { ok: false, error: "Transaction not found." };
  if (tx.status === "VOIDED") return { ok: false, error: "Cannot refund a voided transaction." };

  const priorPaymentStatus = tx.order.paymentStatus ?? "";
  if (priorPaymentStatus === "REFUNDED") {
    return { ok: false, error: "This sale was already fully refunded." };
  }
  if (priorPaymentStatus === "PARTIALLY_REFUNDED" && params.partialAmount == null) {
    return { ok: false, error: "This sale was already partially refunded. Specify a partial amount." };
  }

  const partial = params.partialAmount;
  if (partial != null && (partial <= 0 || partial > Number(tx.total))) {
    return { ok: false, error: "Partial refund amount is invalid." };
  }

  const paymentStatus = partial != null ? "PARTIALLY_REFUNDED" : "REFUNDED";

  const stripeAttempt = await attemptStripePosRefund({
    externalPaymentReference: tx.externalPaymentReference,
    amountCents: partial != null ? Math.round(partial * 100) : undefined,
    idempotencyKey: `pos_refund_${tx.id}_${partial != null ? `partial_${Math.round(partial * 100)}` : "full"}`,
  });
  if (!stripeAttempt.ok) {
    if ("skipped" in stripeAttempt && stripeAttempt.skipped) {
      // Cash / non-Stripe — local refund only
    } else if ("error" in stripeAttempt) {
      return { ok: false, error: stripeAttempt.error };
    }
  }

  await prisma.order.update({
    where: { id: tx.orderId, userId: params.userId },
    data: {
      paymentStatus,
      statusDetail: paymentStatus,
      notes: params.reason.trim().slice(0, 500) || undefined,
    },
  });

  await auditLog({
    actor: { userId: params.performedByUserId },
    action: AUDIT_ACTIONS.POS_TRANSACTION_REFUNDED,
    category: "ORDERS",
    source: "USER",
    severity: "WARNING",
    entity: { type: "POSTransaction", id: tx.id, label: tx.receiptNumber },
    metadata: {
      orderId: tx.orderId,
      partialAmount: partial ?? null,
      reason: params.reason.slice(0, 200),
      stripeRefundId: stripeAttempt.ok ? stripeAttempt.stripeRefundId : null,
      stripeSkipped: !stripeAttempt.ok && "skipped" in stripeAttempt ? stripeAttempt.reason : null,
    },
    maskPiiInMetadata: true,
  });

  return { ok: true };
}
