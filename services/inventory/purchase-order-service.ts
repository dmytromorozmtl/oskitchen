import { prisma } from "@/lib/prisma";
import { purchaseOrderListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function listRecentPurchaseOrders(userId: string, take = 25) {
  return prisma.purchaseOrder.findMany({
    where: await purchaseOrderListWhereForOwner(userId),
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      requestedDeliveryDate: true,
      updatedAt: true,
    },
  });
}
