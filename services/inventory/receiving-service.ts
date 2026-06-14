import { prisma } from "@/lib/prisma";

export async function listRecentReceivingEventsForUser(userId: string, take = 25) {
  return prisma.receivingEvent.findMany({
    where: { purchaseOrder: { userId } },
    orderBy: { receivedAt: "desc" },
    take,
    select: {
      id: true,
      receivedAt: true,
      purchaseOrderId: true,
      ingredientId: true,
      receivedQuantity: true,
      unit: true,
    },
  });
}
