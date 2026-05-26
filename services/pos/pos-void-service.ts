import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { auditLog } from "@/services/audit/audit-service";

export type VoidPosResult = { ok: true } | { ok: false; error: string };

/**
 * Void a completed POS transaction and linked order (MVP — no payment processor refund).
 * Authorization is enforced by the caller via canonical workspace permissions.
 */
export async function voidPosTransaction(params: {
  userId: string;
  performedByUserId: string;
  transactionId: string;
  reason: string;
}): Promise<VoidPosResult> {
  const tx = await prisma.pOSTransaction.findFirst({
    where: { id: params.transactionId, userId: params.userId },
    select: { id: true, orderId: true, status: true, receiptNumber: true },
  });
  if (!tx) return { ok: false, error: "Transaction not found." };
  if (tx.status === "VOIDED") return { ok: false, error: "Transaction is already voided." };

  await prisma.$transaction([
    prisma.pOSTransaction.update({
      where: { id: tx.id },
      data: { status: "VOIDED" },
    }),
    prisma.order.update({
      where: { id: tx.orderId, userId: params.userId },
      data: {
        paymentStatus: "VOIDED",
        statusDetail: "VOIDED",
        notes: params.reason.trim().slice(0, 500) || undefined,
      },
    }),
  ]);

  await auditLog({
    actor: { userId: params.performedByUserId },
    action: AUDIT_ACTIONS.POS_TRANSACTION_VOIDED,
    category: "ORDERS",
    source: "USER",
    severity: "WARNING",
    entity: { type: "POSTransaction", id: tx.id, label: tx.receiptNumber },
    metadata: {
      orderId: tx.orderId,
      reason: params.reason.slice(0, 200),
    },
    maskPiiInMetadata: true,
  });

  return { ok: true };
}
