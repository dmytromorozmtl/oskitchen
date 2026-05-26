import { prisma } from "@/lib/prisma";

export async function logPosCheckoutAnalytics(
  userId: string,
  workspaceId: string,
  orderId: string,
  total: number,
) {
  await prisma.analyticsEvent.create({
    data: {
      userId,
      workspaceId,
      sourceType: "POS",
      sourceId: orderId,
      eventType: "OTHER",
      metadataJson: { kind: "POS_CHECKOUT", orderId, total },
    },
  });
}
