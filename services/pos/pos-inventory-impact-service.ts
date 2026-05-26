import { prisma } from "@/lib/prisma";

export async function recordPendingInventoryImpactsForPosOrder(
  userId: string,
  workspaceId: string,
  orderId: string,
) {
  const items = await prisma.orderItem.findMany({
    where: { orderId, order: { userId } },
    select: { id: true, productId: true, quantity: true },
  });
  for (const li of items) {
    if (!li.productId) continue;
    await prisma.posInventoryImpactEvent.create({
      data: {
        userId,
        workspaceId,
        orderId,
        productId: li.productId,
        quantity: li.quantity,
        status: "PENDING_CONFIGURATION",
        note: "POS sale — connect recipes/stock rules to auto-consume inventory.",
      },
    });
  }
}
