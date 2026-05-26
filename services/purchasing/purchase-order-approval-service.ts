import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/services/notifications/notification-service";

/**
 * Sends an email to the workspace owner when a PO is submitted for approval.
 *
 * @param args.userId - Tenant owner user id
 * @param args.purchaseOrderId - Purchase order id
 * @param args.orderNumber - Human-readable PO number
 * @param args.supplierName - Supplier display name
 * @param args.total - PO total in workspace currency
 * @param args.actorEmail - Email of the user who submitted (optional)
 */
export async function notifyPurchaseOrderApprovalRequest(args: {
  userId: string;
  purchaseOrderId: string;
  orderNumber: string;
  supplierName: string;
  total: number;
  actorEmail: string | null;
}): Promise<void> {
  const profile = await prisma.userProfile.findUnique({
    where: { id: args.userId },
    select: { email: true },
  });
  const recipient = profile?.email?.trim();
  if (!recipient) return;

  const reason = `PO ${args.orderNumber} (${args.supplierName}) for $${args.total.toFixed(2)} submitted by ${args.actorEmail ?? "team"} — awaiting approval.`;

  await sendNotification({
    userId: args.userId,
    templateKey: "internal_purchase_order_overdue",
    type: "CRON_REMINDER",
    category: "INTERNAL_ALERT",
    channel: "EMAIL",
    recipient,
    variables: {
      reason,
      orderNumber: args.orderNumber,
      supplierName: args.supplierName,
    },
    triggerType: "purchase_order_approval",
    sourceType: "purchase_order",
    sourceId: args.purchaseOrderId,
    dedupeKey: `po-approval:${args.purchaseOrderId}:${new Date().toISOString().slice(0, 10)}`,
    metadata: { purchaseOrderId: args.purchaseOrderId },
  }).catch(() => null);
}
