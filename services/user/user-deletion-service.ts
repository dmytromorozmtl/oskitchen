import { OrderStatus, SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logDsrExportRequested } from "@/services/dsr/user-data-export-service";

export class AccountDeletionBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountDeletionBlockedError";
  }
}

/**
 * Soft-delete gate: blocks when active orders or paid subscription exist,
 * then marks profile for deletion and queues a DSR export.
 */
export async function requestAccountDeletion(userId: string): Promise<{
  success: true;
  message: string;
}> {
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { deletedAt: true, email: true },
  });
  if (!profile) {
    throw new AccountDeletionBlockedError("Account not found.");
  }
  if (profile.deletedAt) {
    return {
      success: true,
      message: "Account deletion is already scheduled.",
    };
  }

  const activeOrders = await prisma.order.count({
    where: {
      userId,
      status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] },
    },
  });
  if (activeOrders > 0) {
    throw new AccountDeletionBlockedError(
      `Cannot delete account: ${activeOrders} active order(s). Complete or cancel them first.`,
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true, stripeSubscriptionId: true },
  });
  if (
    subscription?.status === SubscriptionStatus.ACTIVE &&
    subscription.stripeSubscriptionId
  ) {
    throw new AccountDeletionBlockedError(
      "Cannot delete account: active subscription exists. Cancel subscription on Billing first.",
    );
  }

  const now = new Date();
  await prisma.userProfile.update({
    where: { id: userId },
    data: {
      deletedAt: now,
      deletionRequestedAt: now,
    },
  });

  await logDsrExportRequested({
    actorUserId: userId,
    targetUserId: userId,
    workspaceId: null,
  }).catch(() => undefined);

  return {
    success: true,
    message:
      "Account deletion scheduled. A data export will be prepared; contact support if you need immediate erasure.",
  };
}
